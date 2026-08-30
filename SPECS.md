# Intelligent Email Assistant
Spec-Driven Development (SDD) Specification
Version: 1.0
Status: Proposed / Implementation Blueprint
Primary goal: Build a production-oriented AI email assistant using React, Express, MongoDB, Gmail API, and Google Gemini.

## 1. Project Overview & Tech Stack

Build a full-stack AI-powered Intelligent Email Assistant that connects to a user's Gmail account through Google OAuth, provides a modern inbox experience, supports reading, searching, threading, composing and sending email, and adds AI capabilities for summarization, replies, classification, prioritization, spam/phishing analysis, rewriting, explanation, smart search, categorization, and voice-to-email.

### Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Motion, TanStack Query, React Router.
- Backend: Node.js, Express, TypeScript, REST API.
- Database: MongoDB Atlas with Mongoose.
- Authentication: Google OAuth 2.0 with server-side token handling.
- Email integration: Gmail API.
- AI integration: Google Gemini API.
- Async/scheduled work: lightweight in-process scheduling where required; no Redis or BullMQ in the initial architecture.
- Repository structure: one repository containing separate frontend/ and backend/ applications.

## 2. Scope & Feature Classification

### Core / Must-Have

1. Email account connection using Gmail OAuth.
1. Secure authentication and protected application access.
1. Email dashboard / inbox.
1. View and read emails.
1. Email threads.
1. Email search.
1. Mark read/unread, star/unstar, archive, and delete.
1. AI email summarization.
1. AI-generated replies.
1. Review and edit AI-generated replies before sending.
1. Email composition.
1. Email sending.
1. Email history / activity.
1. Frontend-backend REST integration.
1. Environment variable configuration.
1. Security practices.
1. Working deployed application.

### Included AI Features / Bonus

1. AI email classification.
1. Automatic priority detection.
1. Spam/phishing detection.
1. Important email detection.
1. AI-generated subject lines.
1. Tone selection: Professional, Friendly, Formal, Concise.
1. Grammar correction and email rewriting.
1. Explain This Email.
1. Smart AI email search.
1. AI-based email categorization.
1. Voice-to-email.
1. AI-powered inbox prioritization.

### Good to Have

- Bulk email management. This must not block completion of the core scope.

## 3. Product Principles

- The specification is the source of truth for implementation.
- User-triggered actions must have predictable loading, success, and error states.
- AI output is advisory and must be reviewable before any consequential email action.
- OAuth tokens and other secrets must remain server-side.
- The backend owns Gmail and Gemini credentials and external API communication.
- Controllers remain thin; business logic belongs in services.
- The application should remain a modular monolith rather than introducing microservices.
- New infrastructure must not be added unless a requirement justifies it.

## 4. Authentication & Gmail OAuth

The application must authenticate users through Google OAuth 2.0 and establish an application session after successful authorization. Gmail permissions must be limited to the scopes required by implemented functionality.

### Required behavior

- Provide a login/connect-Gmail entry point.
- Redirect the user to Google's consent flow.
- Handle the OAuth callback on the backend.
- Validate the OAuth response and establish the authenticated application session.
- Store Gmail access/refresh credentials only on the backend.
- Encrypt sensitive credentials at rest using an application-level encryption key.
- Refresh expired access tokens when a refresh token is available.
- Expose authenticated-user information through a protected /api/auth/me endpoint.
- Support logout and session invalidation.
- Do not expose Google client secrets or raw tokens to the browser.
- Return explicit authentication/integration errors rather than silently failing.

## 5. Email Dashboard / Inbox

The inbox is the primary application workspace. It must display the user's Gmail messages in a modern, responsive interface and expose AI-derived metadata where available.
- Show inbox messages with sender, subject, preview, timestamp, read/unread state, star state, and relevant category/priority indicators.
- Support pagination or cursor-based loading.
- Allow opening a message or thread.
- Support mark read/unread, star/unstar, archive, and delete.
- Provide refresh/synchronization feedback.
- Surface AI priority and category information without making the interface visually noisy.
- Provide empty, loading, error, and no-results states.

## 6. Email Threads & Reading

- Group related Gmail messages by thread.
- Display messages in chronological conversation order.
- Allow expanding/collapsing individual messages where appropriate.
- Display sender and recipient metadata.
- Render email content safely.
- Clearly distinguish quoted/previous content when the Gmail API provides it.
- Provide actions for reply, archive, delete, star, and mark read/unread.
- Show AI tools from the reading view without disrupting the normal email experience.

## 7. Search

### Normal email search

Support user-entered Gmail-compatible search behavior through the backend Gmail integration, while protecting the API from arbitrary unsafe requests.

### Smart AI search

Allow a user to express intent in natural language. Gemini should interpret the request into a constrained search strategy rather than directly executing arbitrary actions.
- Example intent: find unread messages from a person.
- Example intent: find emails about a project or invoice.
- Example intent: find messages that appear deadline-related.
- The backend validates the generated search strategy before querying Gmail or the locally indexed application data.
- Search results must identify whether they are based on Gmail query matching, application metadata, or AI-derived filters.
- The initial implementation does not require a vector database.

## 8. Email Composition & Sending

- Provide a compose interface for recipients, subject, body, and reply context.
- Support reply and reply-all where supported by the Gmail API implementation.
- Allow AI-generated subject lines.
- Allow AI-generated replies.
- Allow tone selection: Professional, Friendly, Formal, Concise.
- Allow grammar correction and rewriting.
- Allow Explain/Improve actions without automatically sending.
- Require the user to review the final body before sending.
- Send email through Gmail API from the authenticated account.
- Show sending, success, and failure states.
- Record send activity in application history.

## 9. AI Architecture

Gemini is the sole AI provider for this project. The backend must isolate Gemini-specific calls behind an AI service so controllers and email services do not depend directly on the provider SDK.

### AI capabilities

- Summarization: concise summary of an email/thread.
- Reply generation: context-aware draft reply.
- Classification: classify messages into configured categories.
- Priority detection: derive priority from urgency, sender/context, deadlines, and requested action.
- Spam/phishing analysis: provide a risk assessment and explain signals; do not represent the result as a guaranteed security verdict.
- Important email detection: identify messages likely requiring attention.
- Subject generation: generate suitable subject options.
- Tone transformation: rewrite content for the selected tone.
- Grammar correction: correct grammar while preserving intended meaning.
- Email rewriting: improve clarity and structure.
- Explain This Email: explain content, intent, requests, deadlines, and important entities in plain language.
- Smart AI search: translate natural-language intent into constrained search parameters.
- AI categorization: assign a category and confidence metadata.
- Voice-to-email: convert spoken input to text, then optionally use Gemini to structure, rewrite, and generate a subject.
- Inbox prioritization: combine stored AI signals into a user-facing priority ordering.

## 10. AI Safety & Data Handling

- AI-generated content must be clearly labeled as AI-generated.
- AI replies must remain editable before sending.
- AI analysis must not silently modify Gmail messages.
- Do not send an email solely because Gemini generated a draft.
- Prompts should include only the email data necessary for the requested operation.
- Do not include OAuth credentials, application secrets, or unrelated user data in prompts.
- Handle malformed or unsafe model output gracefully.
- Prefer structured JSON responses for classification, priority, extraction, and analysis tasks.
- Validate structured model output before storing or returning it.
- Store useful AI results to avoid unnecessary repeated analysis where appropriate.

## 11. AI Analysis Model

When an email is analyzed, the persisted AI result may contain structured fields such as:
{
  summary,
  category,
  priority,
  importance,
  spamRisk,
  phishingRisk,
  actionItems,
  deadlines,
  generatedSubject,
  analysisVersion,
  analyzedAt
}
Exact field names and enums must be finalized during schema implementation. Confidence values must be treated as model estimates, not guarantees.

## 12. Voice-to-Email

- Request microphone permission only when the user activates voice input.
- Convert speech to text using a browser-supported speech-to-text capability or a separately selected speech service.
- Populate the compose editor with the recognized text.
- Allow the user to edit the transcript.
- Optionally pass the transcript to Gemini for cleanup, tone transformation, and subject generation.
- Never send directly from voice input without user review.
- Handle unsupported browsers, denied microphone permissions, empty transcripts, and recognition failures gracefully.

## 13. Backend Architecture

The backend is a single Express application organized into clear responsibilities. This is a modular monolith: one deployable backend, multiple logical modules.
- Routes: define HTTP endpoints and attach middleware.
- Controllers: parse requests and shape responses; do not contain business logic or direct MongoDB access.
- Services: own business logic and coordinate models, Gmail, Gemini, OAuth, encryption, and history.
- Models: Mongoose schemas and database access.
- Integrations: wrappers around Gmail and Gemini provider APIs.
- Middleware: authentication, validation, error handling, security, and request context.
- Utils: reusable helpers such as encryption, normalization, parsing, and response utilities.
- Jobs: lightweight scheduled operations only where required; avoid distributed queue infrastructure in the initial release.
- Config: environment loading, validation, database connection, and application configuration.

## 14. Database Collections

### Users

- Stores application identity and profile data such as Google subject ID, email, display name, avatar URL, last login, createdAt, updatedAt.

### ConnectedAccounts

- Stores Gmail connection metadata, provider, Google account identifiers, scopes, encrypted access/refresh tokens, token expiry, connection state, and timestamps.

### Emails

- Stores application-side email metadata/cache where needed: Gmail message ID, thread ID, account ID, sender/recipients, subject, snippet/body representation as appropriate, labels, read/star state, received timestamp, sync metadata, and AI analysis references.

### EmailThreads

- Stores thread-level metadata and synchronization information when thread persistence is useful.

### AIAnalyses

- Stores AI-generated analysis associated with an email/thread, analysis type/version, structured result, confidence metadata, provider/model metadata where appropriate, and timestamps.

### EmailActivities

- Stores user/application actions such as read, unread, star, archive, delete, compose, AI generation, and send events.

### DailySummaries

- If daily summaries are implemented, stores the generated summary, source time window, account, generation metadata, and timestamp.
The implementation should avoid duplicating the entire Gmail mailbox unnecessarily. MongoDB persistence should support the product experience, AI metadata, history, and efficient local operations while Gmail remains the authoritative email provider for mailbox actions.

## 15. API Endpoints

### Health & Auth

- GET /api/health – service health check.
- GET /api/auth/google/start – start Google OAuth flow.
- GET /api/auth/google/callback – process OAuth callback.
- GET /api/auth/me – return authenticated user.
- POST /api/auth/logout – invalidate the application session.

### Emails

- GET /api/emails – list inbox/search results.
- GET /api/emails/:id – fetch an email.
- GET /api/threads/:id – fetch a thread.
- POST /api/emails/:id/read – mark read.
- POST /api/emails/:id/unread – mark unread.
- POST /api/emails/:id/star – star.
- DELETE /api/emails/:id/star – unstar.
- POST /api/emails/:id/archive – archive.
- DELETE /api/emails/:id – delete.
- GET /api/search – normal email search.
- GET /api/search/smart – natural-language AI search.

### Compose & Send

- POST /api/emails/send – send a new email.
- POST /api/emails/:id/reply – send a reply.
- POST /api/emails/:id/reply-all – send a reply-all where supported.

### AI

- POST /api/ai/summarize – summarize an email/thread.
- POST /api/ai/reply – generate a reply draft.
- POST /api/ai/classify – classify an email.
- POST /api/ai/analyze – run structured email analysis.
- POST /api/ai/priority – calculate/display priority analysis.
- POST /api/ai/spam-phishing – analyze spam/phishing risk.
- POST /api/ai/subject – generate subject suggestions.
- POST /api/ai/rewrite – grammar correction/rewrite with selected tone.
- POST /api/ai/explain – explain an email.
- POST /api/ai/categorize – generate category information.
- GET /api/ai/history – list relevant AI activity/results.

### History & Settings

- GET /api/activity – fetch email/application activity.
- GET /api/account – fetch connected account details.
- POST /api/account/sync – request a mailbox synchronization.
- DELETE /api/account – disconnect the Gmail account and revoke/clear stored credentials as supported.

## 16. API Design Rules

- All endpoints are prefixed with /api.
- Use consistent JSON response shapes.
- Use HTTP status codes according to outcome.
- Validate path parameters, query parameters, and request bodies.
- Return safe user-facing errors without leaking provider credentials or stack traces.
- Controllers must not call Mongoose models directly when a service layer is applicable.
- External provider failures must be normalized into application-level errors.
- AI endpoints must enforce authenticated ownership of requested email/thread data.

## 17. Frontend Pages

- / – Landing page or authenticated redirect.
- /login – Google sign-in/connect experience.
- /auth/callback – frontend OAuth completion handling if needed.
- /inbox – primary inbox dashboard.
- /email/:id – individual email/thread reading view.
- /search – normal and smart search experience.
- /compose – compose email.
- /sent – sent mail view if included in the mailbox navigation.
- /starred – starred messages.
- /archive – archived messages.
- /activity – email and AI activity history.
- /settings – connected account, security/session, preferences, and AI settings.

### Primary UI components

- AppShell
- SidebarNavigation
- InboxToolbar
- EmailList
- EmailListItem
- ThreadView
- EmailMessage
- SearchBar
- SmartSearchPanel
- ComposeModal / ComposePage
- AIInsightPanel
- AISummaryCard
- PriorityBadge
- CategoryBadge
- ReplyGenerator
- ToneSelector
- RewriteEditor
- ExplainEmailPanel
- VoiceInput
- ActivityTimeline
- LoadingSkeletons
- Toast/Notification components

## 18. Frontend State & Data Management

- TanStack Query manages server state, caching, mutations, invalidation, and request lifecycle.
- React local state manages ephemeral UI state such as compose drafts, open panels, selected messages, and modal state.
- Do not introduce a global state library unless a demonstrated requirement emerges.
- API calls must be centralized through a typed API client/service layer.
- Authentication state must be derived from the server session rather than trusting arbitrary client-side identity data.
- Use optimistic updates only for actions where rollback is reliable.

## 19. Frontend UX Requirements

- Modern, clean email-client aesthetic rather than a direct Gmail visual clone.
- Responsive desktop-first layout with usable tablet/mobile behavior.
- Use shadcn/ui primitives consistently.
- Use Motion for purposeful transitions, not excessive animation.
- Provide skeleton/loading states for inbox, thread, search, and AI operations.
- Provide clear empty states.
- Provide clear errors with retry actions where appropriate.
- Show AI-generated content in visually distinct but integrated panels.
- Use confirmation for destructive actions when appropriate.
- Keyboard accessibility should be considered for primary inbox and compose actions.
- Maintain readable typography and strong visual hierarchy.

## 20. Security Requirements

- Keep Google OAuth client secrets and Gemini API keys in environment variables.
- Never expose provider secrets to the frontend.
- Encrypt OAuth access and refresh tokens at rest using CREDENTIAL_ENCRYPTION_KEY.
- Never log decrypted access tokens, refresh tokens, client secrets, or Gemini API keys.
- Use helmet for security headers.
- Restrict CORS to the configured frontend origin.
- Validate request bodies, query parameters, and path parameters.
- Apply rate limiting to authentication and AI endpoints as appropriate.
- Use secure session cookies or an equivalently protected server-side session mechanism.
- Use HTTPS in production.
- Enforce ownership checks so one authenticated user cannot access another user's emails, AI results, or activity.
- Sanitize/render email HTML safely to reduce XSS risk.
- Do not trust AI output as executable instructions.
- Normalize and safely handle Gmail/provider errors.
- Use least-privilege Gmail OAuth scopes required by the implemented features.

## 21. Environment Variables

# Backend
PORT=
NODE_ENV=
CLIENT_URL=
MONGODB_URI=
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GEMINI_API_KEY=
CREDENTIAL_ENCRYPTION_KEY=

# Frontend
VITE_API_BASE_URL=
Exact variable names may be refined during implementation, but secrets must remain backend-only. A .env.example file must document required variables without containing real credentials.

## 22. Error Handling

- Central Express error middleware must normalize unexpected errors.
- Provider errors should map to clear application-level codes such as AUTH_REQUIRED, AUTH_EXPIRED, GMAIL_API_ERROR, AI_PROVIDER_ERROR, VALIDATION_ERROR, RATE_LIMITED, NOT_FOUND, and INTERNAL_ERROR.
- Frontend must display human-readable messages and preserve enough context for retry.
- AI failures must not corrupt email drafts or silently send content.
- OAuth failures must return a recoverable connection state.
- Database failures must surface as service errors without exposing connection strings or stack traces.

## 23. Synchronization Strategy

Gmail remains the source of truth for mailbox state. The backend may cache message metadata and AI analysis in MongoDB to support performance and product features.
- Provide explicit mailbox synchronization through a backend service.
- Use Gmail message/thread identifiers as stable external identifiers.
- Upsert synchronized messages rather than blindly inserting duplicates.
- Refresh or re-fetch messages when an operation requires authoritative state.
- After mutations such as read/star/archive/delete/send, update Gmail first and then synchronize local state.
- Keep synchronization logic isolated in gmailService/syncService.

## 24. Scheduled / Background Work

The initial project does not use Redis or BullMQ. If scheduled work is required, use a lightweight in-process scheduler in the backend.
- Scheduled jobs must be idempotent where practical.
- Do not run duplicate schedules when multiple server instances are deployed unless the deployment architecture explicitly guarantees a single worker instance.
- Daily summaries, if implemented, should be generated through a controlled scheduled service.
- If scale or reliability requirements later justify a queue, Redis/BullMQ can be introduced as a future architectural upgrade rather than part of the initial implementation.

## 25. Folder Structure

### Repository

project/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── ...
├── backend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── .env.example
│   └── ...
└── README.md

### Frontend

frontend/
└── src/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── email/
    │   ├── ai/
    │   ├── search/
    │   └── compose/
    ├── pages/
    ├── routes/
    ├── hooks/
    ├── services/
    │   └── api/
    ├── lib/
    ├── types/
    ├── utils/
    ├── App.tsx
    └── main.tsx

### Backend

backend/
└── src/
    ├── config/
    │   ├── env.ts
    │   └── db.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   ├── email.routes.ts
    │   ├── thread.routes.ts
    │   ├── ai.routes.ts
    │   ├── search.routes.ts
    │   └── activity.routes.ts
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── email.controller.ts
    │   ├── thread.controller.ts
    │   ├── ai.controller.ts
    │   ├── search.controller.ts
    │   └── activity.controller.ts
    ├── services/
    │   ├── auth.service.ts
    │   ├── gmail.service.ts
    │   ├── email.service.ts
    │   ├── thread.service.ts
    │   ├── ai.service.ts
    │   ├── search.service.ts
    │   ├── sync.service.ts
    │   └── activity.service.ts
    ├── integrations/
    │   ├── google/
    │   │   └── gmail.client.ts
    │   └── gemini/
    │       └── gemini.client.ts
    ├── models/
    │   ├── User.ts
    │   ├── ConnectedAccount.ts
    │   ├── Email.ts
    │   ├── EmailThread.ts
    │   ├── AIAnalysis.ts
    │   ├── EmailActivity.ts
    │   └── DailySummary.ts
    ├── middleware/
    │   ├── auth.middleware.ts
    │   ├── validation.middleware.ts
    │   ├── error.middleware.ts
    │   └── rateLimit.middleware.ts
    ├── jobs/
    │   └── dailySummary.job.ts
    ├── utils/
    │   ├── encryption.ts
    │   ├── errors.ts
    │   └── ...
    ├── app.ts
    └── server.ts

## 26. Development Phases

### Phase 1 — Foundation

- Create frontend and backend applications.
- Configure TypeScript, Vite, Express, Tailwind, shadcn/ui, Motion, and TanStack Query.
- Configure environment validation.
- Connect MongoDB Atlas.
- Implement base Express middleware and error handling.
- Implement Google OAuth and protected session flow.
- Create initial AppShell and authenticated routing.
- Acceptance: user can sign in, reach the authenticated shell, and backend health/database checks work.

### Phase 2 — Gmail Integration & Inbox

- Implement Gmail client.
- Implement token storage/encryption/refresh.
- Implement inbox listing and synchronization.
- Implement email/thread retrieval.
- Implement read/unread, star, archive, and delete.
- Implement normal search.
- Acceptance: user can manage real Gmail messages through the application.

### Phase 3 — Compose & Send

- Implement compose UI.
- Implement reply/reply-all where supported.
- Implement send-email API.
- Implement activity history.
- Acceptance: user can compose, edit, and send email from the connected Gmail account.

### Phase 4 — Core AI

- Integrate Gemini service.
- Implement summarization.
- Implement AI reply generation.
- Implement editable reply workflow.
- Implement subject generation.
- Implement tone selection.
- Implement grammar correction/rewrite.
- Acceptance: every AI-generated draft is reviewable and editable before sending.

### Phase 5 — AI Intelligence

- Implement classification and categorization.
- Implement priority and importance analysis.
- Implement spam/phishing risk analysis.
- Implement Explain This Email.
- Implement AI-powered inbox prioritization.
- Persist AI analysis with version metadata.
- Acceptance: inbox and reading views expose useful AI intelligence without blocking normal email operations.

### Phase 6 — Smart Search & Voice

- Implement natural-language smart search.
- Constrain and validate AI-generated search strategies.
- Implement voice-to-email.
- Integrate voice transcript into compose.
- Acceptance: users can search by natural language and create a draft from voice.

### Phase 7 — Polish, Security & Deployment

- Responsive UI polish.
- Loading/skeleton/empty/error states.
- Accessibility pass.
- Security hardening.
- Rate limiting and CORS configuration.
- Production environment configuration.
- Deployment of frontend, backend, and MongoDB Atlas connectivity.
- Production OAuth redirect configuration.
- End-to-end smoke testing.
- Acceptance: deployed application supports the defined core flows reliably.

### Phase 8 — Good-to-Have

- Implement bulk email management only after all core and included AI features are complete.
- Add selection, bulk archive, bulk delete, bulk read/unread, and bulk star operations where supported.

## 27. Testing Requirements

- Unit test important services and utilities.
- Test authentication and authorization boundaries.
- Test Gmail integration with mocked provider responses.
- Test AI service with mocked Gemini responses.
- Test malformed AI output and provider failures.
- Test email ownership checks.
- Test destructive email actions.
- Test compose/send/reply flows.
- Test core frontend loading/error/empty states.
- Run linting and TypeScript checks before each completed phase.
- Perform deployed smoke tests for OAuth, inbox loading, AI actions, and sending.

## 28. Final Expected Outcome

The completed application must provide a polished intelligent email workspace where a user can connect Gmail securely, browse and manage their inbox, read threaded conversations, search email, compose and send messages, and use Gemini-powered assistance throughout the workflow. AI features must include summarization, reply generation, classification, prioritization, spam/phishing analysis, important-email detection, subject generation, tone transformation, grammar correction, rewriting, explanation, smart search, categorization, voice-to-email, and inbox prioritization. The application must be deployed and usable through a real frontend-backend-Gmail-MongoDB-Gemini integration.

## 29. AI Coding Agent / Vibe Coding Instructions

- Treat this SDD as the primary implementation contract.
- Build phase by phase in the order defined above.
- Do not invent major features, dependencies, architecture, or infrastructure outside this specification without explicitly flagging the change.
- Keep frontend and backend as separate applications under frontend/ and backend/.
- Use React + TypeScript + Vite on the frontend.
- Use Node.js + Express + TypeScript on the backend.
- Use MongoDB Atlas + Mongoose.
- Use Google OAuth 2.0 and Gmail API for email integration.
- Use Gemini as the AI provider.
- Do not add NestJS, Redis, BullMQ, LangChain, LangGraph, Socket.IO, or microservices unless a later approved specification explicitly requires them.
- Keep controllers thin.
- Keep business logic in services.
- Keep Gmail and Gemini SDK/provider calls behind integration/service boundaries.
- Never access MongoDB directly from a controller.
- Never expose provider credentials to the frontend.
- Never store OAuth tokens in localStorage.
- Never log decrypted credentials.
- Validate all external and model-generated data.
- Never send AI-generated email without explicit user confirmation through the send action.
- Preserve user edits to AI-generated drafts.
- Use typed request/response models wherever practical.
- Prefer reusable components over duplicated UI logic.
- Use TanStack Query for server-state operations.
- Use Motion only for meaningful UI transitions.
- Keep AI prompts versioned or centrally defined so behavior can be maintained.
- Store AI analysis with a version so future prompt/model changes do not make historical data ambiguous.
- At the end of every development phase, report: files created, files changed, dependencies added, environment variables added, completed requirements, known limitations, and verification/test results.
- If implementation encounters an ambiguity, identify the ambiguity and choose the smallest behavior consistent with this SDD rather than silently expanding scope.

## 30. Definition of Done

- Core features are implemented and manually verified.
- Included AI features are implemented and manually verified.
- Frontend and backend communicate through the documented REST API.
- Google OAuth works with a configured production redirect URI.
- Gmail read and write operations work for the connected account.
- Gemini-powered operations work with configured credentials.
- MongoDB persistence works in the deployed environment.
- Sensitive credentials are protected.
- TypeScript compilation and linting pass.
- Important error and loading states are implemented.
- README contains local setup, environment variables, OAuth configuration, development commands, deployment instructions, and troubleshooting.
- Production deployment is reachable and core user flows have been smoke-tested.