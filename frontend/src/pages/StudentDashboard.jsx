import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    User, Activity, FileText, Clock,
    HelpCircle, LogOut, X, Menu,
    MapPin, TrendingUp, FolderOpen,
    CheckCircle2, Clock as ClockIcon,
    GraduationCap, Facebook, Twitter, Instagram, Linkedin, Mail, PlusCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { studentAPI } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Import child components
import Profile from '../components/student/Profile'
import PointsTracker from '../components/student/PointsTracker'
import Certificates from '../components/student/Certificates'
import ActivityLog from '../components/student/ActivityLog'
import Help from '../components/student/Help'
import ReportActivity from '../components/student/ReportActivity'

const StudentDashboard = () => {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()

        // Refresh dashboard data every 30 seconds for consistency
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await studentAPI.getDashboard()
            setDashboardData(response.data)
        } catch (error) {
            console.error('Failed to fetch dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const navItems = [
        { path: '/student/profile', icon: User, label: 'Profile' },
        { path: '/student/points', icon: Activity, label: 'AICTE Points Tracker' },
        { path: '/student/certificates', icon: FileText, label: 'Certificates' },
        { path: '/student/report-activity', icon: PlusCircle, label: 'Report Activity' },
        { path: '/student/activity-log', icon: Clock, label: 'Activity Log' },
        { path: '/student/help', icon: HelpCircle, label: 'Help' }
    ]

    const isActive = (path) => {
        // Special case for dashboard home
        if (path === '/student' && location.pathname === '/student') return true;
        if (path === '/student') return false;
        return location.pathname.startsWith(path);
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout()
            navigate('/');
        }
    }

    // Sidebar Component (Reusable)
    const Sidebar = () => (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col fixed md:sticky top-0 h-screen z-20`}>
            {/* Profile Section */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-900" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium truncate">
                                {user?.firstName || 'Student'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-semibold">
                    NAVIGATION
                </p>
                {navItems.map(({ path, icon: Icon, label }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive(path)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg w-full transition-colors font-medium decoration-0"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-md hover:bg-gray-100">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <span className="text-xl font-bold text-gray-900">PointMate</span>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

                {/* Dashboard Content Routes */}
                {loading ? (
                    <div className="flex-grow flex justify-center items-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="p-4 md:p-8 flex-grow">
                        <Routes>
                            <Route path="/" element={
                                /* Home Dashboard View */
                                <>
                                    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                                        {/* Hero Section */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-4">
                                            <div className="lg:col-span-2 flex flex-col justify-center">
                                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                                    Never Miss an AICTE Activity Again
                                                </h1>
                                                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                                    Track, organize, and keep all records of your campus activities and
                                                    certificates - all in one place. The smart way for VTU students to
                                                    ensure they meet all graduation requirements.
                                                </p>
                                                <div className="flex flex-wrap gap-4">
                                                    <Link to="/events" className="btn-primary px-8 py-3 shadow-lg hover:shadow-xl transition-all">
                                                        Get Started
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            const element = document.getElementById('why-vtu-students');
                                                            if (element) element.scrollIntoView({ behavior: 'smooth' });
                                                        }}
                                                        className="btn-outline px-8 py-3 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600"
                                                    >
                                                        Learn More
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Points Card */}
                                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300">
                                                <div className="mb-4 relative inline-block">
                                                    <svg className="w-40 h-40 transform -rotate-90">
                                                        <circle
                                                            cx="80"
                                                            cy="80"
                                                            r="70"
                                                            stroke="currentColor"
                                                            strokeWidth="10"
                                                            fill="transparent"
                                                            className="text-gray-100"
                                                        />
                                                        <circle
                                                            cx="80"
                                                            cy="80"
                                                            r="70"
                                                            stroke="currentColor"
                                                            strokeWidth="10"
                                                            fill="transparent"
                                                            strokeDasharray={440}
                                                            strokeDashoffset={440 - (440 * (dashboardData?.totalPoints || 0)) / 100}
                                                            className="text-green-500 transition-all duration-1000 ease-out"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                        <Activity className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                                                        <span className="text-3xl font-bold text-gray-900">{dashboardData?.totalPoints || 0}</span>
                                                        <span className="text-xs text-gray-500 block">/ 100</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    Your AICTE Points
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    You're on your way! Earn <span className="text-blue-600 font-bold">{Math.max(0, 100 - (dashboardData?.totalPoints || 0))}</span> more points.
                                                </p>
                                            </div>
                                        </div>

                                        {/* How AICTE Tracker Helps */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                                How AICTE Tracker Helps You Graduate
                                            </h2>
                                            <p className="text-gray-600 mb-10 max-w-3xl">
                                                Our platform makes it easy to track your progress toward the required 100 AICTE
                                                points, discover relevant activities, and manage your certificates.
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                {/* Nearby Events */}
                                                <div className="text-center group p-4 rounded-xl hover:bg-blue-50 transition-colors">
                                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                        <MapPin className="w-8 h-8 text-blue-600" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-900 mb-3">Nearby Events</h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        Discover AICTE-approved events and workshops near your location.
                                                        Get notified when new activities are posted nearby.
                                                    </p>
                                                </div>

                                                {/* Point Tracking */}
                                                <div className="text-center group p-4 rounded-xl hover:bg-green-50 transition-colors">
                                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                        <TrendingUp className="w-8 h-8 text-green-600" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-900 mb-3">Point Tracking</h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        Easily track your AICTE points progress across all categories.
                                                        Your records stay organized by category.
                                                    </p>
                                                </div>

                                                {/* Certificate Storage */}
                                                <div className="text-center group p-4 rounded-xl hover:bg-purple-50 transition-colors">
                                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                        <FolderOpen className="w-8 h-8 text-purple-600" />
                                                    </div>
                                                    <h3 className="font-bold text-lg text-gray-900 mb-3">Certificate Storage</h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        Upload and store your participation certificates and event photos securely.
                                                        Access them anytime for easy report generation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Timeline */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
                                                        <p className="text-xs text-gray-500 mt-1">Your recent campus engagements</p>
                                                    </div>
                                                    <Link to="/student/activity-log" className="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 bg-blue-50 rounded-full transition-colors">
                                                        View All
                                                    </Link>
                                                </div>

                                                <div className="relative">
                                                    {dashboardData?.activities?.recent?.length > 0 ? (
                                                        <div className="space-y-8 relative">
                                                            {/* Vertical Line */}
                                                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent"></div>

                                                            {dashboardData.activities.recent.map((activity, index) => (
                                                                <div key={index} className="relative pl-12 group">
                                                                    {/* Dot */}
                                                                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${activity.status === 'approved' ? 'bg-green-500' : 'bg-orange-500'
                                                                        }`}>
                                                                        {activity.status === 'approved' ? (
                                                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                                                        ) : (
                                                                            <ClockIcon className="w-5 h-5 text-white" />
                                                                        )}
                                                                    </div>

                                                                    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all transform hover:-translate-x-1">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <h4 className="font-bold text-gray-900 leading-tight">{activity.title}</h4>
                                                                            <span className="text-sm font-bold text-blue-600">+{activity.aictePoints}</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-3 text-xs">
                                                                            <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${activity.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                                                }`}>
                                                                                {activity.status}
                                                                            </span>
                                                                            <span className="text-gray-400">•</span>
                                                                            <span className="text-gray-500 flex items-center">
                                                                                <FileText className="w-3 h-3 mr-1" />
                                                                                {activity.domain}
                                                                            </span>
                                                                            <span className="text-gray-400">•</span>
                                                                            <span className="text-gray-500">{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 px-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                                <PlusCircle className="w-10 h-10 text-blue-400 animate-pulse" />
                                                            </div>
                                                            <h4 className="text-lg font-bold text-gray-900 mb-2">No Activities Yet</h4>
                                                            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                                                                Start your AICTE journey by reporting your first campus activity or joining an event.
                                                            </p>
                                                            <Link to="/student/report-activity" className="btn-primary inline-flex items-center space-x-2 px-6 py-2.5 text-sm shadow-md hover:shadow-lg transition-all">
                                                                <PlusCircle className="w-4 h-4" />
                                                                <span>Log My Activity</span>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Why Students Love This */}
                                            <div id="why-vtu-students" className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-md p-8 text-white flex flex-col justify-center">
                                                <h3 className="text-2xl font-bold mb-8">Why VTU Students Love This App</h3>
                                                <div className="space-y-6">
                                                    <div className="group">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <span className="w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center font-bold transition-colors">
                                                                1
                                                            </span>
                                                            <h4 className="font-bold text-lg">No More Last Minute Rush</h4>
                                                        </div>
                                                        <p className="text-sm text-blue-100 ml-11 leading-relaxed opacity-90">
                                                            Track and plan your point accumulation throughout your academic journey without stress.
                                                        </p>
                                                    </div>

                                                    <div className="group">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <span className="w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center font-bold transition-colors">
                                                                2
                                                            </span>
                                                            <h4 className="font-bold text-lg">Discover Relevant Activities</h4>
                                                        </div>
                                                        <p className="text-sm text-blue-100 ml-11 leading-relaxed opacity-90">
                                                            Find events that match your interests and career goals effortlessly.
                                                        </p>
                                                    </div>

                                                    <div className="group">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <span className="w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center font-bold transition-colors">
                                                                3
                                                            </span>
                                                            <h4 className="font-bold text-lg">Never Lose a Certificate Again</h4>
                                                        </div>
                                                        <p className="text-sm text-blue-100 ml-11 leading-relaxed opacity-90">
                                                            Securely store all your certificates in one place, accessible anytime.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA Section */}
                                        <section className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Simplify Your AICTE Point Journey?</h2>
                                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                                Join thousands of VTU students who are already tracking their points, discovering
                                                events, and securing their graduation requirements with ease.
                                            </p>
                                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                                <Link to="/events" className="btn-primary px-8 py-3">
                                                    Find Nearby Events
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        const mainContent = document.querySelector('main');
                                                        if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="btn-outline px-8 py-3 bg-white"
                                                >
                                                    View Dashboard
                                                </button>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Footer */}
                                    <footer className="bg-blue-900 text-white pt-16 pb-8 -mx-4 md:-mx-8 -mb-4 md:-mb-8 mt-12 px-4 md:px-8">
                                        <div className="max-w-6xl mx-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-left">
                                                {/* Brand */}
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                                                            <GraduationCap className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-xl font-bold">PointMate</span>
                                                    </div>
                                                    <p className="text-blue-100 text-sm mb-6 max-w-sm">
                                                        Empowering students to track, manage, and showcase their extra-curricular achievements effortlessly.
                                                    </p>
                                                    <div className="flex space-x-4">
                                                        <a href="#" className="text-blue-200 hover:text-white transition"><Facebook className="w-5 h-5" /></a>
                                                        <a href="#" className="text-blue-200 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
                                                        <a href="#" className="text-blue-200 hover:text-white transition"><Instagram className="w-5 h-5" /></a>
                                                        <a href="#" className="text-blue-200 hover:text-white transition"><Linkedin className="w-5 h-5" /></a>
                                                    </div>
                                                </div>

                                                {/* Links */}
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-4 text-blue-50">Quick Links</h3>
                                                    <ul className="space-y-2 text-sm text-blue-200">
                                                        <li><Link to="/" className="hover:text-white">Home</Link></li>
                                                        <li><Link to="/features" className="hover:text-white">Features</Link></li>
                                                        <li><Link to="/events" className="hover:text-white">Events</Link></li>
                                                        <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                                                        <li><Link to="/contact" className="hover:text-white">Contact Support</Link></li>
                                                    </ul>
                                                </div>

                                                {/* Resources */}
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-4 text-blue-50">Resources</h3>
                                                    <ul className="space-y-2 text-sm text-blue-200">
                                                        <li><a href="#" className="hover:text-white">VTU Official Website</a></li>
                                                        <li><a href="#" className="hover:text-white">AICTE Activity Guidelines</a></li>
                                                        <li><a href="#" className="hover:text-white">Student Handbook</a></li>
                                                        <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                                        <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="border-t border-blue-800 pt-8 text-center text-sm text-blue-300">
                                                <p>© 2026 AICTE Tracker for VTU Students. All rights reserved.</p>
                                            </div>
                                        </div>
                                    </footer>
                                </>
                            } />

                            {/* Sub Routes */}
                            <Route path="profile" element={<Profile />} />
                            <Route path="points" element={<PointsTracker />} />
                            <Route path="certificates" element={<Certificates />} />
                            <Route path="activity-log" element={<ActivityLog />} />
                            <Route path="report-activity" element={<ReportActivity />} />
                            <Route path="help" element={<Help />} />

                            <Route path="*" element={<Navigate to="/student" replace />} />
                        </Routes>
                    </div>
                )}
            </main>
        </div>
    )
}

export default StudentDashboard
