import React, { useState, useEffect, useRef } from 'react';
import {
    PlusCircle, Upload, CheckCircle2, AlertCircle,
    Calendar, Tag, FileText, Send, Image as ImageIcon,
    ChevronRight, ArrowLeft, Trophy, X
} from 'lucide-react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ReportActivity = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activities, setActivities] = useState([]);
    const [formData, setFormData] = useState({
        mode: 'event', // 'event' or 'manual'
        selectedEventId: '',
        title: '',
        domain: 'Technical',
        aictePoints: '',
        date: new Date().toISOString().split('T')[0],
        semester: '',
        description: ''
    });
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchActivityData();
    }, []);

    const fetchActivityData = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getActivityLog();
            // We only want events that the user has attended but might not have proof for
            // or just all attended/verified activities.
            setActivities(response.data.activities.filter(a => a.status === 'attended' || a.status === 'approved'));

            // Get student profile for current semester
            const profile = await studentAPI.getProfile();
            setFormData(prev => ({ ...prev, semester: profile.data.semester }));

        } catch (err) {
            console.error('Data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let activityId = formData.selectedEventId;

            // 1. If Manual, create the activity first
            if (formData.mode === 'manual') {
                const newActivity = await studentAPI.addActivity({
                    title: formData.title,
                    description: formData.description,
                    domain: formData.domain,
                    aictePoints: Number(formData.aictePoints),
                    date: formData.date,
                    semester: Number(formData.semester)
                });
                activityId = newActivity.data._id;
            }

            if (!activityId) throw new Error("No activity selected or created");

            // 2. Upload Proofs (Files)
            if (files.length > 0) {
                for (const file of files) {
                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    uploadData.append('uploadType', 'certificate');
                    await studentAPI.uploadCertificate(activityId, uploadData);
                }
            }

            setSuccess(true);
            // Reset form
            setFormData({
                mode: 'event',
                selectedEventId: '',
                title: '',
                domain: 'Technical',
                aictePoints: '',
                date: new Date().toISOString().split('T')[0],
                semester: formData.semester,
                description: ''
            });
            setFiles([]);

        } catch (err) {
            console.error('Submission failed:', err);
            alert("Failed to subit activity: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>;

    if (success) {
        return (
            <div className="max-w-2xl mx-auto mt-12 text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Activity Reported!</h1>
                <p className="text-gray-600">
                    Your activity and proofs have been submitted successfully.
                    Pending activities will be reviewed by the coordinator.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setSuccess(false)}
                        className="btn-primary"
                    >
                        Report Another
                    </button>
                    <a href="/student/activity-log" className="btn-outline">
                        View Activity Log
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Report Activity</h1>
                <p className="text-gray-500">Claim AICTE points for events you've attended or your accomplishments.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Mode Selector */}
                <div className="flex border-b border-gray-100">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mode: 'event' }))}
                        className={`flex-1 py-4 text-center font-bold transition-colors ${formData.mode === 'event' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Attended Event Proof
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mode: 'manual' }))}
                        className={`flex-1 py-4 text-center font-bold transition-colors ${formData.mode === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Self-Reported Activity
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.mode === 'event' ? (
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Select Event</label>
                                <select
                                    name="selectedEventId"
                                    required
                                    value={formData.selectedEventId}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">-- Choose an event you attended --</option>
                                    {activities.map(act => (
                                        <option key={act._id} value={act._id}>
                                            {act.title} ({new Date(act.date).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400">Can't find your event? Make sure you registered and attended it first.</p>
                            </div>
                        ) : (
                            <>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Activity Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g. MOOC Course, Hackathon Winner, Seminar"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Domain</label>
                                    <select
                                        name="domain"
                                        value={formData.domain}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Technical">Technical</option>
                                        <option value="Soft Skills">Soft Skills</option>
                                        <option value="Community Service">Community Service</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Environmental">Environmental</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Expected Points</label>
                                    <input
                                        type="number"
                                        name="aictePoints"
                                        required
                                        value={formData.aictePoints}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Current Semester</label>
                                    <input
                                        type="number"
                                        name="semester"
                                        required
                                        min="1"
                                        max="8"
                                        value={formData.semester}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Proof Upload */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Upload Proofs (Certificates / Photos)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 group"
                        >
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                            <p className="text-gray-600 font-medium">Click to upload files</p>
                            <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG (Max 5MB each)</p>
                            <input
                                type="file"
                                multiple
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </div>

                        {/* File Preview */}
                        {files.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            {file.type.includes('image') ? <ImageIcon className="text-blue-600 flex-shrink-0" /> : <FileText className="text-blue-600 flex-shrink-0" />}
                                            <span className="text-sm font-medium text-blue-900 truncate">{file.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="p-1 hover:bg-blue-200 rounded-full text-blue-900"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Description / Remarks (Optional)</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Add any additional details about your activity..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || (formData.mode === 'event' && !formData.selectedEventId)}
                        className="w-full btn-primary py-4 text-lg shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center space-x-2"
                    >
                        {submitting ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span>Submitting Proofs...</span>
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                <span>Submit Activity Report</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 flex items-start space-x-4">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-yellow-800 space-y-2">
                    <p className="font-bold">Important Notice</p>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                        <li>Falsified claims may lead to disciplinary action.</li>
                        <li>Self-reported activities require manual verification by the coordinator.</li>
                        <li>Ensure the certificate clearly shows your name and the activity date.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportActivity;
