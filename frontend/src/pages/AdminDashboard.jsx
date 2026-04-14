import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import {
    LayoutDashboard, Building2, CalendarDays, ClipboardCheck,
    LogOut, Shield, ChevronRight, Users, FileCheck, AlertTriangle,
    CheckCircle2, XCircle, Clock, TrendingUp, Menu, X
} from 'lucide-react';

// ─────────────────────────────────────────────────
// Dashboard Overview
// ─────────────────────────────────────────────────
const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [recentOrgs, setRecentOrgs] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await adminAPI.getDashboard();
                setStats(res.data.stats);
                setRecentOrgs(res.data.recentPendingOrgs || []);
                setRecentActivities(res.data.recentPendingActivities || []);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    const statCards = stats ? [
        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
        { label: 'Total Organizations', value: stats.totalOrganizations, icon: Building2, color: 'bg-emerald-500' },
        { label: 'Pending Orgs', value: stats.pendingOrgs, icon: Clock, color: 'bg-amber-500' },
        { label: 'Verified Orgs', value: stats.verifiedOrgs, icon: CheckCircle2, color: 'bg-green-500' },
        { label: 'Total Events', value: stats.totalEvents, icon: CalendarDays, color: 'bg-purple-500' },
        { label: 'Pending Activities', value: stats.pendingActivities, icon: FileCheck, color: 'bg-red-500' },
    ] : [];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`${card.color} p-3 rounded-lg`}>
                            <card.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Pending Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Orgs */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-amber-500" /> Pending Organizations</h2>
                    {recentOrgs.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">No pending organizations</p>
                    ) : (
                        <ul className="space-y-3">
                            {recentOrgs.map(org => (
                                <li key={org._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{org.institutionName}</p>
                                        <p className="text-xs text-gray-500">{org.organizationEmail}</p>
                                    </div>
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pending Activities */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><FileCheck className="w-5 h-5 mr-2 text-red-500" /> Pending Activities</h2>
                    {recentActivities.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">No pending activities</p>
                    ) : (
                        <ul className="space-y-3">
                            {recentActivities.map(act => (
                                <li key={act._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{act.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {act.studentId?.firstName} {act.studentId?.lastName} • {act.domain} • {act.aictePoints} pts
                                        </p>
                                    </div>
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────
// Organization Manager
// ─────────────────────────────────────────────────
const OrganizationManager = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.status = filter;
            const res = await adminAPI.getAllOrganizations(params);
            setOrganizations(res.data.organizations);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrgs(); }, [filter]);

    const handleStatusUpdate = async (orgId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this organization?`)) return;
        setActionLoading(orgId);
        try {
            await adminAPI.updateOrganizationStatus(orgId, { status });
            fetchOrgs();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteOrg = async (orgId) => {
        if (!window.confirm('Delete this organization completely? All their events will also be deleted. This cannot be undone.')) return;
        setDeleteLoading(orgId);
        try {
            await adminAPI.deleteOrganization(orgId);
            fetchOrgs();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(null);
        }
    };

    const statusBadge = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-700',
            verified: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center h-40 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : organizations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No organizations found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Institution</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">AICTE No.</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {organizations.map(org => (
                                    <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{org.institutionName}</p>
                                            <p className="text-xs text-gray-500">{org.organizationType || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{org.fullName}</p>
                                            <p className="text-xs text-gray-500">{org.organizationEmail}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{org.aicteApprovalNumber}</td>
                                        <td className="px-4 py-3">{statusBadge(org.verificationStatus)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {org.verificationStatus !== 'verified' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(org._id, 'verified')}
                                                        disabled={actionLoading === org._id}
                                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === org._id ? '...' : 'Approve'}
                                                    </button>
                                                )}
                                                {org.verificationStatus !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(org._id, 'rejected')}
                                                        disabled={actionLoading === org._id}
                                                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === org._id ? '...' : 'Reject'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteOrg(org._id)}
                                                    disabled={deleteLoading === org._id}
                                                    className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                                >
                                                    {deleteLoading === org._id ? '...' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────
// Event Monitor
// ─────────────────────────────────────────────────
const EventMonitor = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllEvents();
            setEvents(res.data.events);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleDelete = async (eventId) => {
        if (!window.confirm('Delete this event? This action cannot be undone.')) return;
        setDeleteLoading(eventId);
        try {
            await adminAPI.deleteEvent(eventId);
            fetchEvents();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Event Monitor</h1>

            {loading ? (
                <div className="flex justify-center h-40 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No events found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map(event => (
                        <div key={event._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {event.organizationId?.institutionName || 'Unknown Org'} • {event.domain}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(event.startDateTime).toLocaleDateString()} – {new Date(event.endDateTime).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center mt-2 space-x-2">
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{event.aictePoints} pts</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{event.mode}</span>
                                    </div>
                                </div>
                                {event.poster?.url && (
                                    <img src={event.poster.url} alt="" className="w-16 h-16 rounded-lg object-cover ml-3 flex-shrink-0" />
                                )}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleDelete(event._id)}
                                    disabled={deleteLoading === event._id}
                                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {deleteLoading === event._id ? 'Deleting...' : 'Delete Event'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────
// Activity Verifier
// ─────────────────────────────────────────────────
const ActivityVerifier = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.status = filter;
            const res = await adminAPI.getAllActivities(params);
            setActivities(res.data.activities);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchActivities(); }, [filter]);

    const handleAction = async (activityId, status) => {
        const remarks = status === 'rejected' ? prompt('Enter rejection remarks (optional):') : undefined;
        setActionLoading(activityId);
        try {
            await adminAPI.updateActivityStatus(activityId, { status, remarks: remarks || undefined });
            fetchActivities();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const statusBadge = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        return <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Activity Verification</h1>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="">All</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center h-40 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No activities found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Activity</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Domain</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Points</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activities.map(act => (
                                    <tr key={act._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{act.title}</p>
                                            <p className="text-xs text-gray-500">{new Date(act.date).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{act.studentId?.firstName} {act.studentId?.lastName}</p>
                                            <p className="text-xs text-gray-500">{act.studentId?.studentId || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{act.domain}</td>
                                        <td className="px-4 py-3 font-semibold text-indigo-600">{act.aictePoints}</td>
                                        <td className="px-4 py-3">{statusBadge(act.status)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {act.status === 'pending' && (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleAction(act._id, 'approved')}
                                                        disabled={actionLoading === act._id}
                                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === act._id ? '...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(act._id, 'rejected')}
                                                        disabled={actionLoading === act._id}
                                                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading === act._id ? '...' : 'Reject'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────
// Admin Dashboard Layout (Sidebar + Content)
// ─────────────────────────────────────────────────
const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
        { to: '/admin/events', label: 'Events', icon: CalendarDays },
        { to: '/admin/activities', label: 'Activities', icon: ClipboardCheck },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar – Desktop */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-30">
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Shield className="w-7 h-7 text-indigo-600 mr-2" />
                    <span className="text-lg font-bold text-gray-900">Point<span className="text-indigo-600">Mate</span></span>
                    <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">ADMIN</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || user?.email}</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 flex flex-col">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <Shield className="w-7 h-7 text-indigo-600 mr-2" />
                                <span className="text-lg font-bold">Admin</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="ml-3 flex items-center">
                        <Shield className="w-5 h-5 text-indigo-600 mr-1.5" />
                        <span className="font-bold text-gray-900">Admin Panel</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Routes>
                        <Route index element={<DashboardOverview />} />
                        <Route path="organizations" element={<OrganizationManager />} />
                        <Route path="events" element={<EventMonitor />} />
                        <Route path="activities" element={<ActivityVerifier />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
