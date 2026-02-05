import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Building2, Share2, Info, ArrowLeft } from 'lucide-react'
import { eventsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const EventDetails = () => {
    const { eventId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        fetchEventDetails()
    }, [eventId])

    const fetchEventDetails = async () => {
        try {
            const response = await eventsAPI.getEventById(eventId)
            setEvent(response.data.event)

            // Simple check if user is already registered (if data available)
            if (user && response.data.event.registeredStudents) {
                // This check depends on how your backend returns registration status
                const isRegistered = response.data.event.registeredStudents.some(
                    reg => reg.studentId === user.id || reg.studentId?._id === user.id
                );
                if (isRegistered) setIsRegistered(true);
            }

        } catch (error) {
            toast.error('Failed to load event details')
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        if (!user) {
            toast.error('Please login to register')
            navigate('/login')
            return
        }

        // Safety check for user type
        if (user.userType !== 'student') {
            toast.error('Only students can register for events');
            return;
        }

        try {
            setRegistering(true)
            await eventsAPI.registerForEvent(eventId)
            toast.success('Successfully registered for event!')
            setIsRegistered(true); // Optimistic UI update
            fetchEventDetails() // Refresh data
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed';
            if (msg.includes('already registered')) setIsRegistered(true);
            toast.error(msg)
        } finally {
            setRegistering(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex justify-center items-center h-96">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center py-12">
                    <p className="text-xl text-gray-500 mb-4">Event not found</p>
                    <button onClick={() => navigate('/events')} className="btn-primary">Back to Events</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Hero Section */}
            <div className="relative h-64 md:h-96 bg-gray-900 overflow-hidden">
                <img
                    src={event.poster?.url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070'}
                    alt={event.title}
                    className="w-full h-full object-cover opacity-60"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-4 animate-slide-up">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/30">
                                {event.domain}
                            </span>
                            <span className="px-3 py-1 bg-blue-600/90 text-white rounded-full text-sm font-bold shadow-lg">
                                {event.aictePoints} AICTE Points
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight animate-fade-in shadow-black drop-shadow-md">
                            {event.title}
                        </h1>

                        {/* Organization */}
                        <p className="text-white/90 text-lg font-light flex items-center mt-2">
                            <Building2 className="w-5 h-5 mr-2 opacity-80" />
                            By {event.organizedBy || 'University Organization'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Events
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {/* About Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this event</h2>
                            <p className="text-gray-600 whitespace-pre-line leading-relaxed text-lg">
                                {event.description}
                            </p>
                        </div>

                        {/* AICTE Points Info */}
                        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-xl p-6 shadow-sm">
                            <div className="flex items-start">
                                <div className="p-2 bg-blue-100 rounded-lg mr-4 flex-shrink-0">
                                    <Info className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        AICTE Points Information
                                    </h3>
                                    <p className="text-2xl font-extrabold text-blue-700 mb-2">
                                        Earn {event.aictePoints} Points
                                    </p>
                                    <p className="text-blue-800/80 text-sm leading-relaxed">
                                        Participating in this event will count towards your AICTE points requirement.
                                        This event falls under the <strong className="text-blue-900">{event.domain}</strong> domain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sticky Sidebar */}
                    <div className="lg:col-span-1 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Event Details</h3>

                            {/* Date */}
                            <div className="flex items-start mb-5 group">
                                <div className="p-2 bg-gray-50 rounded-lg mr-3 group-hover:bg-blue-50 transition-colors">
                                    <Calendar className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Date</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(event.startDateTime).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-start mb-5 group">
                                <div className="p-2 bg-gray-50 rounded-lg mr-3 group-hover:bg-blue-50 transition-colors">
                                    <Clock className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Time</p>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(event.startDateTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} - {new Date(event.endDateTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start mb-5 group">
                                <div className="p-2 bg-gray-50 rounded-lg mr-3 group-hover:bg-blue-50 transition-colors">
                                    <MapPin className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Location</p>
                                    <p className="text-gray-900 font-medium">{event.location?.venue || 'Campus'}</p>
                                </div>
                            </div>

                            {/* Organized By */}
                            <div className="flex items-start mb-8 group">
                                <div className="p-2 bg-gray-50 rounded-lg mr-3 group-hover:bg-blue-50 transition-colors">
                                    <Building2 className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Organizer</p>
                                    <p className="text-gray-900 font-medium">{event.organizedBy}</p>
                                </div>
                            </div>

                            {/* Register Button */}
                            {user && user.userType === 'student' && (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering || isRegistered}
                                    className={`w-full py-3.5 rounded-lg font-bold text-lg shadow-md transition-all active:scale-95 mb-4 ${isRegistered
                                        ? 'bg-green-600 text-white cursor-default'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                                >
                                    {registering ? 'Processing...' : isRegistered ? 'Registered ✅' : 'Register for Event'}
                                </button>
                            )}

                            {!user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 mb-4 transition-all shadow-md"
                                >
                                    Login to Register
                                </button>
                            )}

                            {/* Share Button */}
                            <button className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-center group">
                                <Share2 className="w-5 h-5 mr-2 group-hover:text-blue-600" />
                                Share Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventDetails
