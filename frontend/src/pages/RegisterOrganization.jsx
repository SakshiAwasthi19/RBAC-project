import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const RegisterOrganization = ({ embedded = false }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            // Transform data to match Organization schema requirements
            const payload = {
                email: data.email,
                password: data.password,
                userType: 'organization',
                institutionName: data.institutionName,
                aicteApprovalNumber: data.aicteApprovalNumber,
                organizationType: data.organizationType,
                fullName: data.fullName,
                designation: data.designation,
                authorizedPersonName: data.authorizedPersonName || data.fullName,
                contactNumber: data.contactNumber,
                // These are now optional
                location: {
                    type: 'Point',
                    coordinates: [77.5946, 12.9716] // Default coordinates
                }
            };

            const response = await authAPI.register(payload);
            if (response.success) {
                toast.success('Organization Account Created! Please Login.');
                navigate('/login');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration Failed';
            toast.error(message);
        }
    };

    const formContent = (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {/* Account Info */}
                <div className="sm:col-span-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2 border-b pb-2">Account Details</h3>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Institution / Organization Name</label>
                    <input
                        type="text"
                        {...register("institutionName", { required: "Institution Name is required" })}
                        className="input-field mt-1"
                        placeholder="e.g. BMS College of Engineering"
                    />
                    {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Official Email</label>
                    <input
                        type="email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                        })}
                        className="input-field mt-1"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                        className="input-field mt-1"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Organization Details */}
                <div className="sm:col-span-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4 mb-2 border-b pb-2">Organization Details</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">AICTE Approval Number</label>
                    <input
                        type="text"
                        {...register("aicteApprovalNumber", { required: "AICTE Number is required" })}
                        className="input-field mt-1"
                        placeholder="Unique ID"
                    />
                    {errors.aicteApprovalNumber && <p className="text-red-500 text-xs mt-1">{errors.aicteApprovalNumber.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Type</label>
                    <select
                        {...register("organizationType")}
                        className="input-field mt-1"
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

                {/* Contact Person */}
                <div className="sm:col-span-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4 mb-2 border-b pb-2">Contact Person</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        {...register("fullName", { required: "Contact Person Name is required" })}
                        className="input-field mt-1"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                    <input
                        type="text"
                        {...register("designation", { required: "Designation is required" })}
                        className="input-field mt-1"
                    />
                    {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                        type="tel"
                        {...register("contactNumber", { required: "Phone is required" })}
                        className="input-field mt-1"
                    />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Authorized Person Name</label>
                    <input
                        type="text"
                        {...register("authorizedPersonName")}
                        className="input-field mt-1"
                        placeholder="If different from above"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full"
                >
                    {isSubmitting ? 'Creating Organization Account...' : 'Register Organization'}
                </button>
            </div>
        </form>
    );

    if (embedded) {
        return formContent;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-slide-up">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Organization Registration
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join as an Event Organizer. {' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </Link>
                    </p>
                </div>

                {formContent}
            </div>
        </div>
    );
};

export default RegisterOrganization;
