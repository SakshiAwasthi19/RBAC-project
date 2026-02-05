import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import RegisterStudent from './pages/RegisterStudent'
import RegisterOrganization from './pages/RegisterOrganization'
import RegisterTypeSelection from './pages/RegisterTypeSelection'
import Navbar from './components/common/Navbar'

import Home from './pages/Home'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import StudentDashboard from './pages/StudentDashboard'
import OrganizationDashboard from './pages/OrganizationDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles.length > 0 && !roles.includes(user.userType)) {
        return <div className="p-8 text-center text-red-600">Access Denied: You do not have permission to view this page.</div>;
    }

    return children;
};

// Wrapper to redirect/render based on role
const Dashboard = () => {
    const { user } = useAuth();

    // If student, redirect to /student
    if (user?.userType === 'student') {
        return <Navigate to="/student" replace />;
    }

    // Fallback/Org placeholder
    return (
        <Navigate to="/organization" replace />
    );
};

function App() {
    const location = useLocation();
    const isOrgPage = location.pathname.startsWith('/organization');

    return (
        <div className="min-h-screen bg-gray-50">
            {!isOrgPage && <Navbar />}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/get-started" element={<RegisterTypeSelection />} />
                <Route path="/register-student" element={<RegisterStudent />} />
                <Route path="/register-organization" element={<RegisterOrganization />} />
                <Route path="/register-org" element={<RegisterOrganization />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:eventId" element={<EventDetails />} />

                {/* Protected Routes */}
                <Route path="/student/*" element={
                    <ProtectedRoute roles={['student']}>
                        <StudentDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/organization/*" element={
                    <ProtectedRoute roles={['organization']}>
                        <OrganizationDashboard />
                    </ProtectedRoute>
                } />

                {/* Catch All */}
                <Route path="*" element={<div className="p-8 text-center text-gray-500">404 - Page Not Found</div>} />
            </Routes>
        </div>
    )
}

export default App
