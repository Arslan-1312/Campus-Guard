import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/global.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TrackComplaintPage from './pages/TrackComplaintPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaint from './pages/student/SubmitComplaint';
import MyComplaints from './pages/student/MyComplaints';
import ComplaintDetail from './pages/student/ComplaintDetail';
import StudentProfile from './pages/student/StudentProfile';

// Proctor pages
import ProctorDashboard from './pages/proctor/ProctorDashboard';
import AssignedComplaints from './pages/proctor/AssignedComplaints';
import ProctorComplaintDetail from './pages/proctor/ProctorComplaintDetail';

// Chief Proctor pages
import ChiefDashboard from './pages/chiefproctor/ChiefDashboard';
import AllComplaints from './pages/chiefproctor/AllComplaints';
import ChiefComplaintDetail from './pages/chiefproctor/ChiefComplaintDetail';
import ManageUsers from './pages/chiefproctor/ManageUsers';
import CreateStaff from './pages/chiefproctor/CreateStaff';
import AdminPanel from './pages/chiefproctor/AdminPanel';

// Shared
import NotificationsPage from './pages/NotificationsPage';
import NotFound from './pages/NotFound';

// Route Guards
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={getDashboard(user.role)} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" /></div>;
  if (user) return <Navigate to={getDashboard(user.role)} replace />;
  return children;
};

const getDashboard = (role) => {
  if (role === 'chief_proctor') return '/chief/dashboard';
  if (role === 'proctor') return '/proctor/dashboard';
  return '/student/dashboard';
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/track/:referenceNumber?" element={<TrackComplaintPage />} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
              <Route path="/student/submit" element={<PrivateRoute roles={['student']}><SubmitComplaint /></PrivateRoute>} />
              <Route path="/student/complaints" element={<PrivateRoute roles={['student']}><MyComplaints /></PrivateRoute>} />
              <Route path="/student/complaints/:id" element={<PrivateRoute roles={['student']}><ComplaintDetail /></PrivateRoute>} />
              <Route path="/student/profile" element={<PrivateRoute roles={['student']}><StudentProfile /></PrivateRoute>} />

              {/* Proctor Routes */}
              <Route path="/proctor/dashboard" element={<PrivateRoute roles={['proctor']}><ProctorDashboard /></PrivateRoute>} />
              <Route path="/proctor/complaints" element={<PrivateRoute roles={['proctor']}><AssignedComplaints /></PrivateRoute>} />
              <Route path="/proctor/complaints/:id" element={<PrivateRoute roles={['proctor']}><ProctorComplaintDetail /></PrivateRoute>} />

              {/* Chief Proctor Routes */}
              <Route path="/chief/dashboard" element={<PrivateRoute roles={['chief_proctor']}><ChiefDashboard /></PrivateRoute>} />
              <Route path="/chief/complaints" element={<PrivateRoute roles={['chief_proctor']}><AllComplaints /></PrivateRoute>} />
              <Route path="/chief/complaints/:id" element={<PrivateRoute roles={['chief_proctor']}><ChiefComplaintDetail /></PrivateRoute>} />
              <Route path="/chief/users" element={<PrivateRoute roles={['chief_proctor']}><ManageUsers /></PrivateRoute>} />
              <Route path="/chief/create-staff" element={<PrivateRoute roles={['chief_proctor']}><CreateStaff /></PrivateRoute>} />
              <Route path="/chief/admin-db" element={<PrivateRoute roles={['chief_proctor']}><AdminPanel /></PrivateRoute>} />

              {/* Shared */}
              <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
