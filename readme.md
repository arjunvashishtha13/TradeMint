# TradeMint

TradeMint is a clean, modern stock trading simulation platform built for students and aspiring traders to practice portfolio management and experience real-time market simulations without financial risk.

## Project Vision

TradeMint is designed with a strong focus on usability, clean architecture, responsive design, and practical features. It offers a realistic trading and portfolio management experience without unnecessary enterprise-level complexity or AI recommendations.

## Features

- **Authentication:** Secure user registration and login using JWT and bcrypt.
- **Dashboard:** Overview of your total portfolio value, investments, profit/loss, and recent transactions.
- **Portfolio Management:** Real-time tracking of stock holdings, average buy prices, and current valuations.
- **Watchlist:** Search and add favorite stocks to monitor their performance.
- **Trading Simulation:** Buy and sell simulated stocks to build your transaction history.
- **Modern UI/UX:** Built with React, TailwindCSS, and Framer Motion for a stunning, responsive, and dynamic user experience (including Light and Dark modes).

## Tech Stack

**Frontend:**
- React (Vite)
- TailwindCSS v4
- Framer Motion
- Recharts (for Analytics)
- Lucide React (for Icons)
- Axios & React Router

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

## Architecture

The backend follows a standard MVC (Model-View-Controller) architecture:
- `models/`: Mongoose schemas for User, Portfolio, Holding, Transaction, and Watchlist.
- `controllers/`: Business logic for handling requests and database interactions.
- `routes/`: Express routers mapping endpoints to controllers.
- `middleware/`: Custom middleware, including JWT authentication (`protect`).

## Screenshots

*(Add your project screenshots here)*
- Dashboard Overview
- Portfolio view
- Watchlist Management
- Transaction History

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/TradeMint.git
   cd TradeMint
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add:
   ```env
   PORT=3002
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd client
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## License
MIT
