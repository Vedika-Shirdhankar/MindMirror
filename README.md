# MindMirror 🪞

An AI companion that remembers your emotional journey and helps you see how far you've come.

## What it does

MindMirror is a mental wellness web app built around **emotional memory** — when you share a struggle, the AI surfaces similar past moments you survived, helping you see patterns of resilience rather than getting lost in catastrophic thinking.

### Features

| Feature | Description |
|---|---|
| 🤖 **AI Companion** | Warm, emotionally intelligent chat that surfaces past memories |
| 📓 **Journal** | Log entries with mood score, emotional themes, and coping strategies |
| 🕐 **Timeline** | Visual emotional history grouped by month |
| 📊 **Patterns** | Recurring theme detection with radar + bar charts |
| 🌱 **Growth Dashboard** | Mood trend chart, recovery stats, and coping effectiveness |
| 🪜 **Thought Ladder** | Break down catastrophic thinking into facts vs predictions |
| 💌 **Future Letters** | Write messages to yourself for hard times |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open `http://localhost:5173`

### 3. Get an API key

Get a free Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)

Enter it in the app's **Settings** page. The key is stored only in your browser.

---

## Build for production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages).

---

## Tech stack

- **React 18** + **Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Anthropic Claude API** for AI features
- **localStorage** for data persistence (no backend needed)

---

## Privacy

All your data lives in your browser's `localStorage`. Nothing is stored on any server. The only external calls made are to Anthropic's API when you use the AI companion, thought ladder, or pattern insights — and only the content of your messages is sent (not your name or other personal details).

You can delete all data anytime from Settings.

---

## Project structure

```
src/
  lib/
    store.js       ← localStorage data layer + analytics helpers
    companion.js   ← Anthropic API calls (chat, thought ladder, insights)
  pages/
    Companion.jsx  ← AI chat interface
    Journal.jsx    ← Entry writing and listing
    Timeline.jsx   ← Month-by-month emotional history
    Patterns.jsx   ← Theme frequency charts + AI insights
    Growth.jsx     ← Stats dashboard and mood trend
    ThoughtLadder.jsx ← Cognitive distortion breakdown tool
    FutureLetters.jsx ← Letters to future self
    Settings.jsx   ← API key, privacy, data management
    Onboarding.jsx ← First-time setup flow
  components/
    Layout.jsx     ← Sidebar navigation
  styles/
    globals.css    ← Custom CSS + Tailwind directives
```

---

## Extending the project

**Add a backend**: Replace `store.js` with API calls to a FastAPI + PostgreSQL backend for cross-device sync and proper user accounts.

**Semantic memory**: Add vector embeddings (pgvector) so the AI retrieves semantically similar past entries rather than keyword-matching.

**Push notifications**: Remind users to journal daily using browser notifications.

**Mood check-in widget**: A minimal daily mood log without requiring full journal entries.

---

Built with ❤️ as a portfolio project exploring emotional AI and mental wellness.
