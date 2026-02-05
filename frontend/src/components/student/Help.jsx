import React, { useState } from 'react';
import { Search, FileText, Smartphone, User, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Help = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);
    const [activeTab, setActiveTab] = useState('General');

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        toast.success('Message sent! Support will contact you shortly.');
        e.target.reset();
    };

    const faqs = {
        'General': [
            { q: "What are AICTE points?", a: "AICTE Activity Points are mandatory points that engineering students need to earn through extracurricular activities for their degree." },
            { q: "How many AICTE points do I need to graduate?", a: "A minimum of 100 points is required for graduation, earned throughout the 4 years of your engineering course." },
            { q: "How can I earn AICTE points?", a: "You can earn points by participating in technical workshops, hackathons, community service, sports, and cultural activities." }
        ],
        'Certificates': [
            { q: "What file formats are accepted for certificates?", a: "We accept JPG, PNG, and PDF formats for certificate uploads." },
            { q: "How long does verification take?", a: "Verification usually takes 3-5 working days by your faculty coordinator." }
        ],
        'Account': [
            { q: "How do I change my profile picture?", a: "Go to Profile Settings page and click on the camera icon on your profile picture to upload a new one." },
            { q: "Can I update my USN?", a: "USN is unique and cannot be changed once registered. Please contact admin if there is an error." }
        ]
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <button onClick={() => window.history.back()} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back
                </button>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-600 mt-2">Find answers to common questions and get support with your VTU AICTE Tracker</p>
            </div>

            {/* Search Hero */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help you?</h2>
                <p className="text-gray-500 mb-8">Search our knowledge base or browse the categories below to find answers to your questions</p>

                <div className="max-w-xl mx-auto flex shadow-sm rounded-lg overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                    <input
                        type="text"
                        placeholder="Search for help topics..."
                        className="flex-1 px-4 py-3 outline-none text-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-gray-900 text-white px-6 py-3 font-medium flex items-center hover:bg-gray-800 transition-colors">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </button>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left flex items-center space-x-4 group">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <FileText className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">How to Calculate AICTE Points</h3>
                    </div>
                    <div className="ml-auto">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                </button>

                <button className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left flex items-center space-x-4 group">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <Smartphone className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Certificate Upload Guide</h3>
                    </div>
                    <div className="ml-auto">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                </button>

                <button className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left flex items-center space-x-4 group">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        <User className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Account Management</h3>
                    </div>
                    <div className="ml-auto">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                </button>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center space-x-3 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Popular</span>
                </div>
                <p className="text-gray-500 mb-8">Find answers to common questions about AICTE points and the platform</p>

                {/* Tabs */}
                <div className="flex space-x-2 mb-8 border-b border-gray-100">
                    {Object.keys(faqs).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setActiveFaq(null); }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Accordion */}
                <div className="space-y-4">
                    {faqs[activeTab].map((faq, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                            <button
                                className="w-full flex items-center justify-between text-left py-2 focus:outline-none group"
                                onClick={() => toggleFaq(index)}
                            >
                                <span className={`font-medium transition-colors ${activeFaq === index ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                    {faq.q}
                                </span>
                                {activeFaq === index ? (
                                    <ChevronUp className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                )}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                            >
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Need More Help?</h3>
                        <p className="text-gray-500 text-sm">If you couldn't find what you're looking for, please fill out the form below and our support team will get back to you.</p>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                placeholder="What is your query about?"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                rows="4"
                                placeholder="Describe your issue in detail"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all outline-none resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>Send Message</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Help;
