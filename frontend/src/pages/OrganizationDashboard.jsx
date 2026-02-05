import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Calendar, Plus, Settings, LogOut,
    Users, CheckCircle, Clock, BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { organizationAPI } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Navbar from '../components/common/Navbar'

// Import child components
import CreateEvent from '../components/organization/CreateEvent'
import MyEvents from '../components/organization/MyEvents'
import Profile from '../components/organization/Profile'
import EventRegistrations from '../components/organization/EventRegistrations'

const OrganizationDashboard = () => {
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch data only on the main dashboard route to save resources
        if (location.pathname === '/organization' || location.pathname === '/organization/') {
            fetchDashboardData()
        } else {
            setLoading(false); // If not on dashboard home, stop loading to render routes
        }
    }, [location.pathname])

    const fetchDashboardData = async () => {
        try {
            const response = await organizationAPI.getDashboard()
            setDashboardData(response.data)
        } catch (error) {
            console.error('Failed to fetch dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    // Dashboard Home View
    if (location.pathname === '/organization' || location.pathname === '/organization/') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                    {loading ? (
                        <div className="flex justify-center items-center h-96">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Organization Dashboard
                                </h1>
                                <p className="text-gray-600">
                                    Manage your events and track participant registrations
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Events</p>
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardData?.stats?.totalEvents || 0}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Registrations</p>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Users className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardData?.stats?.totalRegistrations || 0}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Upcoming Events</p>
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardData?.stats?.upcomingEvents || 0}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed Events</p>
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboardData?.stats?.completedEvents || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <button
                                    onClick={() => navigate('/organization/create-event')}
                                    className="group bg-blue-600 text-white p-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-4 transform hover:-translate-y-1"
                                >
                                    <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-xl font-bold block">Create New Event</span>
                                        <span className="text-blue-100 text-sm">Launch a new point opportunity</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/organization/events')}
                                    className="group bg-white text-gray-900 p-8 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center space-x-4 transform hover:-translate-y-1"
                                >
                                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-colors">
                                        <Calendar className="w-8 h-8 text-gray-600 group-hover:text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-xl font-bold block">View All Events</span>
                                        <span className="text-gray-500 text-sm group-hover:text-blue-500">Manage existing listings</span>
                                    </div>
                                </button>
                            </div>

                            {/* Recent Events */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
                                </div>

                                {dashboardData?.recentEvents?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Name</th>
                                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Registrations</th>
                                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {dashboardData.recentEvents.map(event => (
                                                    <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <p className="font-semibold text-gray-900">{event.title}</p>
                                                            <p className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-blue-100">{event.domain}</p>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                                {new Date(event.startDateTime).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium">{event.registrationCount || 0}</span>
                                                                <span className="text-gray-400 mx-1">/</span>
                                                                <span>{event.maxParticipants === 0 ? '∞' : event.maxParticipants}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${event.status === 'approved' ? 'bg-green-600' :
                                                                        event.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                                                                    }`}></span>
                                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end space-x-3">
                                                                <button
                                                                    onClick={() => navigate(`/events/${event._id}`)}
                                                                    className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors"
                                                                >
                                                                    Preview
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/organization/events/${event._id}/registrations`)}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                                >
                                                                    Manage
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Calendar className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">No events yet</h3>
                                        <p className="text-gray-500 mb-6">Create your first event to start accepting registrations.</p>
                                        <button
                                            onClick={() => navigate('/organization/create-event')}
                                            className="btn-primary"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Event
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        )
    }

    // For other routes, render nested components
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                <Routes>
                    <Route path="create-event" element={<CreateEvent />} />
                    <Route path="events" element={<MyEvents />} />
                    <Route path="events/:eventId/registrations" element={<EventRegistrations />} />
                    <Route path="profile" element={<Profile />} />

                    <Route path="*" element={<Navigate to="/organization" replace />} />
                </Routes>
            </main>
        </div>
    )
}

export default OrganizationDashboard
