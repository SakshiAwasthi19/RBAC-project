import React, { useState, useEffect, useRef } from 'react';
import {
    FileText, Download, Eye, Calendar,
    Tag, Search, Filter, Upload, CheckCircle, AlertCircle, Plus, Award, ExternalLink, Trash2
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Certificates = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null); // ID of activity being uploaded to
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef(null);
    const [currentActivityId, setCurrentActivityId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;

        let cleanPath = url;
        // Handle legacy full paths from database (e.g. file:///C:/.../uploads/file.pdf)
        if (url.includes('/uploads/')) {
            cleanPath = '/uploads/' + url.split('/uploads/').pop();
        } else if (url.includes('\\uploads\\')) {
            cleanPath = '/uploads/' + url.split('\\uploads\\').pop();
        }

        const baseUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:5000';

        return `${baseUrl}${cleanPath}`;
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getActivityLog();
            // Filter COMPLETED, APPROVED or PENDING (self-reported)
            // CRITICAL: Exclude 'Upcoming' platform events UNLESS they are marked 'attended'
            const eligible = response.data.activities.filter(act =>
                act.status === 'attended' ||
                ((act.status === 'approved' || act.status === 'pending') && !act.isUpcoming)
            );
            setActivities(eligible);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch certificates:', err);
            setError('Could not load activity data.');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = (activityId) => {
        setCurrentActivityId(activityId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentActivityId) return;

        // Find the specific activityId for this item
        const activity = activities.find(a => a._id === currentActivityId || a.activityId === currentActivityId);

        // Priority: Use activityId (linked activity record) > _id (the item's primary identifier)
        const targetId = activity?.activityId || activity?._id;

        if (!targetId) {
            alert("Error identifying activity target.");
            return;
        }

        try {
            setUploading(currentActivityId);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('uploadType', 'certificate');

            await studentAPI.uploadCertificate(targetId, formData);

            // Refresh
            await fetchData();
            alert("Certificate uploaded successfully!");
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload certificate. " + (err.response?.data?.message || ""));
        } finally {
            setUploading(null);
            setCurrentActivityId(null);
            e.target.value = ''; // Reset input
        }
    };

    const handleDelete = async (activityId, certificateId) => {
        if (!window.confirm("Are you sure you want to delete this certificate?")) return;

        try {
            await studentAPI.deleteCertificate(activityId, certificateId);
            await fetchData();
            // Optional: toast or subtle alert
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete certificate.");
        }
    };

    const domains = ['All', 'Technical', 'Soft Skills', 'Community Service', 'Cultural', 'Sports', 'Environmental'];

    const filteredActivities = activities.filter(act => {
        const matchesFilter = filter === 'All' || act.domain === filter;
        const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getDomainColor = (domain) => {
        const colors = {
            'Technical': 'bg-blue-100 text-blue-700',
            'Soft Skills': 'bg-purple-100 text-purple-700',
            'Community Service': 'bg-green-100 text-green-700',
            'Cultural': 'bg-pink-100 text-pink-700',
            'Sports': 'bg-orange-100 text-orange-700',
            'Environmental': 'bg-teal-100 text-teal-700'
        };
        return colors[domain] || 'bg-gray-100 text-gray-700';
    };

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Certificates & Proofs</h2>
                    <p className="text-gray-500">Upload certificates for your attended events and verified activities.</p>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
            />

            {/* Filters and Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by activity title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="lg:col-span-2 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {domains.map(d => (
                        <button
                            key={d}
                            onClick={() => setFilter(d)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === d
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {filteredActivities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Attended Events</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Once you attend an event or a self-reported activity is verified, it will appear here for certificate upload.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredActivities.map((act) => {
                        const hasCerts = act.certificates && act.certificates.length > 0;
                        const isUploading = uploading === act._id;

                        return (
                            <div key={act._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getDomainColor(act.domain)}`}>
                                                {act.domain}
                                            </span>
                                            {act.status === 'attended' && (
                                                <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Attended</span>
                                            )}
                                            {act.status === 'pending' && (
                                                <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-orange-200">Pending Review</span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                            {act.title}
                                        </h4>
                                        <div className="text-xs text-gray-500 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            Event Date: {new Date(act.date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        {act.status !== 'pending' ? (
                                            <>
                                                <div className="text-blue-600 font-bold text-sm">+{act.aictePoints} Pts</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">AICTE Unit</div>
                                            </>
                                        ) : (
                                            <div className="text-gray-400 font-bold text-xs italic">Points Pending</div>
                                        )}
                                    </div>
                                </div>

                                {/* Certificates List or Upload CTA */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col justify-center items-center min-h-[120px]">
                                    {hasCerts ? (
                                        <div className="w-full space-y-3">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Uploaded Certificates</div>
                                            {act.certificates.map((cert, idx) => (
                                                <div key={cert._id} className="flex items-center justify-between bg-white p-2.5 rounded-md border border-gray-200 group/cert">
                                                    <div className="flex items-center space-x-3 overflow-hidden">
                                                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold text-gray-900 truncate">Certificate_{idx + 1}.pdf</div>
                                                            <div className="text-[10px] text-gray-500">
                                                                Uploaded: {new Date(cert.uploadedAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-1 transition-all">
                                                        <a
                                                            href={getFullUrl(cert.url)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <a
                                                            href={getFullUrl(cert.url)}
                                                            download
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDelete(act.activityId || act._id, cert._id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => handleUploadClick(act._id)}
                                                disabled={isUploading}
                                                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-600 text-xs font-bold transition-all flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Add Another
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300 shadow-sm">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3">No certificate uploaded yet.</p>
                                            <button
                                                onClick={() => handleUploadClick(act._id)}
                                                disabled={isUploading}
                                                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center mx-auto shadow-md hover:shadow-lg disabled:opacity-50"
                                            >
                                                {isUploading ? <LoadingSpinner size="sm" /> : <><Upload className="w-4 h-4 mr-2" /> Upload Proof</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Certificates;
