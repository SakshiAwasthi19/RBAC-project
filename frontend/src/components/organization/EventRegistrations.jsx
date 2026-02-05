import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Check, X, ArrowLeft, Mail, Phone, Calendar, Download } from 'lucide-react';

const EventRegistrations = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null); // studentId of currently processing action

    useEffect(() => {
        fetchRegistrations();
    }, [eventId]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const response = await organizationAPI.getEventRegistrations(eventId);
            setEventData({
                title: response.data.eventTitle,
                totalRegistrations: response.data.totalRegistrations,
                maxParticipants: response.data.maxParticipants
            });
            setRegistrations(response.data.registrations);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch registrations", err);
            setError("Failed to load registrations. Please try again.");
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (studentId, newStatus) => {
        try {
            setProcessing(studentId);
            await organizationAPI.updateRegistrationStatus(eventId, studentId, newStatus);

            // Update local state and reset attendance if rejected
            setRegistrations(prev => prev.map(reg => {
                if (reg.student?._id === studentId || reg.student === studentId) {
                    // If rejected, ensure attended is false (logic choice)
                    return { ...reg, status: newStatus, attended: newStatus === 'rejected' ? false : reg.attended };
                }
                return reg;
            }));

            setProcessing(null);
        } catch (err) {
            console.error(`Failed to ${newStatus} student`, err);
            alert(`Failed to update status. Please try again.`);
            setProcessing(null);
        }
    };

    const handleAttendance = async (studentId, attended) => {
        try {
            setProcessing(studentId);
            await organizationAPI.markAttendance(eventId, studentId, attended);

            // Update local state
            setRegistrations(prev => prev.map(reg => {
                if (reg.student?._id === studentId || reg.student === studentId) {
                    return { ...reg, attended: attended };
                }
                return reg;
            }));

            setProcessing(null);
        } catch (err) {
            console.error(`Failed to mark attendance`, err);
            alert(`Failed to mark attendance.`);
            setProcessing(null);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>;
    if (error) return <div className="text-center text-red-500 p-12">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => navigate('/organization/events')}
                        className="flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {eventData?.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Manage Registrations
                        </span>
                        <span>•</span>
                        <span className="font-medium">
                            {eventData?.totalRegistrations} / {eventData?.maxParticipants} Participants
                        </span>
                    </div>
                </div>
                <div className="mt-4 md:mt-0">
                    <button className="btn-outline flex items-center" onClick={() => alert('Export feature coming soon!')}>
                        <Download className="w-4 h-4 mr-2" />
                        Export List
                    </button>
                </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {registrations.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No registrations yet</h3>
                        <p className="text-gray-500">Share your event to start getting participants.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">College / ID</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-center py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance</th>
                                    <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {registrations.map((reg) => {
                                    const student = reg.student || {}; // Handle populated data
                                    return (
                                        <tr key={student._id || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-gray-900">
                                                    {student.firstName} {student.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Registered: {new Date(reg.registeredAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-600 mt-1">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {student.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-900">{student.collegeName}</div>
                                                <div className="text-xs text-mono text-gray-500">{student.studentId}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {reg.status ? reg.status.charAt(0).toUpperCase() + reg.status.slice(1) : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {reg.status === 'approved' ? (
                                                    <button
                                                        onClick={() => handleAttendance(student._id, !reg.attended)}
                                                        disabled={processing === student._id}
                                                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${reg.attended
                                                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {reg.attended ? 'Present' : 'Mark Present'}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {reg.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(student._id, 'approved')}
                                                            disabled={processing === student._id}
                                                            className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {reg.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(student._id, 'rejected')}
                                                            disabled={processing === student._id}
                                                            className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventRegistrations;
