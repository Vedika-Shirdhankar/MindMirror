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
import tempfile
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException, status, File, UploadFile
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

# Faster-Whisper state
whisper_model = None
whisper_available: bool = False

try:
    from faster_whisper import WhisperModel
    whisper_available = True
except ImportError:
    whisper_available = False
    logger.info("faster_whisper not installed — local audio transcription endpoint will be optional.")


def get_whisper_model():
    global whisper_model, whisper_available
    if not whisper_available:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="faster_whisper package is not installed on this server.",
        )
    if whisper_model is None:
        model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny")
        compute_type = "float16" if torch.cuda.is_available() else "int8"
        dev_str = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Loading Faster-Whisper model ({model_size}) on {dev_str} ({compute_type})...")
        whisper_model = WhisperModel(model_size, device=dev_str, compute_type=compute_type)
        logger.info("Faster-Whisper model successfully loaded.")
    return whisper_model


def load_model_and_labels():
    global tokenizer, model, id2label

    # ── Auto-download weights from Hugging Face Hub if missing ───────────────
    # model.safetensors is gitignored (255 MB). On Render (or any fresh deploy),
    # we download it at startup using the HF_MODEL_REPO + HF_TOKEN env vars.
    weights_path = os.path.join(MODEL_DIR, "model.safetensors")
    hf_repo = os.getenv("HF_MODEL_REPO")   # e.g. "Vedika16S/mindmirror-distilbert"
    hf_token = os.getenv("HF_TOKEN")        # HF read token (secret on Render)

    if not os.path.exists(weights_path) and hf_repo:
        logger.info(f"model.safetensors not found locally — downloading from HF Hub: {hf_repo}")
        try:
            from huggingface_hub import snapshot_download
            snapshot_download(
                repo_id=hf_repo,
                local_dir=MODEL_DIR,
                token=hf_token,
                ignore_patterns=["*.msgpack", "flax_model*", "tf_model*", "rust_model*"],
            )
            logger.info("HF Hub download complete.")
        except Exception as dl_err:
            logger.error(f"Failed to download model from HF Hub: {dl_err}")
            raise RuntimeError(f"Model weights missing and HF Hub download failed: {dl_err}") from dl_err
    elif not os.path.exists(weights_path) and not hf_repo:
        raise RuntimeError(
            "model.safetensors not found and HF_MODEL_REPO env var is not set. "
            "Set HF_MODEL_REPO=Vedika16S/mindmirror-distilbert (and HF_TOKEN if private) on Render."
        )
    # ─────────────────────────────────────────────────────────────────────────

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


class TranscribeRequest(BaseModel):
    file_path: Optional[str] = Field(None, description="Local path to audio/video file")
    language: Optional[str] = Field(None, description="Language code e.g. 'en'")


class TranscribeResponse(BaseModel):
    text: str
    language: str
    duration: float
    segments: List[Dict[str, Any]]


@app.get("/health")
def health_check():
    """Health check endpoint to verify service and model availability."""
    is_loaded = tokenizer is not None and model is not None and len(id2label) > 0
    return {
        "status": "ok",
        "modelLoaded": is_loaded,
        "device": str(device),
        "numClasses": len(id2label),
        "whisperAvailable": whisper_available,
        "whisperLoaded": whisper_model is not None,
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


def run_whisper_transcription(target_path: str, language: Optional[str] = None) -> TranscribeResponse:
    w_model = get_whisper_model()
    if not target_path or not os.path.exists(target_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio/video file not found at path: {target_path}",
        )
    try:
        segments_generator, info = w_model.transcribe(
            target_path,
            language=language,
            beam_size=5,
            vad_filter=True,
        )

        segments_list = []
        full_text_parts = []
        for seg in segments_generator:
            segments_list.append({
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
            })
            full_text_parts.append(seg.text.strip())

        full_text = " ".join(full_text_parts)

        return TranscribeResponse(
            text=full_text,
            language=info.language or "en",
            duration=round(info.duration, 2),
            segments=segments_list,
        )
    except Exception as err:
        logger.error(f"Whisper transcription error: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(err)}",
        )


@app.post("/transcribe", response_model=TranscribeResponse)
def transcribe_audio_path(payload: TranscribeRequest):
    """
    Offline Audio/Video transcription using Faster-Whisper (CTranslate2).
    Accepts local file_path in JSON request body.
    """
    if not payload.file_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="file_path field is required in request body.",
        )
    return run_whisper_transcription(payload.file_path, payload.language)


@app.post("/transcribe-upload", response_model=TranscribeResponse)
async def transcribe_audio_file(
    file: UploadFile = File(...),
    language: Optional[str] = None,
):
    """
    Offline Audio/Video transcription using Faster-Whisper (CTranslate2).
    Accepts direct binary multipart file upload.
    """
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".webm"
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_path = tmp.name
        return run_whisper_transcription(temp_path, language)
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
