# TrendsWave

## 📝 Overview
**TrendsWave** is a production-ready **full-stack e-commerce platform** built with the MERN stack, featuring separate interfaces for **customers** and **sellers/admins**.

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
- **Razorpay** payment gateway with HMAC-SHA256 signature verification
- Stock lock pattern — atomic stock decrement prevents overselling
- Checkout finalization with duplicate order prevention
- Order confirmation page with estimated delivery date

### 🔐 Authentication & Security
- Email/password login with JWT access + refresh tokens (cookie-based)
- **Google OAuth 2.0** via Passport.js for customers and sellers
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

```
TrendsWave/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── DB.js                  # MongoDB connection
│       │   └── passport.js            # Google OAuth strategy
│       ├── data/
│       │   └── products.js            # Seed data
│       ├── middleware/
│       │   └── authMiddleware.js      # protect & admin middleware
│       ├── models/
│       │   ├── cart.model.js          # Cart schema
│       │   ├── checkout.model.js      # Checkout session schema
│       │   ├── order.model.js         # Order schema
│       │   ├── product.model.js       # Product schema with indexes
│       │   ├── subscribe.model.js     # Newsletter subscriber schema
│       │   ├── tempUpload.model.js    # Temp image upload schema (TTL)
│       │   └── user.model.js          # User schema with JWT methods
│       ├── routes/
│       │   ├── user.routes.js         # Register, login, logout, refresh token
│       │   ├── authRoutes.js          # Google OAuth callback, /me
│       │   ├── products.routes.js     # CRUD, filters, search, similar, new arrivals
│       │   ├── cart.routes.js         # Cart CRUD + guest/user merge
│       │   ├── checkout.routes.js     # Create checkout, finalize order
│       │   ├── order.routes.js        # User order history & details
│       │   ├── upload.routes.js       # Cloudinary image upload/delete
│       │   ├── razorpay.routes.js     # Create Razorpay order, verify payment
│       │   ├── adminProductsRoutes.js # Admin product listing
│       │   ├── adminOrderRoutes.js    # Admin order management
│       │   ├── subscribe.routes.js    # Newsletter subscription
│       │   └── health.routes.js       # Backend health check
│       ├── utils/
│       │   ├── cloudinary.js          # Upload & delete helpers
│       │   ├── multer.js              # Multer memory storage config
│       │   ├── security.js            # Helmet + rate limiter setup
│       │   ├── tokens.js              # Access & refresh token generator
│       │   └── cleanUp.js             # Cron job for unused temp uploads
│       ├── index.js                   # Express app entry point
│       └── seeder.js                  # Database seeder script
│
├── frontend/
│   └── src/
│       ├── assets/                    # Static images (webp)
│       ├── Components/
│       │   ├── Admin/
│       │   │   ├── AddProduct.jsx     # Add new product form
│       │   │   ├── AdminHomePage.jsx  # Dashboard with stats & recent orders
│       │   │   ├── AdminLayout.jsx    # Admin layout with sidebar
│       │   │   ├── AdminSidebar.jsx   # Admin navigation
│       │   │   ├── EditProductPage.jsx# Edit product with image management
│       │   │   ├── OrderManagement.jsx# Order status management table
│       │   │   └── ProductManagement.jsx # Product list with edit/delete
│       │   ├── Cart/
│       │   │   ├── CartContents.jsx   # Cart items with optimistic updates
│       │   │   └── CheckOut.jsx       # Checkout form + Razorpay integration
│       │   ├── Common/
│       │   │   ├── Footer.jsx         # Footer with newsletter & links
│       │   │   ├── GoogleSignInButton.jsx # Google OAuth button
│       │   │   ├── Header.jsx         # Header wrapper
│       │   │   ├── Navbar.jsx         # Nav with cart drawer & search
│       │   │   ├── ProtectedRoute.jsx # Auth guard with loading state
│       │   │   ├── SearchBar.jsx      # Animated search overlay
│       │   │   └── Spinner.jsx        # Reusable loading spinner
│       │   ├── Layout/
│       │   │   ├── CartDrawer.jsx     # Slide-in cart sidebar
│       │   │   ├── Hero.jsx           # Homepage hero banner
│       │   │   ├── Topbar.jsx         # Top announcement bar
│       │   │   └── UserLayout.jsx     # Customer layout wrapper
│       │   └── Products/
│       │       ├── FeaturedCollection.jsx  # Featured banner section
│       │       ├── FeatureSection.jsx      # Shipping/returns/security badges
│       │       ├── FilterSidebar.jsx       # Filter panel with clear all
│       │       ├── GenderCollectionSection.jsx # Men/Women collection cards
│       │       ├── NewArrivals.jsx          # Horizontal scroll carousel
│       │       ├── ProductDetails.jsx       # Full product page
│       │       ├── ProductGrid.jsx          # Responsive product grid
│       │       └── SortOptions.jsx          # Sort dropdown
│       ├── pages/
│       │   ├── CollectionPage.jsx     # Filtered collection with empty state
│       │   ├── Home.jsx               # Homepage
│       │   ├── Login.jsx              # Customer login
│       │   ├── MyOrdersPage.jsx       # Order history table
│       │   ├── NotFound.jsx           # 404 page
│       │   ├── OrderConfirmation.jsx  # Post-payment confirmation
│       │   ├── OrderDetails.jsx       # Single order detail view
│       │   ├── Profile.jsx            # User profile + recent orders
│       │   ├── Register.jsx           # Customer registration
│       │   └── SellerRegister.jsx     # Seller registration
│       ├── redux/
│       │   ├── slices/
│       │   │   ├── adminOrderSlice.js  # Admin order state
│       │   │   ├── adminProductSlice.js# Admin product state
│       │   │   ├── authSlice.js        # Auth state + JWT thunks
│       │   │   ├── cartSlice.js        # Cart state with optimistic updates
│       │   │   ├── checkoutSlice.js    # Checkout session state
│       │   │   ├── healthSlice.js      # Backend health state
│       │   │   ├── orderSlice.js       # User order state
│       │   │   ├── productsSlice.js    # Product listing & detail state
│       │   │   └── uploadSlice.js      # Image upload state
│       │   └── store.js               # Redux store configuration
│       ├── App.jsx                    # Routes + auth initialization
│       ├── index.css                  # Tailwind base styles
│       └── main.jsx                   # React entry point with Redux Provider
│
└── README.md
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/auth/google` | Public | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Public | Google OAuth callback |
| GET | `/api/auth/me` | Private | Get current user |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/users/register` | Public | Customer registration |
| POST | `/api/users/seller/register` | Public | Seller registration |
| POST | `/api/users/login` | Public | Login (rate limited) |
| POST | `/api/users/logout` | Private | Logout & clear cookies |
| POST | `/api/users/refreh-token` | Public | Refresh access token |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Get products with filters/search/sort |
| GET | `/api/products/best-seller` | Public | Get highest rated product |
| GET | `/api/products/new-arrivals` | Public | Get latest 8 products |
| GET | `/api/products/:id/edit` | Admin | Get product for editing |
| GET | `/api/products/similar/:id` | Public | Get similar products |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products/add` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product + Cloudinary images |

### Cart
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/cart` | Public | Get cart (user or guest) |
| POST | `/api/cart` | Public | Add item to cart (atomic) |
| PUT | `/api/cart` | Public | Update item quantity (atomic) |
| DELETE | `/api/cart` | Public | Remove item (atomic) |
| POST | `/api/cart/merge` | Private | Merge guest cart into user cart |

### Checkout & Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/checkout` | Private | Create checkout session |
| POST | `/api/checkout/:id/finalize` | Private | Finalize order after payment |
| GET | `/api/orders/my-orders` | Private | Get user's orders |
| GET | `/api/orders/:id` | Private | Get order details |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/razorpay/order` | Private | Create Razorpay order |
| POST | `/api/razorpay/verify` | Private | Verify payment signature |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/products` | Admin | Get admin's products |
| GET | `/api/admin/orders` | Admin | Get admin's orders |
| PUT | `/api/admin/orders/:id` | Admin | Update order status |
| DELETE | `/api/admin/orders/:id` | Admin | Delete order |

### Upload
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin | Upload image (new product) |
| POST | `/api/upload/:productId` | Admin | Upload image (existing product) |
| DELETE | `/api/upload/:productId` | Admin | Delete image from Cloudinary |

### Other
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Backend health check |
| POST | `/api/subscribe` | Public | Newsletter subscription |

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
