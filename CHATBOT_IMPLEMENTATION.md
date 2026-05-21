# Chatbot Implementation (TrendsWave)

This document explains the product-focused chatbot added to TrendsWave: design, key files, how it works, testing steps, and suggested next steps.

## Goals

- Provide a lightweight, bandwidth-efficient assistant for product lookup, availability checks, and simple styling recommendations.
- Use a retrieval-first approach: parse intent -> convert to filters -> query MongoDB -> return compact product objects.
- Keep the frontend responsive and race-free using `AbortController` and request-id checks.

## High-level Flow

1. Frontend sends a JSON payload (`message`, `limit`) to `POST /api/chat`.
2. Backend `chatbot.service.js` orchestrates:
   - Optionally call an LLM (Gemini) to get a structured plan; fallback to the local parser.
   - Normalize colors/categories via `chatbotMappings.js`.
   - Build a MongoDB query with a tight projection (only necessary fields).
   - Return a human-friendly answer string and an array of compact product objects.

3. Frontend displays the assistant message and small product cards. Rapid user inputs abort previous requests.

## Key Files

- `backend/src/routes/chat.routes.js` — Express route that accepts chat messages.
- `backend/src/services/chatbot/chatbot.service.js` — Orchestrator: parse plan, query DB, format answer.
- `backend/src/services/chatbot/chatbot.intent.js` — Local intent parser and query builder (`buildLocalPlan`, `buildMongoQuery`, `formatAnswer`).
- `backend/src/data/chatbotMappings.js` — Color & category synonyms and query limits.
- `frontend/src/Components/Common/Chatbot/ChatWidget.jsx` — Floating widget UI, wired to Redux.
- `frontend/src/redux/slices/chatSlice.js` — Redux slice with `sendChat` async thunk handling requests and cancellations.
- `frontend/src/redux/hooks/useChat.js` — Hook that exposes `messages`, `status`, and `send()` (returns `AbortController`).

## Intent Parsing & Compatibility

- The parser supports three intents: `availability`, `recommendation`, and `search`.
- It detects colors, categories, and gender using data-driven mappings.
- For style questions like "which jeans looks good with black shirt", the parser detects the pattern "which <target> ... with <context>" and treats `<target>` as the retrieval category (jeans) and derives context color from `<context>` (black).
- The query builder expands a context color to a small set of compatible colors (e.g., black -> [blue, gray, black, white]) to increase recall for recommended matches.

### Intent Parsing Workflow (step-by-step)

1. Receive raw user message (e.g. "which jeans looks good with black shirt for men").
2. Normalize message (lowercase, trim) and run simple detectors:
   - `detectColor()` — matches known color aliases from `chatbotMappings`.
   - `detectCategory()` — matches category aliases (e.g., "jeans" -> `Bottom Wear`).
   - `detectGender()` — extracts gender keywords (men/women).
   - `detectIntent()` — classifies into `availability`, `recommendation`, or `search` using rule-based patterns.
3. Check the special compatibility pattern `which <target> ... with <context>`:
   - If present, treat `<target>` as the retrieval category (what we should return) and extract color/attributes from `<context>` (what to match against).
4. Build a `plan` object with fields like:
   - `intent` — one of `availability | recommendation | search`.
   - `filters` — normalized filters (e.g., `category: 'Bottom Wear'`, `contextColor: 'black'`, `gender: 'Men'`).
   - `search` — original message for free-text fallback.
   - `needsFollowUp` — boolean and `followUpQuestion` when more info is needed.
5. The `plan` is returned to the orchestrator (`chatbot.service.js`) to produce a Mongo query and a human-friendly answer.

### How the backend turns the plan into results

1. `buildMongoQuery(plan)` converts `plan.filters` into a MongoDB query:
   - Category filters create `$or` checks against `category`, `name`, and `description` fields.
   - Color filters use `$in` with case-insensitive regexes; when `contextColor` is present the query expands to compatible colors.
   - Gender, brand, material, price ranges are also applied when present.
2. The service executes the query with a tight `.select()` projection that returns only compact product fields (id, name, price, stock, category, brand, small image URL, colors, rating).
3. The results are passed to `formatAnswer(plan, products)` which returns a short assistant text (e.g., "I found 4 options that should work well.") along with the compact product array.

## Response Rendering Workflow (frontend)

1. User types a query in the `ChatWidget` and submits.
2. The frontend immediately dispatches `addUserMessage()` to show an optimistic user message in the UI with a timestamp.
3. The `useChat()` hook creates an `AbortController` and dispatches the `sendChat` async thunk with `{ message, limit, signal }`.
4. While the request is pending the slice sets `status = 'loading'` and the UI shows a typing/loader assistant message.
5. If the user sends another query before the previous one completes, the component calls `controller.abort()` for the previous controller — the thunk translates an aborted axios request into a rejected action with `{ canceled: true }`, causing no assistant error message for cancellations.
6. On success, `sendChat.fulfilled` appends an assistant message object to `messages` with `text`, `products`, and `timestamp`.
7. `ChatMessage` renders the assistant text, timestamp, and zero-to-few `ChatProductCard` components using the compact product objects (minimized payload).
8. Timestamps and compact product cards provide a consistent, low-bandwidth user experience and make it easy to replay or log the conversation on the server later.


## Message Shape

Standardized message object used across frontend and backend:

    {
      id: string,
      role: 'user' | 'assistant',
      text: string,
      products: Array,   # compact product objects
      timestamp: ISOString
    }

## Env / Config

- `backend/.env` can include `GEMINI_API_KEY` and `GEMINI_MODEL` if you want the optional LLM step. The pipeline is designed to work without an LLM.
- `chatbotMappings.js` contains canonical mappings; migrating these to a Mongo collection (`chat_mappings`) is straightforward and recommended if you want an admin UI.

## Testing

1. Start backend and frontend.
2. Open the app, send these queries and observe results:
   - is red shoe available
   - is there a blue jacket in stock
   - which jeans looks good with black shirt for men

3. Rapidly send multiple queries — confirm previous requests are aborted and only the most recent assistant response appears.

## Next Steps / Improvements

- Migrate `chatbotMappings` to MongoDB and add an admin interface for synonyms and compatibility rules.
- Add Zod/JSON schema validation for any LLM-produced JSON to make parsing robust.
- Add unit tests for `buildLocalPlan()` and `buildMongoQuery()` to prevent regressions.
- Add semantic search / embeddings (LangChain) for better matches and paraphrase-tolerant queries — keep retrieval-first design to limit bandwidth.
- Enhance color/compatibility rules and make them data-driven (pattern-based matching or small ML model).

## Where to look in code

- Intent parser & query builder: `backend/src/services/chatbot/chatbot.intent.js`
- Mappings: `backend/src/data/chatbotMappings.js`
- Service orchestrator: `backend/src/services/chatbot/chatbot.service.js`
- Chat route: `backend/src/routes/chat.routes.js`
- Frontend widget: `frontend/src/Components/Common/Chatbot/ChatWidget.jsx`
- Redux slice + hook: `frontend/src/redux/slices/chatSlice.js`, `frontend/src/redux/hooks/useChat.js`

---
