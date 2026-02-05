import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Plus, Search, Building2, Eye, Users, Trash2 } from 'lucide-react'
import { organizationAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const MyEvents = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchMyEvents()
    }, [])

    const fetchMyEvents = async () => {
        try {
            setLoading(true)
            const response = await organizationAPI.getMyEvents()
            // Support both paginated structure { data: { events: [] } } and flat array
            const eventData = response.data?.events || response.data || []
            setEvents(eventData)
        } catch (error) {
            console.error('Failed to fetch events:', error)
            toast.error('Failed to load your events')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateEvent = () => {
        navigate('/organization/create-event')
    }

    const handleDeleteEvent = async (eventId, eventTitle) => {
        if (window.confirm(`Are you sure you want to delete the event "${eventTitle}"? This action cannot be undone.`)) {
            try {
                await organizationAPI.deleteEvent(eventId)
                toast.success('Event deleted successfully')
                // Remove from state
                setEvents(events.filter(event => event._id !== eventId))
            } catch (error) {
                console.error('Failed to delete event:', error)
                toast.error(error.response?.data?.message || 'Failed to delete event')
            }
        }
    }

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getDomainColor = (domain) => {
        if (domain?.includes('Technical')) return 'bg-blue-100 text-blue-800'
        if (domain?.includes('Soft')) return 'bg-purple-100 text-purple-800'
        if (domain?.includes('Community')) return 'bg-green-100 text-green-800'
        if (domain?.includes('Cultural')) return 'bg-pink-100 text-pink-800'
        if (domain?.includes('Sports')) return 'bg-orange-100 text-orange-800'
        return 'bg-gray-100 text-gray-800'
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            case 'completed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Header and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
                    <p className="text-gray-600">Manage and track your organized events</p>
                </div>
                <button
                    onClick={handleCreateEvent}
                    className="btn-primary flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Event
                </button>
            </div>

            {/* Search Bar */}
            {events.length > 0 && (
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
            )}

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No events created yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Start creating events to engage students and help them earn AICTE points.</p>
                    <button
                        onClick={handleCreateEvent}
                        className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                    >
                        Create your first event &rarr;
                    </button>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No events found matching "{searchQuery}"</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-blue-600 mt-2 font-medium hover:underline"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <div
                            key={event._id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full"
                        >
                            {/* Poster Image */}
                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                                <img
                                    src={event.poster?.url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070'}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070' }}
                                />

                                {/* Status Badge */}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide ${getStatusColor(event.status)}`}>
                                    {event.status}
                                </div>

                                {/* Points Badge */}
                                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm border border-orange-100">
                                    {event.aictePoints} Points
                                </div>

                                {/* Domain Tag */}
                                <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getDomainColor(event.domain)} shadow-sm`}>
                                    {event.domain}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteEvent(event._id, event.title);
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Delete Event"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                                    {event.description}
                                </p>

                                <div className="space-y-3 mb-5 border-b border-gray-50 pb-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                        <span>{new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                        <span className="truncate">{event.location?.venue || 'TBD'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="w-4 h-4 mr-2 text-green-500" />
                                        <span>{event.registrationCount || 0} Registered</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <button
                                        onClick={() => navigate(`/organization/events/${event._id}/registrations`)}
                                        className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                    >
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => navigate(`/events/${event._id}`)}
                                        className="flex items-center justify-center px-4 py-2 bg-blue-50 border border-transparent rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyEvents
