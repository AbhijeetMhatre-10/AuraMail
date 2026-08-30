# AuraMail — Intelligent AI Email Assistant

A production-ready full-stack AI-powered Intelligent Email Assistant built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB Atlas**, **Google OAuth 2.0 / Gmail API**, and **Google Gemini AI** (`@google/genai`).

---

## 🌟 Overview & Highlights

AuraMail connects to your Gmail account to provide a modern, responsive inbox experience enhanced by Google Gemini AI.

- **Smart Executive Summaries**: Instant bulleted summaries and key takeaways of email threads.
- **Context-Aware AI Replies**: Draft replies with tone control (**Professional**, **Friendly**, **Formal**, **Concise**).
- **AI Polish & Rewriter**: Real-time grammar correction, clarity improvements, and custom rewriting instructions.
- **Explain This Email**: Plain-English breakdowns of dense, ambiguous, or technical emails with sender intent and decoded jargon.
- **Urgency & Priority Scoring**: Automated 0–100 priority calculation based on deadlines and requested actions.
- **Advisory Spam & Phishing Shield**: Deep security analysis highlighting phishing indicators, domain mismatches, and urgent financial demands.
- **Voice-to-Email**: Native browser speech-to-text with Gemini AI transcript cleanup and auto-generated subject lines.
- **Smart Natural Language Search**: Translates natural language questions (e.g., *"Show unread invoices from last week"*) into structured Gmail queries and filters.
- **AES-256-GCM Credential Encryption**: OAuth tokens and secrets remain strictly on the backend and are encrypted at rest.
- **Isolated Zero-Setup Demo Sandbox**: Explore all AI capabilities immediately with realistic seed emails without requiring Google Cloud Console setup.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, TanStack Query v5, Framer Motion, React Router v7, DOMPurify |
| **Backend** | Node.js, Express, TypeScript, REST API, Zod, Helmet, Cookie-Parser, Rate-Limiting |
| **Database** | MongoDB Atlas / Local MongoDB with Mongoose |
| **Authentication** | Google OAuth 2.0 + HTTP-Only JWT Session Cookies |
| **Email Integration** | Gmail API v1 (via `googleapis`) |
| **AI Integration** | Google Gemini API (exclusively using `@google/genai`) |
| **Security** | AES-256-GCM authenticated encryption for OAuth access & refresh tokens at rest |

---

## 🚀 Quick Start (Instant Demo Mode — Zero Setup)

You can run and test the complete application immediately using the isolated **Demo Mode**:

```bash
# 1. Install dependencies across root, backend, and frontend
npm run install:all

# 2. Start development servers concurrently
npm run dev
```

1. Open your browser at **[http://localhost:5173](http://localhost:5173)**.
2. Click **"Launch Demo Mailbox"** to explore realistic seed emails (Board Meeting RFP, Stripe Billing Receipt, Phishing Security Alert, Mobile UI Designs) and test all Gemini AI features live.

---

## ⚙️ Environment Variables Configuration

### Backend (`backend/.env`)

Create `backend/.env` (or copy from `backend/.env.example`):

```ini
# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (MongoDB Atlas or Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/intelligent_email_assistant

# Security & Encryption Keys
SESSION_SECRET=your_jwt_session_secret_key_minimum_32_characters_long
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Google OAuth 2.0 & Gmail Integration (Leave blank to use Demo Mode)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5001/api/auth/google/callback

# Google Gemini AI API Key (@google/genai)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (`frontend/.env`)

```ini
VITE_API_BASE_URL=/api
```

---

## 🔑 Setting Up Google Cloud & Gemini API

### 1. Google Cloud Console (Gmail API & OAuth 2.0)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `AuraMail Assistant`).
3. Navigate to **APIs & Services > Library**, search for **Gmail API**, and click **Enable**.
4. Navigate to **APIs & Services > OAuth consent screen**:
   - User Type: **External**
   - App Name: `AuraMail`
   - User Support Email: your email
   - Add Scopes: `.../auth/gmail.modify`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
   - Test Users: Add your personal Google account email.
5. Navigate to **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application Type: **Web Application**.
   - Name: `AuraMail Web Client`.
   - Authorized JavaScript origins: `http://localhost:5173`, `http://localhost:5001`.
   - Authorized redirect URIs: `http://localhost:5001/api/auth/google/callback`.
6. Copy the generated **Client ID** and **Client Secret** into `backend/.env`.

### 2. Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API Key** and generate a new API key.
3. Paste the key as `GEMINI_API_KEY` in `backend/.env`.

---

## 📂 Project Structure

```
email/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & MongoDB connection
│   │   ├── controllers/     # Express HTTP request controllers
│   │   ├── integrations/
│   │   │   ├── gemini/      # Google Gemini client (@google/genai)
│   │   │   └── google/      # Google OAuth & Gmail API client
│   │   ├── jobs/            # In-process scheduled daily briefing jobs
│   │   ├── middleware/      # Auth, rate limiting, validation & error handler
│   │   ├── models/          # Mongoose schemas (User, Email, AIAnalysis, Activity, etc.)
│   │   ├── routes/          # REST API route definitions
│   │   ├── services/        # Business logic, sync, AI orchestrator, demo store
│   │   ├── utils/           # AES-256-GCM encryption, MIME parser, response formatters
│   │   ├── app.ts           # Express application setup
│   │   └── server.ts        # Bootstrap & server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/          # AISummaryCard, AIInsightPanel, ToneSelector, VoiceInput, etc.
│   │   │   ├── common/      # EmptyState, ErrorState, LoadingSkeletons
│   │   │   ├── compose/     # ComposeModal, ReplyGenerator
│   │   │   ├── email/       # EmailList, EmailListItem, ThreadView, EmailMessage, InboxToolbar
│   │   │   ├── layout/      # AppShell, SidebarNavigation, Header
│   │   │   ├── search/      # SearchBar, SmartSearchPanel
│   │   │   └── ui/          # Button, Input, Modal, Badge, Toast, Avatar, Skeleton
│   │   ├── context/         # AuthContext, ComposeContext, ToastContext
│   │   ├── pages/           # InboxPage, EmailDetailPage, SearchPage, ComposePage, SettingsPage, etc.
│   │   ├── routes/          # AppRoutes with ProtectedRoute wrapper
│   │   ├── services/api/    # Typed API client services
│   │   ├── types/           # TypeScript interfaces & enums
│   │   ├── App.tsx          # Root React component
│   │   └── main.tsx         # DOM root
│   ├── package.json
│   └── vite.config.ts
├── SPECS.md                 # Authoritative Spec Sheet
└── package.json             # Root workspace script manager
```

---

## 📡 REST API Documentation

All API endpoints are prefixed with `/api`.

### Authentication & Account
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check and environment status |
| `GET` | `/api/auth/google/start` | Initiates Google OAuth consent flow |
| `GET` | `/api/auth/google/callback` | OAuth redirect callback handler |
| `POST` | `/api/auth/demo-login` | Authenticates isolated demo session |
| `GET` | `/api/auth/me` | Returns current authenticated user profile |
| `POST` | `/api/auth/logout` | Clears session cookie and invalidates session |
| `GET` | `/api/account` | Connected Gmail account details |
| `POST` | `/api/account/sync` | Triggers mailbox synchronization |
| `DELETE` | `/api/account` | Disconnects connected Gmail account |

### Emails & Threads
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/emails` | List emails with folder, category, priority, and unread filters |
| `GET` | `/api/emails/:id` | Fetch single email with populated AI analysis |
| `GET` | `/api/threads/:id` | Fetch full chronological conversation thread |
| `POST` | `/api/emails/:id/read` | Mark message as read |
| `POST` | `/api/emails/:id/unread` | Mark message as unread |
| `POST` | `/api/emails/:id/star` | Star email message |
| `DELETE` | `/api/emails/:id/star` | Unstar email message |
| `POST` | `/api/emails/:id/archive` | Archive email message |
| `DELETE` | `/api/emails/:id` | Move email message to Trash |
| `POST` | `/api/emails/send` | Send new outgoing email via Gmail API |
| `POST` | `/api/emails/:id/reply` | Send threaded reply |
| `POST` | `/api/emails/:id/reply-all`| Send threaded reply-all |

### Google Gemini AI Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/summarize` | Generate concise executive summary & quick replies |
| `POST` | `/api/ai/reply` | Generate context-aware reply draft with tone styling |
| `POST` | `/api/ai/classify` | Classify email into category (Work, Finance, Urgent, etc.) |
| `POST` | `/api/ai/analyze` | Comprehensive analysis (Priority score, Category, Phishing check) |
| `POST` | `/api/ai/priority` | Urgency, priority score (0-100), and deadline extraction |
| `POST` | `/api/ai/spam-phishing`| Advisory spam and phishing threat risk analysis |
| `POST` | `/api/ai/subject` | Suggest effective subject line alternatives |
| `POST` | `/api/ai/rewrite` | Grammar correction & tone rewriting (Professional, Friendly, Formal, Concise) |
| `POST` | `/api/ai/explain` | Explain email content in plain English with sender intent |
| `POST` | `/api/ai/voice-polish` | Clean up spoken transcripts and generate subject lines |
| `GET` | `/api/ai/history` | Audit log of past AI analyses and operations |

### Search & Activity
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search` | Standard keyword search across subject, body, senders |
| `GET` | `/api/search/smart` | Natural language smart search interpreted by Gemini |
| `GET` | `/api/activity` | Retrieve user and AI activity audit timeline |

---

## 🧪 Testing & Verification

Run the automated test suite with Vitest:

```bash
# Run backend test suite
npm test --prefix backend

# Or run from root
npm test
```

### Build Check
```bash
# Verify complete production build
npm run build
```

---

## 🛡️ Security Best Practices Implemented

1. **Credential Encryption at Rest**: AES-256-GCM authenticated encryption encrypts Google OAuth tokens before saving to database.
2. **Server-Side Token Isolation**: Raw access tokens, refresh tokens, and Gemini API keys are never sent to or stored in client-side localStorage.
3. **HTTP-Only Cookies**: Application sessions use strict HTTP-only, SameSite cookies.
4. **HTML Sanitization**: All inbound email HTML bodies are sanitized with DOMPurify to mitigate XSS vectors.
5. **Rate Limiting**: Rate limits applied to authentication and AI generation endpoints.
6. **Isolated Demo Tenancy**: Demo sessions operate in a segregated sandbox partition, preventing any cross-contamination with real accounts.

---

## 🔧 Troubleshooting

- **Google OAuth Redirect Error (`redirect_uri_mismatch`)**:
  - Ensure `http://localhost:5001/api/auth/google/callback` is explicitly listed under **Authorized redirect URIs** in Google Cloud Console.
- **Gemini API Key Issues**:
  - Ensure `GEMINI_API_KEY` is set in `backend/.env`. If omitted, the application uses smart local fallbacks so the UI remains fully functional.
- **Microphone Permission in Voice-to-Email**:
  - Web Speech API requires browser microphone permissions. Click the lock/settings icon in your browser address bar to enable microphone access.
- **MongoDB Connection Error**:
  - Ensure MongoDB is running locally or provide a valid MongoDB Atlas connection string in `MONGODB_URI`.
