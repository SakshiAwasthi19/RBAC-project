import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, MapPin, Building2, LayoutGrid } from 'lucide-react'
import { eventsAPI } from '../services/api'
// import Navbar from '../components/common/Navbar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import eventPlaceholder from '../assets/event_placeholder.svg'; // We'll handle this path gracefully if missing

const Events = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDomain, setSelectedDomain] = useState('All Domains')
    const [activeFilter, setActiveFilter] = useState('All Events')
    const [activeTab, setActiveTab] = useState('upcoming')
    const navigate = useNavigate()

    const domains = [
        'All Domains',
        'Technical',
        'Soft Skills',
        'Community Service',
        'Innovation & Entrepreneurship' // Mapped from backend 'Innovation' potentially?
    ]

    const filterButtons = [
        { name: 'All Events', icon: LayoutGrid },
        { name: 'Technical', icon: Calendar },
        { name: 'Soft Skills', icon: Building2 },
        { name: 'Community Service', icon: MapPin }
    ]

    useEffect(() => {
        fetchEvents()
    }, [selectedDomain, searchQuery, activeFilter])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            // Logic to sync activeFilter button with selectedDomain if needed, for now independent or unified
            // If clicking button 'Technical', it acts same as dropdown 'Technical'
            let domainFilter = selectedDomain !== 'All Domains' ? selectedDomain : undefined;

            // Override if activeFilter is specific
            if (activeFilter !== 'All Events') {
                domainFilter = activeFilter;
            }

            const filters = {
                domain: domainFilter,
                search: searchQuery || undefined
            }
            const response = await eventsAPI.getAllEvents(filters)
            setEvents(response.data?.events || response.data || [])
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch events')
        } finally {
            setLoading(false)
        }
    }

    const getDomainColor = (domain) => {
        // simplified matching
        if (domain?.includes('Technical')) return 'bg-blue-100 text-blue-800';
        if (domain?.includes('Soft')) return 'bg-purple-100 text-purple-800';
        if (domain?.includes('Community')) return 'bg-green-100 text-green-800';
        if (domain?.includes('Innovation')) return 'bg-orange-100 text-orange-800';
        return 'bg-gray-100 text-gray-800';
    }

    const handleViewDetails = (eventId) => {
        navigate(`/events/${eventId}`)
    }

    const handleButtonFilter = (name) => {
        setActiveFilter(name);
        // Also sync dropdown for consistency visual
        if (name === 'All Events') setSelectedDomain('All Domains');
        else setSelectedDomain(name);
    }

    const upcomingEvents = events.filter(e => new Date(e.startDateTime || e.endDateTime) >= new Date())
    const pastEvents = events.filter(e => new Date(e.startDateTime || e.endDateTime) < new Date())
    const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">


            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
                    <p className="text-gray-600">Browse and register for events to earn AICTE points</p>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search events by title, description, or organization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Domain Filter */}
                    <div className="w-full md:w-64">
                        <select
                            value={selectedDomain}
                            onChange={(e) => {
                                setSelectedDomain(e.target.value);
                                // Reset button filter to specific or All
                                if (e.target.value === 'All Domains') setActiveFilter('All Events');
                                else setActiveFilter(e.target.value);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            {domains.map(domain => (
                                <option key={domain} value={domain}>{domain}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="mb-8 flex flex-wrap gap-3">
                    {filterButtons.map(({ name, icon: Icon }) => (
                        <button
                            key={name}
                            onClick={() => handleButtonFilter(name)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${activeFilter === name
                                ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{name}</span>
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Upcoming Events ({upcomingEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`${activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Past Events ({pastEvents.length})
                        </button>
                    </nav>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : displayedEvents.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No {activeTab} events found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {displayedEvents.map(event => (
                            <div
                                key={event._id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full"
                            >
                                {/* Event Image */}
                                <div className="relative h-48 bg-gray-200 overflow-hidden">
                                    <img
                                        src={event.poster?.url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070'}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070' }}
                                    />
                                    {/* Points Badge */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-orange-600 shadow-sm border border-orange-100">
                                        {event.aictePoints} Points
                                    </div>
                                    {/* Domain Tag */}
                                    <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getDomainColor(event.domain)} shadow-sm`}>
                                        {event.domain}
                                    </div>
                                </div>

                                {/* Event Details */}
                                <div className="p-5 flex flex-col flex-grow">
                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                                        {event.description}
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        {/* Date */}
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                            <span>{new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                            <span>{event.location?.venue || 'TBD'}</span>
                                        </div>

                                        {/* Organization */}
                                        <div className="flex items-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            <span>By {event.organizedBy || 'University'}</span>
                                        </div>
                                    </div>

                                    {/* Button */}
                                    <button
                                        onClick={() => handleViewDetails(event._id)}
                                        className="w-full bg-blue-50 text-blue-600 font-medium py-2.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Events
