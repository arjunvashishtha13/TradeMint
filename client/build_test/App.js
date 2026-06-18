import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistPage from './pages/WatchlistPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PortfolioPage from './pages/PortfolioPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import MarketDashboardPage from './pages/MarketDashboardPage';
import JournalPage from './pages/JournalPage';
import GoalsPage from './pages/GoalsPage';
export default function App() {
  return /*#__PURE__*/React.createElement(ThemeProvider, null, /*#__PURE__*/React.createElement(AuthProvider, null, /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(LandingPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/login",
    element: /*#__PURE__*/React.createElement(LoginPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/register",
    element: /*#__PURE__*/React.createElement(RegisterPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/dashboard",
    element: /*#__PURE__*/React.createElement(ProtectedRoute, null, /*#__PURE__*/React.createElement(DashboardLayout, null))
  }, /*#__PURE__*/React.createElement(Route, {
    index: true,
    element: /*#__PURE__*/React.createElement(Navigate, {
      to: "overview",
      replace: true
    })
  }), /*#__PURE__*/React.createElement(Route, {
    path: "overview",
    element: /*#__PURE__*/React.createElement(AnalyticsPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "portfolio",
    element: /*#__PURE__*/React.createElement(PortfolioPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "watchlist",
    element: /*#__PURE__*/React.createElement(WatchlistPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "transactions",
    element: /*#__PURE__*/React.createElement(TransactionsPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "market",
    element: /*#__PURE__*/React.createElement(MarketDashboardPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "journal",
    element: /*#__PURE__*/React.createElement(JournalPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "goals",
    element: /*#__PURE__*/React.createElement(GoalsPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "profile",
    element: /*#__PURE__*/React.createElement(ProfilePage, null)
  })))), /*#__PURE__*/React.createElement(Toaster, {
    position: "bottom-right"
  })));
}