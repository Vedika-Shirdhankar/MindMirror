# 🧠 MindMirror

MindMirror is an AI/ML-powered mental wellness and self-reflection platform designed to help users understand their emotions, manage overthinking, and build healthier thought patterns.

The application combines a fine-tuned **DistilBERT text-classification model** for language pattern detection, **Google Gemini** for empathetic conversational analysis and journaling reflections, emotional analytics, thought reframing, future self-reflection, and mindfulness games into a single interactive experience.

---

## 🏛️ System Architecture

```text
React Frontend (Vite)
       │
       ▼ (POST /api/journal)
Node.js / Express Backend
       │
 ┌─────┴─────────────────────────┬──────────────────────────┐
 │                               │                          │
 ▼                               ▼                          ▼
Python ML Microservice      Google Gemini AI           MongoDB Atlas
(FastAPI + Transformers)    (Contextual Analysis)      (Persistent Storage)
 │                               │                          │
Fine-Tuned DistilBERT       Themes, triggers,          User journals,
(7-class language signal)   coping suggestions,        embeddings,
                            summary & affirmations     chats, & videos
 └─────┬─────────────────────────┴──────────────────────────┘
       ▼
Combined Response (ML Signal + Gemini Contextual Reflection)
       │
       ▼
React UI (Non-diagnostic, supportive reflection display)
```

---

## 🤖 Dual AI/ML Design: DistilBERT & Google Gemini

| Feature | Fine-Tuned DistilBERT (ML Service) | Google Gemini (AI Engine) |
|---|---|---|
| **Role** | Text classification & language signal detection | Conversational interpretation & qualitative reasoning |
| **Output** | 7 discrete classes & softmax probability distribution | Empathetic summary, themes, triggers, coping strategies, affirmations |
| **Classes** | `anxiety`, `normal`, `depression`, `stress`, `personality disorder`, `bipolar`, `suicidal` | Open-ended CBT-informed reflection & thought reframing |
| **Location** | Local PyTorch model in `ml/mindmirror_distilbert_model/` | Google Generative AI API (`@google/generative-ai`) |

### 🛡️ Safety & Non-Diagnostic Principle
The DistilBERT model provides **text-classification signals only** for journaling reflection. It is **never** presented to the user as a medical diagnosis. The UI uses cautious, supportive language such as:
> *"Your journal contains language associated with stress (Confidence: 87%)"*

---

## 📂 Project Structure

```text
mindmirror/
├── ml/                                 # Python ML Inference Microservice & Training
│   ├── MindMirror_ML_Training.ipynb    # Model training notebook (DistilBERT)
│   ├── Mental_Health_Condition_Classification.csv # Dataset
│   ├── mindmirror_distilbert_model/    # Saved fine-tuned model weights & tokenizer
│   │   ├── config.json
│   │   ├── model.safetensors
│   │   ├── tokenizer.json
│   │   ├── tokenizer_config.json
│   │   └── labels.json
│   ├── app.py                          # FastAPI inference service (GET /health, POST /predict)
│   └── requirements.txt                # Python dependencies
│
├── backend/                            # Node.js / Express API
│   ├── backend/
│   │   ├── config/                     # Centralized configurations & env loaders
│   │   ├── controllers/                # Route handlers (journal, chat, video, etc.)
│   │   ├── middleware/                 # Auth JWT, rate limiters, error handling
│   │   ├── models/                     # Mongoose schemas (JournalEntry with ml_analysis)
│   │   ├── routes/                     # API route declarations
│   │   ├── services/                   # mlService.js, hfService.js, storageService.js
│   │   ├── utils/                      # aiAnalysis.js (Gemini), embeddings, vectorSearch
│   │   ├── tests/                      # Jest unit & integration tests
│   │   └── server.js                   # Express server bootstrap
│
├── src/                                # React + Vite Frontend
│   ├── components/                     # Reusable UI components
│   ├── context/                        # React context providers
│   ├── lib/                            # API client & shared constants (api.js)
│   ├── pages/                          # Application views (Journal, Companion, Dashboard, etc.)
│   └── styles/                         # Global styles & Tailwind
│
├── package.json                        # Frontend package config
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/backend/.env`)
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindmirror
JWT_SECRET=your_long_random_jwt_secret_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=http://localhost:5173

# Python DistilBERT ML Microservice
ML_SERVICE_URL=http://localhost:8000
```

---

## 🚀 Development Setup & Running

To run the complete full-stack application, open three terminal windows:

### Terminal 1: Python ML Inference Service
```bash
cd ml
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```
*Health check:* `http://localhost:8000/health`  
*Swagger docs:* `http://localhost:8000/docs`

### Terminal 2: Node.js Backend API
```bash
cd backend/backend
npm install
npm run dev
```
*Server runs on:* `http://localhost:4000`

### Terminal 3: React Frontend UI
```bash
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd backend/backend
npm run test:unit
```

### ML Service Health & Prediction Test
```bash
# Test health
curl http://localhost:8000/health

# Test prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I feel overwhelmed with too many exams and deadlines."}'
```

---

## 👩‍💻 Author

**Vedika Shirdhankar**  
Computer Science Engineering Student  
Sardar Patel Institute of Technology (SPIT)

---

## 📜 License

This project is intended for educational, research, and personal wellness development purposes.
