import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import { User, Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, getCurrentUser } = useAuth(); // We might need to refresh global user state after update
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profilePic, setProfilePic] = useState(null); // Preview URL
    const [selectedFile, setSelectedFile] = useState(null); // File object
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await studentAPI.getProfile();
            if (response.success) {
                const data = response.data;
                // Pre-fill form
                reset({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    studentId: data.studentId, // USN
                    collegeName: data.collegeName,

                    // Academic
                    year: data.year || '1', // Default or from data
                    branch: data.branch,
                    semester: data.semester,
                    graduationYear: data.graduationYear || '',

                    // Contact
                    address: data.address || '',
                    phoneNumber: data.phoneNumber
                });

                // Set Profile Pic
                if (data.profilePicture?.url) {
                    setProfilePic(data.profilePicture.url);
                }
            }
        } catch (error) {
            toast.error('Failed to load profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate size/type if needed
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            // 1. Upload Picture if changed
            if (selectedFile) {
                const formData = new FormData();
                formData.append('profilePicture', selectedFile);
                await studentAPI.uploadProfilePicture(formData);
            }

            // 2. Update Text Data
            await studentAPI.updateProfile(data);

            toast.success('Profile updated successfully!');
            // Refresh global user content if needed (e.g. navbar name)
            await getCurrentUser();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                {/* Optional: Add Last Updated Info */}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Basic & Academic Info */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Basic Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-2">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    {...register("firstName", { required: "Required" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    {...register("lastName", { required: "Required" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                                <input
                                    type="text"
                                    {...register("collegeName")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (USN)</label>
                                <input
                                    type="text"
                                    {...register("studentId")}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-2">Academic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch/Department</label>
                                <input
                                    type="text"
                                    {...register("branch")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                                <select
                                    {...register("semester")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                                <select
                                    {...register("year")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year (Est.)</label>
                                <input
                                    type="text"
                                    {...register("graduationYear")}
                                    placeholder="e.g. 2026"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile Pic & Contact */}
                <div className="space-y-8">

                    {/* Profile Picture Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 w-full text-left border-b border-gray-50 pb-2">Profile Picture</h2>

                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg relative">
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <User className="w-20 h-20" />
                                    </div>
                                )}

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full text-white shadow-md group-hover:bg-blue-700 transition-colors">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-gray-500">Click to upload a new profile picture</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF (Max 5MB)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-2">Contact Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    {...register("phoneNumber", { required: "Required" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    {...register("address")}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Current residential address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary flex items-center space-x-2 px-8 py-3 w-full justify-center lg:w-auto"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default Profile;
