import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import StockDetails from './pages/StockDetails';
import Portfolio from './pages/Portfolio';
import Orders from './pages/Orders';
import AIInsights from './pages/AIInsights';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <PortfolioProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/markets"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Markets />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stocks/:symbol"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <StockDetails />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Portfolio />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Orders />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-insights"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AIInsights />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PortfolioProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
