import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import OfferDetails from './pages/OfferDetails';
import AdminNewOffer from './pages/AdminNewOffer';
import AdminOffers from './pages/AdminOffers';
import AdminOfferApplications from './pages/AdminOfferApplications';
import AdminApplications from './pages/AdminApplications';
import AdminEditOffer from './pages/AdminEditOffer';
import AdminProposals from './pages/AdminProposals';
import StudentApplications from './pages/StudentApplications';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherEditProposal from './pages/TeacherEditProposal';
import Login from './pages/Login';
import Register from './pages/Register';
import Password from './pages/Password';
import ResetPassword from './pages/ResetPassword';
import Charts from './pages/Charts';
import Tables from './pages/Tables';
import StudentInternshipForm from './pages/StudentInternshipForm';
import TeacherProposalForm from './pages/TeacherProposalForm';
import PublicDashboard from './pages/PublicDashboard';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import StudentFavorites from './pages/StudentFavorites';
import AdminContactMessages from './pages/AdminContactMessages';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes (No Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password" element={<Password />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes with Layout */}
          <Route path="/" element={<Layout />}>
            {/* Home - Redirect based on role */}
            <Route index element={<Home />} />

            {/* Public offers pages */}
            <Route path="offres" element={<PublicDashboard />} />
            <Route path="offers/:id" element={<OfferDetails />} />

            {/* Public info pages */}
            <Route path="a-propos" element={<About />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contact" element={<Contact />} />
            <Route path="comment-ca-marche" element={<HowItWorks />} />

            {/* Profile - accessible to all logged in users */}
            <Route 
              path="profile" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Notifications - accessible to all logged in users */}
            <Route 
              path="notifications" 
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route 
              path="student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="student/new-request" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentInternshipForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="student/applications" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentApplications />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="student/favorites" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentFavorites />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route 
              path="teacher" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/new-proposal" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherProposalForm />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="teacher/proposals/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherEditProposal />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="admin/new-offer"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminNewOffer />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/offers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOffers />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/offers/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEditOffer />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/offers/:id/applications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOfferApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/applications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/proposals"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProposals />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/messages"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminContactMessages />
                </ProtectedRoute>
              }
            />

            {/* Legacy routes - kept for compatibility */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="charts" element={<Charts />} />
            <Route path="tables" element={<Tables />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
