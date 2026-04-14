import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Calendar, LayoutDashboard, Bell, User, LogOut, Menu, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { studentAPI } from '../../services/api'

const Navbar = () => {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [showDropdown, setShowDropdown] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [notificationCount, setNotificationCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)

    useEffect(() => {
        if (user && user.userType === 'student') {
            fetchUpcomingEventsCount();
            fetchNotifications();

            // Set up polling for real-time consistency (e.g., every 20 seconds)
            const interval = setInterval(() => {
                fetchNotifications();
                fetchUpcomingEventsCount();
            }, 20000);

            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUpcomingEventsCount = async () => {
        try {
            const response = await studentAPI.getActivityLog();
            const upcomingEvents = response.data.activities.filter(a => a.isUpcoming && a.status !== 'rejected');
            setNotificationCount(upcomingEvents.length);
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await studentAPI.getNotifications();
            setNotifications(response.data.notifications);
            // The notificationCount in bell can be a sum of notifications + upcoming if we want, 
            // but let's prioritize unread notifications for the badge if any.
            // If no unread, show total notifications or just use the badge for events.
            // Actually, let's merge them: 
            // Total Status Updates (unread) + Upcoming Events.
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleBellClick = async () => {
        setShowNotifications(!showNotifications);
        if (notificationCount > 0) {
            // navigate('/student/activity-log?tab=upcoming');
        }

        // Mark as read when opened
        if (!showNotifications && notifications.some(n => !n.isRead)) {
            try {
                await studentAPI.markNotificationsRead();
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (err) {
                console.error("Failed to mark notifications read", err);
            }
        }
    };

    const handleClearAll = async (e) => {
        e.stopPropagation();
        if (notifications.length === 0) return;
        if (window.confirm('Clear all notification history?')) {
            try {
                await studentAPI.clearNotifications();
                setNotifications([]);
            } catch (err) {
                console.error("Failed to clear notifications", err);
            }
        }
    };

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    // Define nav links based on role
    const getNavLinks = () => {
        if (!user) return []

        // Check if user is organization
        if (user.userType === 'organization') {
            return [
                { path: '/organization', label: 'Home', icon: Home },
                // User said "also include dashboard and events"
                // Let's provide: Dashboard (Org Home), Events (Public), Manage (Org Events)
                { path: '/', label: 'Dashboard', icon: Home },
                { path: '/events', label: 'Events', icon: Calendar },
                { path: '/organization/events', label: 'Manage', icon: LayoutDashboard }
            ];
        }

        // Check if user is student
        if (user.userType === 'student') {
            return [
                { path: '/student', label: 'Home', icon: Home },
                { path: '/', label: 'Dashboard', icon: Home },
                { path: '/events', label: 'Events', icon: Calendar },
            ];
        }

        // Check if user is admin
        if (user.userType === 'admin') {
            return [
                { path: '/admin', label: 'Dashboard', icon: Shield },
                { path: '/admin/organizations', label: 'Organizations', icon: LayoutDashboard },
                { path: '/admin/activities', label: 'Activities', icon: Calendar },
            ];
        }

        // Standard links (Fallback/Public)
        return [
            { path: '/', label: 'Dashboard', icon: Home },
            { path: '/events', label: 'Events', icon: Calendar },
        ]
    }

    const navLinks = getNavLinks()
    const isOrgUser = user?.userType === 'organization';
    const isAdminUser = user?.userType === 'admin';

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold">
                            <span className="text-gray-900">Point</span>
                            <span className="text-blue-600">Mate</span>
                        </span>
                    </Link>

                    {/* Center Navigation (Desktop) */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-8 h-full">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center space-x-2 h-full border-b-2 px-1 transition-colors ${isActive(link.path)
                                        ? 'text-blue-600 border-blue-600'
                                        : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right Side */}
                    {user ? (
                        <div className="flex items-center space-x-4">
                            {/* Notification Bell - Hidden for Org Users */}
                            {!isOrgUser && (
                                <div className="relative">
                                    <button
                                        onClick={handleBellClick}
                                        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <Bell className="w-5 h-5 text-gray-600" />
                                        {(notificationCount > 0 || notifications.some(n => !n.isRead)) && (
                                            <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                                                {notificationCount + notifications.filter(n => !n.isRead).length}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in max-h-[400px] overflow-y-auto">
                                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                                        {notifications.length > 0 && (
                                                            <button
                                                                onClick={handleClearAll}
                                                                className="text-[10px] bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 px-1.5 py-0.5 rounded transition-colors"
                                                            >
                                                                Clear All
                                                            </button>
                                                        )}
                                                    </div>
                                                    {notificationCount > 0 && (
                                                        <Link
                                                            to="/student/activity-log?tab=upcoming"
                                                            className="text-xs text-blue-600 hover:underline"
                                                            onClick={() => setShowNotifications(false)}
                                                        >
                                                            {notificationCount} Upcoming Events
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="divide-y divide-gray-50">
                                                    {notifications.length > 0 ? (
                                                        notifications.map(n => (
                                                            <Link
                                                                key={n._id}
                                                                to={n.link || '#'}
                                                                onClick={() => setShowNotifications(false)}
                                                                className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                                            >
                                                                <p className="text-sm font-bold text-gray-900">{n.title}</p>
                                                                <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                                                                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                            </Link>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-8 text-center text-gray-400">
                                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                            <p className="text-sm">No recent notifications</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* User Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center space-x-2 p-1 pl-2 pr-3 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
                                >
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture.url || user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : isOrgUser && user.organizationLogo?.url ? (
                                            <img src={user.organizationLogo.url} alt="Org Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            /* Logic for Org Initial vs User Icon */
                                            isOrgUser && user.institutionName ? (
                                                <span className="text-sm font-bold text-gray-700">
                                                    {user.institutionName.charAt(0).toUpperCase()}
                                                </span>
                                            ) : (
                                                <User className="w-5 h-5 text-gray-500" />
                                            )
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden md:block truncate max-w-[150px]">
                                        {user.institutionName || user.username || user.firstName || 'User'}
                                    </span>
                                </button>

                                {showDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                                            <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                                                <p className="text-sm font-medium text-gray-900">{user.username || 'User'}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.userType}</p>
                                            </div>
                                            <Link
                                                to={isAdminUser ? '/admin' : user.userType === 'organization' ? '/organization/profile' : '/student/profile'}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>Profile</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="btn-secondary">Log In</Link>
                            <Link to="/get-started" className="hidden sm:inline-flex btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && user && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
