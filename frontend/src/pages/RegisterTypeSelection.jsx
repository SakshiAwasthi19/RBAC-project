import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, User } from 'lucide-react';
import RegisterStudent from './RegisterStudent';
import RegisterOrganization from './RegisterOrganization';

const RegisterTypeSelection = () => {
    const [activeTab, setActiveTab] = useState('student');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full">

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>

                        {/* Header */}
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create a new account</h1>

                        <p className="text-gray-600">
                            Or <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">sign in to your existing account</Link>
                        </p>
                    </div>

                    {/* Content Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">

                        {/* Toggle Tabs */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('student')}
                                className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'student'
                                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                <span>Student</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('organization')}
                                className={`flex-1 py-4 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${activeTab === 'organization'
                                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                            >
                                <Building2 className="w-5 h-5" />
                                <span>Organization</span>
                            </button>
                        </div>

                        {/* Rendering Form */}
                        <div className="p-8">
                            {activeTab === 'student' ? (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Student Registration</h2>
                                    <p className="text-sm text-gray-500 mb-4">Enter your details to create a student account.</p>
                                    <RegisterStudent embedded={true} />
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Organization Registration</h2>
                                    <p className="text-sm text-gray-500 mb-4">Register your institution to manage events and points.</p>
                                    <RegisterOrganization embedded={true} />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RegisterTypeSelection;
