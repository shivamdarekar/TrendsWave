# TrendsWave

## 📝 Overview
TrendsWave is a comprehensive full-stack e-commerce platform with separate interfaces for customers and sellers. The application offers a complete shopping experience with real payment integration through Razorpay, product management, order tracking, and secure authentication.

## ✨ Key Features

### 👥 Separate Panels for Customers & Sellers
- **Customers:** Browse products, add to cart, secure checkout, track "My Orders"
- **Sellers/Admin:** Add, edit & manage products, handle orders, and monitor sales

### 🛒 Shopping Experience
- Dynamic cart management with quantity updates
- Smooth checkout flow with Razorpay integration
- Order confirmation & live tracking

### 🔐 Authentication & Security
- Different login flows for customers & sellers
- Google OAuth integration via Passport.js for seamless login
- Security middleware (Helmet, Rate Limiting) to protect APIs

### 📊 Seller/Admin Panel
- Product management dashboard
- Order management system
- Role-based authentication for secure access

## 🛠️ Technology Stack

- **Frontend:** React.js, Redux Toolkit, Tailwind CSS (Responsive UI)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** Passport.js (Google OAuth + Email/Password, cookie-based tokens)
- **Payment Gateway:** Razorpay Integration
- **Deployment:** Frontend on Vercel | Backend on Render
## 📁 Project Structure

```
TrendsWave/
├── .gitattributes         # Git attributes file
├── data.txt               # Data source or configuration
├── backend/               # Backend Node.js application
│   ├── controllers/       # Request handlers
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware functions
│   ├── config/            # Configuration files
│   └── server.js          # Main server file
├── frontend/              # React frontend application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── assets/        # some images 
│   │   ├── redux/         # Redux store and slices
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Application entry point
│   └── package.json       # Frontend dependencies
└── README.md              # Project documentation
```

- 🌐 **Live Website:** [TrendsWave E-Commerce Platform](https://trendswave.vercel.app/)

- ## 💡 Development Insights

During the development of TrendsWave, several key challenges were addressed:
- Building secure payment flows with signature verification
- Handling real-world deployment issues (refresh routes, port conflicts, API limits)
- Improving user experience with loading states, overlays & error handling
- Designing scalable architectures with separate customer & seller journeys
