import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { organizationAPI } from '../../services/api';
import { Building2, Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, getCurrentUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [initialLocation, setInitialLocation] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await organizationAPI.getProfile();
            if (response.success) {
                const data = response.data;
                // Pre-fill form (map backend fields to inputs)
                reset({
                    fullName: data.fullName,
                    designation: data.designation,
                    authorizedPersonName: data.authorizedPersonName,
                    institutionName: data.institutionName,
                    aicteApprovalNumber: data.aicteApprovalNumber,
                    organizationEmail: data.organizationEmail,
                    contactNumber: data.contactNumber,
                    website: data.website || '',
                    description: data.description || '',
                    organizationType: data.organizationType || 'College/University',
                    address: data.location?.address || '',
                    city: data.location?.city || '',
                    state: data.location?.state || '',
                    pincode: data.location?.pincode || ''
                });

                // Save initial location to preserve coordinates
                setInitialLocation(data.location);

                // Set Logo Preview
                if (data.organizationLogo?.url) {
                    setLogoPreview(data.organizationLogo.url);
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
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
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
            // 1. Upload Logo if changed
            if (selectedFile) {
                const formData = new FormData();
                formData.append('organizationLogo', selectedFile);
                await organizationAPI.uploadLogo(formData);
            }

            // 2. Update Text Data
            const payload = {
                ...data,
                location: {
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    coordinates: initialLocation?.coordinates || [77.5946, 12.9716]
                }
            };
            await organizationAPI.updateProfile(payload);

            toast.success('Organization profile updated!');
            await getCurrentUser(); // Refresh global user state

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
                <div>
                    <button
                        onClick={() => navigate('/organization')}
                        className="text-gray-500 hover:text-blue-600 flex items-center mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Organization Profile Settings</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Personal & Institution Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Details (Contact Person) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-2">Personal Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Contact Person)</label>
                                <input
                                    type="text"
                                    {...register("fullName", { required: "Required" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        {...register("designation", { required: "Required" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Person Name</label>
                                    <input
                                        type="text"
                                        {...register("authorizedPersonName", { required: "Required" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Institution Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-2">Institution Details</h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                                    <input
                                        type="text"
                                        {...register("institutionName", { required: "Required" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">AICTE Approval Number</label>
                                    <input
                                        type="text"
                                        {...register("aicteApprovalNumber", { required: "Required" })}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                                    <select
                                        {...register("organizationType")}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="College/University">College/University</option>
                                        <option value="NGO">NGO</option>
                                        <option value="Corporate">Corporate</option>
                                        <option value="Government Body">Government Body</option>
                                        <option value="Student Organization">Student Organization</option>
                                        <option value="Professional Body">Professional Body</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    type="url"
                                    {...register("website")}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    placeholder="Brief about your organization..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-2">Location</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    {...register("address")}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    {...register("city")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    {...register("state")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                <input
                                    type="text"
                                    {...register("pincode")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Logo & Contact */}
                <div className="space-y-8">

                    {/* Organization Logo Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 w-full text-left border-b border-gray-50 pb-2">Organization Logo</h2>

                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <div className="w-40 h-40 rounded-full bg-gray-50 overflow-hidden border-4 border-white shadow-lg relative flex items-center justify-center">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-16 h-16 text-gray-300" />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-blue-600 font-medium hover:underline cursor-pointer" onClick={triggerFileInput}>Click to upload a new logo</p>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Email</label>
                                <input
                                    type="email"
                                    {...register("organizationEmail", { required: "Required" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input
                                    type="tel"
                                    {...register("contactNumber", { required: "Required" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
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
