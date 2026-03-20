import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Calendar, CheckCircle2, Clock, XCircle, MapPin, Award, Filter, Download } from 'lucide-react';

const ActivityLog = () => {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // all, upcoming, attended, pending
    const [filterDomain, setFilterDomain] = useState('');
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get('tab');
        if (tab && ['all', 'upcoming', 'attended', 'pending'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    useEffect(() => {
        fetchActivityLog();
    }, []);

    const fetchActivityLog = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getActivityLog(); // Backend now returns merged list
            setActivities(response.data.activities);
        } catch (error) {
            console.error("Failed to fetch activity log", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredActivities = activities.filter(activity => {
        // Tab Filter
        if (activeTab === 'upcoming') {
            // Priority: Exclude attended/completed events from upcoming even if date is in future
            return activity.isUpcoming && activity.status !== 'rejected' && activity.status !== 'attended' && activity.status !== 'approved';
        }
        if (activeTab === 'attended') {
            // Include explicitly attended OR verified (approved) past activities
            return activity.status === 'attended' || (activity.status === 'approved' && !activity.isUpcoming);
        }
        if (activeTab === 'pending') {
            // Only show self-reported pending activities here
            return activity.status === 'pending' && activity.type === 'activity';
        }
        // Domain Filter
        if (filterDomain && activity.domain !== filterDomain) return false;

        return true;
    });

    const getStatusBadge = (status, isUpcoming, type) => {
        // Priority: Attended/Verified status should always show over 'Upcoming' flag
        if (status === 'attended') {
            return <span className="bg-green-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Attended</span>;
        }
        if (status === 'approved' && type === 'activity') {
            return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</span>;
        }

        if (isUpcoming && status !== 'rejected') {
            return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-200 shadow-sm flex items-center"><Calendar className="w-3 h-3 mr-1" /> Upcoming</span>;
        }

        switch (status) {
            case 'attended':
                return <span className="bg-green-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Attended</span>;
            case 'approved':
                return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</span>;
            case 'pending':
                if (type === 'event') {
                    return <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center border border-blue-100"><Clock className="w-3 h-3 mr-1" /> Registered</span>;
                }
                return <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center border border-orange-200"><Clock className="w-3 h-3 mr-1" /> Pending Review</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center border border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{status}</span>;
        }
    };

    const tabs = [
        { id: 'all', label: 'All Activities' },
        { id: 'upcoming', label: 'Upcoming Events' },
        { id: 'attended', label: 'Completed / Attended' },
        { id: 'pending', label: 'Pending Approval' }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                    <p className="text-gray-500 text-sm">Track your event registrations and self-reported activities.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        value={filterDomain}
                        onChange={(e) => setFilterDomain(e.target.value)}
                    >
                        <option value="">All Domains</option>
                        <option value="Technical">Technical</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Community Service">Community Service</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Sports">Sports</option>
                        <option value="Environmental">Environmental</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Activity List */}
            {loading ? (
                <div className="flex justify-center py-12"><LoadingSpinner /></div>
            ) : filteredActivities.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {filteredActivities.map((activity) => (
                            <li key={`${activity.type}-${activity._id}`} className="hover:bg-gray-50 transition-colors duration-150">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {/* Domain Icon Placeholder - could be dynamic */}
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Award className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-blue-600 truncate">{activity.title}</p>
                                                <p className="flex items-center text-sm text-gray-500 w-full sm:w-auto">
                                                    <span className="truncate">{activity.type === 'event' ? activity.details.organizedBy : 'Self Reported'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0 space-y-1">
                                            {getStatusBadge(activity.status, activity.isUpcoming, activity.type)}
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <span className="whitespace-nowrap">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 mr-6">
                                                <Award className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                {activity.aictePoints} AICTE Points
                                            </p>
                                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                {activity.type === 'event' && activity.details.venue ? activity.details.venue : 'N/A'}
                                            </p>
                                        </div>
                                        {activity.type === 'event' && activity.details.passId && (
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 font-mono bg-gray-50 px-2 rounded border border-gray-200">
                                                Pass ID: {activity.details.passId}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <Award className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'all' ? "You haven't participated in any activities yet." : `No activities in '${activeTab}' tab.`}
                    </p>
                    {activeTab === 'upcoming' && (
                        <div className="mt-6">
                            <a href="/events" className="btn-primary px-4 py-2 text-sm">Browse Events</a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLog;
