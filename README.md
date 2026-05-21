# TrendsWave - E‑Commerce Platform

> A modern, full-stack e-commerce platform for customers and sellers

`TRENDSWAVE` • `E-COMMERCE`

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000)&nbsp;![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=fff)&nbsp;![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=fff)&nbsp;![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=fff)&nbsp;![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)


## 📝 Overview
TrendsWave is a production-ready full-stack e-commerce platform built with the MERN stack, featuring separate interfaces for customers and sellers/admins.

The platform offers a complete shopping experience — from browsing and filtering products, to cart management with optimistic UI updates, secure Razorpay payment integration, order tracking, Google OAuth login, and a full seller dashboard for product and order management.

---

## ✨ Key Features

### 👥 Dual Panel Architecture
- **Customer Panel:** Browse collections, filter & search products, manage cart, checkout, track orders
- **Seller/Admin Panel:** Add/edit/delete products, manage orders, update delivery status, view revenue dashboard

### 🛒 Shopping Experience
- Optimistic cart updates — quantity changes reflect instantly without waiting for server
- Guest cart support — cart persists across sessions via `localStorage`
- Cart merge on login — guest cart automatically merges with user cart after login
- Filter by category, gender, color, size, material, brand, and price range
- Sort by price (low/high) and popularity
- Search with partial match across name, description, category, brand, and gender
- "You May Also Like" similar product recommendations

### 💳 Payment & Checkout
- Razorpay payment gateway with HMAC-SHA256 signature verification
- Stock lock pattern — atomic stock decrement prevents overselling
- Checkout finalization with duplicate order prevention
- Order confirmation page with estimated delivery date

### 🔐 Authentication & Security
- Email/password login with JWT access + refresh tokens (cookie-based)
- Google OAuth 2.0 via Passport.js for customers and sellers
- Role-based access control (`customer` / `admin`)
- Helmet for secure HTTP headers
- Rate limiting — 150 req/15min globally, 8 req/15min on login route
- CORS restricted to frontend origin only
- MIME type validation on image uploads
- Regex-escaped search input to prevent ReDoS attacks

### 📊 Admin Dashboard
- Revenue, total orders, and total products summary cards
- Recent orders table with status management
- Product management with image upload/delete via Cloudinary
- HEIC/HEIF image format support with automatic JPEG conversion
- Maximum 4 images per product enforced on both frontend and backend

### ⚡ Performance & Reliability
- Optimistic UI updates for cart quantity and item removal
- MongoDB transactions for cart merge, payment verification, and order finalization
- Atomic `$inc` / `$set` / `$pull` operations to prevent race conditions
- Field projection (`.select()`) on all listing queries to reduce payload size
- Database indexes on all frequently queried fields
- Backend health check endpoint for cold-start detection on Render
- Loading spinner shown while backend wakes up

### 🤖 Chatbot Assistant
- Lightweight product-focused assistant for search, availability checks, and style recommendations.
- Retrieval-first pipeline: intent -> filters -> compact MongoDB retrieval; returns compact product cards to minimize payload.
- Frontend aborts stale requests and shows optimistic UI; mappings (colors/categories) are data-driven for easy updates.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Redux Toolkit | Global state management |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v3 | Utility-first styling |
| Axios | HTTP client |
| Sonner | Toast notifications |
| Vite | Build tool & dev server |
| react-icons / heroicons | Icon libraries |
| color-namer | Color name to hex conversion for product swatches |
| india-state-district | State & district dropdowns for Indian addresses |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server & REST API |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Access & refresh token auth |
| bcryptjs | Password hashing |
| Passport.js + Google OAuth 2.0 | Social authentication |
| Razorpay SDK | Payment gateway |
| Cloudinary + Multer | Image storage & upload |
| heic-convert | HEIC/HEIF to JPEG conversion |
| Helmet | HTTP security headers |
| express-rate-limit | API rate limiting |
| cookie-parser | Cookie handling |
| express-session | OAuth session management |
| dotenv | Environment variable management |
| nodemon | Development auto-restart |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |
| Cloudinary | Image CDN |

---

## 📁 Project Structure

High-level project folders (details omitted):

```
TrendsWave/
├── backend/
│   └── src/         # config, data, middleware, models, routes, services, utils
├── frontend/
│   └── src/         # assets, Components, pages, redux, styles
├── docs/            # documentation (CHATBOT_IMPLEMENTATION.md)
└── README.md
```

---

<!-- API endpoints removed from README per request -->

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Razorpay account
- Google Cloud Console project (for OAuth)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
FRONTEND_URL=http://localhost:5173

# JWT
Access_Token_Secret=your_access_token_secret
Access_Token_Expiry=15m
Refresh_Token_Secret=your_refresh_token_secret
Refresh_Token_Expiry=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your_session_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

NODE_ENV=development
```

```bash
npm run dev       # Development with nodemon
npm start         # Production
```

## 🤖 Chatbot Assistant

This project includes a lightweight product-focused chatbot that helps customers search, check availability, and get style recommendations (intent -> filters -> retrieval). It is implemented as a retrieval-first assistant (not full RAG) to keep bandwidth low and responses deterministic.

- Backend route: `/api/chat` (see `backend/src/routes/chat.routes.js`) handles incoming chat messages, builds a plan (intent + filters), runs a compact MongoDB query, and formats a short assistant reply with compact product objects.
- Frontend: floating `ChatWidget` under `frontend/src/Components/Common/Chatbot/` posts messages to the backend and displays results in a compact product card layout.
- Data-driven mappings: color/category synonyms live in `backend/src/data/chatbotMappings.js` and are used by the intent parser for normalization; these can be migrated to MongoDB for admin-editable mappings later.

Quick test:

1. Run backend and frontend as described above.
2. Open the app and click "Chat with us".
3. Try queries like:
	- "is red shoe available"
	- "which jeans looks good with black shirt for men"

Notes:
- The assistant requests only small product projections to minimize payload.
- Frontend aborts stale requests (via `AbortController`) to avoid showing outdated replies.
- Gemini / LLM usage is optional in the service — the pipeline supports plugging in an LLM for better phrasing or intent parsing but defaults to the local intent parser.

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

---

## 🔒 Environment Variables Summary

| Variable | Location | Description |
|---|---|---|
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `FRONTEND_URL` | Backend | Allowed CORS origin |
| `Access_Token_Secret` | Backend | JWT access token signing key |
| `Refresh_Token_Secret` | Backend | JWT refresh token signing key |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Backend | Google OAuth redirect URI |
| `SESSION_SECRET` | Backend | Express session secret |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Backend | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay key secret |
| `VITE_BACKEND_URL` | Frontend | Backend API base URL |

---

## 🌐 Live Demo

🔗 **Live Website:** [TrendsWave E-Commerce Platform](https://trendswave.vercel.app/)

---

## 💡 Technical Highlights

- **Optimistic UI** — Cart quantity updates and item removals reflect instantly in the UI, with automatic rollback on server failure
- **Race condition prevention** — MongoDB transactions used for cart merge, payment verification, and order finalization; atomic `$inc`/`$set`/`$pull` for all cart mutations
- **Stock lock pattern** — Atomic stock decrement within a transaction prevents overselling when concurrent orders are placed
- **Payload optimization** — All product listing endpoints use `.select()` with object syntax to return only required fields, reducing response size significantly
- **Secure search** — User search input is regex-escaped before being used in MongoDB `$regex` queries to prevent ReDoS attacks
- **HEIC support** — iOS HEIC/HEIF images are automatically converted to JPEG before Cloudinary upload
- **Backend wake-up** — Health check endpoint with frontend loading state handles Render's cold-start delay gracefully
- **Guest cart persistence** — Cart stored in `localStorage` with a generated `guestId`, merged atomically into user cart on login
