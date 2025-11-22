# Smart Email Triage Tool - Complete Project Structure

## Project Overview

This is a full-stack web application that uses AI to automatically classify, prioritize, and help manage emails. The system consists of a FastAPI backend, React frontend, SQLite database, and an AI agent powered by LLMs.

## Project Structure

```
mrit/
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── config.py                 # Configuration & environment variables
│   │   ├── database.py               # Database setup & session management
│   │   ├── models.py                  # SQLAlchemy models (User, Email, TriageResult)
│   │   ├── schemas.py                 # Pydantic schemas for API validation
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── emails.py              # Email API endpoints
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── ai_client.py           # AI agent wrapper (triage & reply)
│   │       ├── llm_client.py          # Generic LLM client (OpenAI/Anthropic/Mock)
│   │       └── TRIAGE_SYSTEM_PROMPT_FINAL.txt  # System prompt for triage agent
│   ├── tests/                         # Test suite
│   │   ├── __init__.py
│   │   ├── conftest.py                # Pytest fixtures
│   │   ├── test_emails_list.py        # Tests for GET /emails
│   │   ├── test_emails_get.py         # Tests for GET /emails/{id}
│   │   ├── test_triage.py             # Tests for POST /triage
│   │   ├── test_draft_reply.py        # Tests for POST /draft-reply
│   │   └── test_ai_client_mocking.py  # Tests for AI mocking
│   ├── sample_emails.json             # Sample email data (20 emails)
│   ├── load_sample_emails.py          # Script to load sample data
│   ├── load_sample_emails_sql.sql     # SQL script alternative
│   ├── populate_sample_data.py        # Original sample data script
│   ├── requirements.txt               # Python dependencies
│   ├── pytest.ini                     # Pytest configuration
│   ├── .env.example                   # Environment variables template
│   └── README.md                       # Backend documentation
│
├── frontend/                          # React + TypeScript frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts              # API client & TypeScript types
│   │   ├── components/
│   │   │   ├── Filters.tsx            # Sidebar filter component
│   │   │   ├── EmailList.tsx          # Email list component
│   │   │   └── EmailDetail.tsx        # Email detail panel
│   │   ├── App.tsx                    # Main application component
│   │   ├── main.tsx                   # React entry point
│   │   └── index.css                  # Global styles (Tailwind)
│   ├── index.html                     # HTML template
│   ├── package.json                   # Node.js dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── vite.config.ts                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   └── README.md                       # Frontend documentation
│
├── README.md                          # Main project README
└── PROJECT_STRUCTURE.md               # This file
```

## Key Files Explained

### Backend Core Files

**backend/app/main.py**
- FastAPI application initialization
- CORS middleware configuration
- Database initialization on startup
- Router registration
- Health check endpoint

**backend/app/config.py**
- Loads environment variables from `.env` file
- Provides `Settings` class with all configuration
- Supports multiple AI providers (OpenAI, Anthropic, Mock)

**backend/app/database.py**
- SQLAlchemy engine and session factory
- Database initialization function
- Database dependency for FastAPI routes

**backend/app/models.py**
- `User` model: id, email, name
- `Email` model: id, user_id, from_name, from_email, to_email, subject, body_text, received_at, is_read
- `TriageResult` model: id, email_id, priority, category, suggested_actions (JSON), reply_draft, reason, created_at

**backend/app/schemas.py**
- Pydantic models for request/response validation
- `Email`, `EmailWithTriage`, `TriageRequest`, `TriageResponse`, `DraftReplyResponse`

**backend/app/routers/emails.py**
- `GET /emails` - List emails with optional filters
- `GET /emails/{id}` - Get single email with triage result
- `POST /emails/triage` - Trigger triage for emails
- `POST /emails/{id}/draft-reply` - Generate AI reply draft

**backend/app/services/llm_client.py**
- Generic `call_ai_model()` function
- Supports OpenAI, Anthropic, and Mock providers
- Unified interface for all LLM calls

**backend/app/services/ai_client.py**
- `call_triage_agent(email)` - Analyzes email and returns triage results
- `call_reply_draft_agent(email)` - Generates reply draft
- Uses system prompt and LLM client
- Handles errors and validation

**backend/app/services/TRIAGE_SYSTEM_PROMPT_FINAL.txt**
- Complete system prompt for the triage agent
- Defines priority levels (P0-P4), categories, actions
- Includes 5 few-shot examples
- Enforces JSON-only output

### Frontend Core Files

**frontend/src/App.tsx**
- Main application component
- Manages state (emails, filters, selected email)
- Handles API calls and filter changes
- Three-panel layout (Filters | List | Detail)

**frontend/src/components/Filters.tsx**
- Sidebar with priority and category filters
- Priority: All, P0 (Red), P1 (Orange), P2 (Blue), P3 (Grey), P4 (Dark Grey)
- Category: All, Work/Projects, Deadlines/Meetings, Personal, Finance/Bills, Notifications/Updates, Newsletters/Promotions, Spam

**frontend/src/components/EmailList.tsx**
- Displays list of emails
- Shows priority badges, category labels, unread indicators
- Click to select email

**frontend/src/components/EmailDetail.tsx**
- Full email content display
- Triage information (priority, category, reason)
- Suggested actions as buttons
- "Generate AI Reply Draft" button with textarea

**frontend/src/api/client.ts**
- Axios-based API client
- TypeScript types for Email, TriageResult, etc.
- API methods: `getEmails()`, `getEmail()`, `generateDraftReply()`

## Data Flow

1. **Email Storage**: Emails stored in SQLite database via SQLAlchemy
2. **Triage Trigger**: User calls `POST /emails/triage` or it's triggered automatically
3. **AI Processing**: 
   - Email formatted according to system prompt
   - Sent to LLM via `call_ai_model()`
   - Response parsed as JSON
   - TriageResult saved to database
4. **Frontend Display**: 
   - Fetches emails via `GET /emails`
   - Filters by priority/category
   - Displays triage results with badges
5. **Reply Drafting**: 
   - User clicks "Generate AI Reply Draft"
   - Calls `POST /emails/{id}/draft-reply`
   - AI generates draft, displayed in textarea

## Priority Levels

- **P0-Critical** (Red): Urgent, time-sensitive, blocks work
- **P1-High** (Orange): Important, time-bound, handle today/tomorrow
- **P2-Normal** (Blue): Routine, handle this week
- **P3-Low** (Grey): Newsletters, promotions, optional
- **P4-Spam** (Dark Grey): Spam, scams, delete

## Categories

- Work/Projects
- Deadlines/Meetings
- Personal
- Finance/Bills
- Notifications/Updates
- Newsletters/Promotions
- Spam

## Suggested Actions (Fixed List)

- Reply now
- Reply today
- Reply this week
- Add to task list
- Add to calendar
- Pay bill
- Mark as read
- Move to Promotions
- Unsubscribe
- Mark as spam
- Delete
- Star/Pin email

## API Endpoints

### GET /emails
- Query params: `priority`, `category`
- Returns: List of emails with triage results

### GET /emails/{id}
- Returns: Single email with triage result

### POST /emails/triage
- Body: `{"email_ids": [1, 2, 3]}` or `{}` for all untriaged
- Returns: Triage results

### POST /emails/{id}/draft-reply
- Returns: Draft reply text

## Environment Variables

See `backend/.env.example` for all available options:
- `AI_PROVIDER`: openai, anthropic, or mock
- `AI_MODEL`: Model name (e.g., gpt-4, claude-3-opus)
- `OPENAI_API_KEY`: OpenAI API key (if using OpenAI)
- `ANTHROPIC_API_KEY`: Anthropic API key (if using Anthropic)
- `DATABASE_URL`: Database connection string

## Testing

Run tests with:
```bash
cd backend
pytest
```

All tests use mocked AI functions and in-memory database.

## Next Steps for Production

1. **Real Email Integration**: Add Gmail API or IMAP support
2. **Authentication**: Add user authentication and authorization
3. **Multi-user**: Support multiple users with separate inboxes
4. **Real-time Updates**: WebSocket support for live email sync
5. **Advanced AI**: Fine-tune models for better accuracy
6. **Analytics**: Track triage accuracy and user behavior

