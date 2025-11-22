# Smart Email Triage Tool - Complete Project Files

This document provides a complete overview of all key files in the project, organized by component.

## Table of Contents

1. [Backend Core Files](#backend-core-files)
2. [Backend Services (AI)](#backend-services-ai)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Core Files](#frontend-core-files)
5. [Sample Data & Scripts](#sample-data--scripts)
6. [Testing](#testing)

---

## Backend Core Files

### backend/app/main.py

FastAPI application entry point with CORS, database initialization, and route registration.

### backend/app/database.py

SQLAlchemy database configuration with session management.

### backend/app/models.py

SQLAlchemy ORM models:
- `User`: id, email, name
- `Email`: id, user_id, provider_id, from_name, from_email, to_email, subject, body_text, received_at, is_read
- `TriageResult`: id, email_id, priority, category, suggested_actions (JSON), reply_draft, reason, created_at

### backend/app/schemas.py

Pydantic schemas for API request/response validation:
- `Email`, `EmailWithTriage`
- `TriageRequest`, `TriageResponse`
- `DraftReplyResponse`

### backend/app/routers/emails.py

REST API endpoints:
- `GET /emails` - List emails with filters
- `GET /emails/{id}` - Get single email
- `POST /emails/triage` - Triage emails
- `POST /emails/{id}/draft-reply` - Generate reply draft

---

## Backend Services (AI)

### backend/app/services/llm_client.py

Generic LLM client supporting:
- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic (Claude)
- Mock mode (for testing)

Key function: `call_ai_model(system_prompt, user_message, model, temperature)`

### backend/app/services/ai_client.py

AI agent wrappers:
- `call_triage_agent(email)` - Analyzes email, returns triage results
- `call_reply_draft_agent(email)` - Generates reply draft

Uses the system prompt and LLM client to process emails.

### backend/app/services/TRIAGE_SYSTEM_PROMPT_FINAL.txt

Complete system prompt for the triage agent:
- Defines 5 priority levels (P0-Critical to P4-Spam)
- Defines 7 categories
- Lists 12 fixed actions
- Includes 5 few-shot examples
- Enforces JSON-only output

---

## Backend Configuration

### backend/app/config.py

Configuration module that:
- Loads `.env` file
- Provides `Settings` class
- Supports multiple AI providers
- Manages API keys

### backend/.env.example

Template for environment variables:
- `AI_PROVIDER` (openai/anthropic/mock)
- `AI_MODEL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DATABASE_URL`

---

## Frontend Core Files

### frontend/src/App.tsx

Main React component:
- Manages application state
- Handles API calls
- Three-panel layout (Filters | List | Detail)
- Filter state management

### frontend/src/components/Filters.tsx

Sidebar filter component:
- Priority filters (All, P0-P4)
- Category filters (All, 7 categories)
- Visual priority indicators with colors

### frontend/src/components/EmailList.tsx

Email list display:
- Shows subject, from, time
- Priority and category badges
- Unread indicators
- Click to select

### frontend/src/components/EmailDetail.tsx

Email detail panel:
- Full email content
- Triage information display
- Suggested actions as buttons
- "Generate AI Reply Draft" button
- Editable draft textarea

### frontend/src/api/client.ts

API client with TypeScript types:
- `getEmails(priority?, category?)`
- `getEmail(id)`
- `generateDraftReply(id)`

---

## Sample Data & Scripts

### backend/sample_emails.json

20 diverse sample emails covering:
- Work/Projects (5)
- Deadlines/Meetings (2)
- Personal (4)
- Finance/Bills (2)
- Notifications/Updates (4)
- Newsletters/Promotions (3)
- Spam/Phishing (3)

### backend/load_sample_emails.py

Python script to load sample emails:
- Reads JSON file
- Creates user if needed
- Inserts emails into database
- Skips duplicates

### backend/populate_sample_data.py

Alternative sample data script (original implementation).

---

## Testing

### backend/tests/conftest.py

Pytest fixtures:
- `db_session` - Fresh database for each test
- `client` - FastAPI TestClient
- `sample_user`, `sample_emails` - Test data
- `mock_triage_agent`, `mock_reply_draft_agent` - AI mocks

### backend/tests/test_emails_list.py

Tests for `GET /emails`:
- List all emails
- Filter by priority
- Filter by category
- Response structure validation

### backend/tests/test_emails_get.py

Tests for `GET /emails/{id}`:
- Get single email
- Handle 404 errors
- Response validation

### backend/tests/test_triage.py

Tests for `POST /emails/triage`:
- Triage specific emails
- Triage all untriaged emails
- Verify AI agent is called
- Verify database updates

### backend/tests/test_draft_reply.py

Tests for `POST /emails/{id}/draft-reply`:
- Generate draft reply
- Verify AI agent is called
- Save draft to triage result

---

## Key Features Implemented

✅ **Email Storage**: SQLite database with SQLAlchemy ORM
✅ **AI Triage Agent**: LLM-based classification with system prompt
✅ **Priority Levels**: P0-Critical through P4-Spam
✅ **Categories**: 7 categories (Work, Deadlines, Personal, etc.)
✅ **Suggested Actions**: 12 fixed actions
✅ **Reply Drafting**: AI-generated reply drafts
✅ **REST API**: Full CRUD operations with filtering
✅ **Frontend UI**: React with TypeScript, Tailwind CSS
✅ **Filtering**: By priority and category
✅ **Testing**: Comprehensive test suite with mocks
✅ **Configuration**: Environment-based config
✅ **Sample Data**: 20 diverse sample emails

---

## Setup & Run

### Backend
```bash
cd backend
pip install -r requirements.txt
python -c "from app.database import init_db; init_db()"
python load_sample_emails.py
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend
pytest
```

---

## Architecture Highlights

1. **Modular Design**: Clear separation between models, services, routers
2. **Generic LLM Client**: Easy to switch between AI providers
3. **Mock Mode**: Works without API keys for development
4. **Type Safety**: TypeScript frontend, Pydantic backend
5. **Test Coverage**: Comprehensive tests with mocked AI
6. **Extensible**: Easy to add new email providers, AI models, features

---

## Next Steps

1. Add real email provider integration (Gmail API)
2. Add user authentication
3. Add real-time email sync
4. Add analytics dashboard
5. Deploy to production

---

**Project Status**: ✅ Complete and ready for hackathon demo

