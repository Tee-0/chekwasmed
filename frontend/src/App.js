import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';

//importing existing components
import Login from './components/Login';
import Register from './components/Register';

//importing pages.
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MedicationList from './pages/MedicationList';
import AddMedication from './pages/AddMedication';
import EditMedication from './pages/EditMedication';
import Profile from './pages/Profile';
import InteractionChecker from './pages/InteractionChecker';


import logo from './logo.svg';
import './App.css';
import HomePage from './pages/Home';

//Protected route wrapper, (wraps around parts of app that need protection)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

//Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600">
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/**Public routes */}

            <Route
              path="/"
              element={<Home/>} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/**Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medications"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MedicationList />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medications/add"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddMedication />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medications/edit/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditMedication />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/interactions"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <InteractionChecker/>
                  </AppLayout>
                </ProtectedRoute>
              }
             />

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
