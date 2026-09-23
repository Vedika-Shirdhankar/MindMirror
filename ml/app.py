"""
app.py — FastAPI ML inference service for MindMirror DistilBERT Text Classification.

Exposes:
  - GET  /health   -> { status: "ok", modelLoaded: true }
  - POST /predict  -> { label: str, confidence: float, scores: dict[str, float] }

Safety Notice:
  This service provides text-pattern classification signals for journaling reflection.
  It is NOT a medical/diagnostic system.
"""

import os
import json
import logging
from contextlib import asynccontextmanager
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("mindmirror-ml")

# Resolve model path relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(BASE_DIR, "mindmirror_distilbert_model"))

# Global model state
tokenizer: Optional[AutoTokenizer] = None
model: Optional[AutoModelForSequenceClassification] = None
id2label: Dict[int, str] = {}
device: torch.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_model_and_labels():
    global tokenizer, model, id2label

    logger.info(f"Loading model from: {MODEL_DIR} (Device: {device})")
    if not os.path.exists(MODEL_DIR):
        raise RuntimeError(f"Model directory not found at: {MODEL_DIR}")

    # 1. Load label mapping
    labels_file = os.path.join(MODEL_DIR, "labels.json")
    if os.path.exists(labels_file):
        with open(labels_file, "r", encoding="utf-8") as f:
            label_data = json.load(f)
            if "id2label" in label_data:
                id2label = {int(k): v for k, v in label_data["id2label"].items()}
            elif "label2id" in label_data:
                id2label = {int(v): k for k, v in label_data["label2id"].items()}
        logger.info(f"Loaded {len(id2label)} labels from labels.json")

    # 2. Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

    # 3. Load sequence classification model
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    model.to(device)
    model.eval()

    # Fallback to model config if labels.json was not loaded
    if not id2label and hasattr(model.config, "id2label") and model.config.id2label:
        id2label = {int(k): v for k, v in model.config.id2label.items()}

    logger.info(f"Model successfully loaded. Labels: {id2label}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        load_model_and_labels()
    except Exception as e:
        logger.error(f"Failed to load DistilBERT model during startup: {e}")
    yield
    # Shutdown
    logger.info("Shutting down MindMirror ML service.")


app = FastAPI(
    title="MindMirror DistilBERT Inference Service",
    description="Fine-tuned text classification service for journaling pattern detection",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    text: str = Field(..., description="Journal text to analyze")


class PredictResponse(BaseModel):
    label: str
    confidence: float
    scores: Dict[str, float]


@app.get("/health")
def health_check():
    """Health check endpoint to verify service and model availability."""
    is_loaded = tokenizer is not None and model is not None and len(id2label) > 0
    return {
        "status": "ok",
        "modelLoaded": is_loaded,
        "device": str(device),
        "numClasses": len(id2label),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    """
    Run sequence classification on the provided journal text.
    Returns the top predicted class, confidence, and all softmax class probabilities.
    """
    global tokenizer, model, id2label

    if tokenizer is None or model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model is not loaded or unavailable.",
        )

    text = payload.text.strip() if payload.text else ""
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Journal text must not be empty.",
        )

    try:
        # Tokenize with DistilBERT max length truncation
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = F.softmax(logits, dim=-1)[0]

        top_prob, top_idx = torch.max(probs, dim=-1)
        top_idx_int = top_idx.item()
        predicted_label = id2label.get(top_idx_int, f"class_{top_idx_int}")
        confidence = round(top_prob.item(), 4)

        # Build class scores map
        scores = {}
        for idx, prob in enumerate(probs):
            lbl = id2label.get(idx, f"class_{idx}")
            scores[lbl] = round(prob.item(), 4)

        return PredictResponse(
            label=predicted_label,
            confidence=confidence,
            scores=scores,
        )

    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Inference error: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(err)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
