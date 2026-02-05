import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRight, CheckCircle, Lightbulb, Heart, Users, Wrench,
    GraduationCap, Building2, MapPin, Calendar, Shield, Clock,
    ChevronDown, ChevronUp, Facebook, Twitter, Instagram, Linkedin, Mail
} from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        { q: "What are AICTE points and why do I need 100 of them?", a: "AICTE Activity Points are a mandatory requirement used to award the degree for engineering students. You must earn a minimum of 100 points through various extracurricular activities like technical workshops, community service, and innovation projects during your 4-year course to be eligible for graduation." },
        { q: "How does the app notify me about nearby events?", a: "The app uses your location preferences and college details to recommend relevant events happening near you. You can enable push notifications or check the 'Events' section regularly to get updates on workshops, hackathons, and seminars." },
        { q: "Can I track points for activities I've already completed?", a: "Yes! You can manually add past activities in the 'Activity Log' section. Simply upload your certificate and provide the event details for verification by your college coordinator." },
        { q: "How secure is the certificate storage feature?", a: "Your certificates are stored securely in the cloud using industry-standard encryption. You can access them anytime from your dashboard, ensuring you never lose proof of your achievements." },
        { q: "Is the app officially recognized by VTU?", a: "This app is designed according to VTU and AICTE guidelines to help students track their points effectively. However, final element verification is always done by your respective college HOD or faculty coordinator." },
        { q: "How do I verify that an event qualifies for AICTE points?", a: "Look for the AICTE logo or explicit mention of 'Activity Points' in the event brochure. Our app also uses AI to scan event details and predict if an event is likely to be eligible for points before you register." }
    ];

    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 animate-fade-in">
                        Track Your AICTE Points Journey
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                        Participate in campus activities, workshops, and events to earn points required for your graduation. Monitor your progress and never miss an opportunity.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to={user ? (user.userType === 'organization' ? '/organization' : '/student') : '/get-started'}
                            className="btn-primary bg-white text-blue-700 hover:bg-blue-50 border-none px-8 py-3 text-lg"
                        >
                            Get Started
                        </Link>
                        <Link to="/events" className="btn-outline border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                            Browse Events
                        </Link>
                    </div>
                </div>
            </section>

            {/* How AICTE Points Work */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How AICTE Points Work</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Students need a minimum of 100 points to graduate. Points can be earned across various domains through participation in different activities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card hover:shadow-lg transition-all text-center group">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                                <Wrench className="w-6 h-6 text-blue-600 group-hover:text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Technical Skills</h3>
                            <p className="text-gray-600 text-sm">Workshops, hackathons, coding competitions, technical seminars</p>
                        </div>

                        <div className="card hover:shadow-lg transition-all text-center group">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600 transition-colors">
                                <Users className="w-6 h-6 text-purple-600 group-hover:text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Soft Skills</h3>
                            <p className="text-gray-600 text-sm">Leadership programs, communication workshops, personality development</p>
                        </div>

                        <div className="card hover:shadow-lg transition-all text-center group">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 transition-colors">
                                <Heart className="w-6 h-6 text-red-600 group-hover:text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Community Service</h3>
                            <p className="text-gray-600 text-sm">Volunteering, social initiatives, blood donation, outreach programs</p>
                        </div>

                        <div className="card hover:shadow-lg transition-all text-center group">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-600 transition-colors">
                                <Lightbulb className="w-6 h-6 text-yellow-600 group-hover:text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Innovation & Entrep.</h3>
                            <p className="text-gray-600 text-sm">Startup competitions, business challenges, ideation workshops</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Students Love Text Sections */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-gray-900">Why VTU Students Love This App</h2>

                        <div className="flex start space-x-4">
                            <div className="p-2 bg-blue-50 rounded-lg h-fit">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">No More Last Minute Rush</h3>
                                <p className="text-gray-600">Track and plan your point accumulation throughout your academic journey to avoid final year panic.</p>
                            </div>
                        </div>

                        <div className="flex start space-x-4">
                            <div className="p-2 bg-green-50 rounded-lg h-fit">
                                <MapPin className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Discover Relevant Activities</h3>
                                <p className="text-gray-600">Find events that match your interests and career goals, all while earning the points you need.</p>
                            </div>
                        </div>

                        <div className="flex start space-x-4">
                            <div className="p-2 bg-purple-50 rounded-lg h-fit">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Never Lose a Certificate Again</h3>
                                <p className="text-gray-600">Securely store all your activity certificates and event photos in the cloud.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mock Timeline Preview */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <GraduationCap className="w-64 h-64" />
                        </div>
                        <h3 className="text-xl font-bold mb-6">Recent Activity Timeline</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">IEEE Technical Talk</p>
                                        <p className="text-xs text-gray-500">Technical • 2 days ago</p>
                                    </div>
                                </div>
                                <span className="font-bold text-blue-600">+5 pts</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Blood Donation Camp</p>
                                        <p className="text-xs text-gray-500">Community • 1 week ago</p>
                                    </div>
                                </div>
                                <span className="font-bold text-blue-600">+10 pts</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border-l-4 border-l-orange-500">
                                <div className="flex items-center space-x-3">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">Smart India Ideathon</p>
                                        <p className="text-xs text-gray-500">Pending Approval</p>
                                    </div>
                                </div>
                                <span className="font-bold text-orange-500">15 pts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-blue-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-500 text-lg">Get answers to common questions about our app and AICTE points</p>
                    </div>
                    <div className="space-y-0 border-t border-gray-100">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border-b border-gray-100">
                                <button
                                    className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
                                    onClick={() => toggleFaq(idx)}
                                >
                                    <span className={`text-lg font-medium transition-colors ${openFaq === idx ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`}>
                                        {faq.q}
                                    </span>
                                    {openFaq === idx ?
                                        <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0 ml-4" /> :
                                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-4" />
                                    }
                                </button>
                                {openFaq === idx && (
                                    <div className="pb-6 pr-12 text-gray-600 animate-slide-up leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features For Everyone */}
            <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Features For Everyone</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* For Students */}
                        <div className="bg-gray-50 rounded-2xl shadow-sm p-8 border border-gray-100">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <GraduationCap className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">For Students</h3>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Track your event progress and points</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Discover and register for upcoming events</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Stay aware of deadlines and status updates</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Print reports and certificates</span>
                                </li>
                            </ul>
                            {user?.userType === 'student' ? (
                                <Link to="/student" className="btn-primary w-full">Go to Dashboard</Link>
                            ) : (
                                <Link to="/register-student" className="btn-primary w-full">Sign Up as Student</Link>
                            )}
                        </div>

                        {/* For Organizations */}
                        <div className="bg-gray-50 rounded-2xl shadow-sm p-8 border border-gray-100">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Building2 className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">For Organizations</h3>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Create and manage events efficiently</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Verify participation and award points</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Manage multiple users and roles</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-700">Track overall student participation stats</span>
                                </li>
                            </ul>
                            {user?.userType === 'organization' ? (
                                <Link to="/organization" className="btn-secondary w-full bg-orange-100 text-orange-700 hover:bg-orange-200">
                                    Go to Home Page
                                </Link>
                            ) : (
                                <Link to="/register-org" className="btn-secondary w-full bg-orange-100 text-orange-700 hover:bg-orange-200">
                                    Sign Up as Organization
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-blue-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">PointMate</span>
                            </div>
                            <p className="text-blue-100 text-sm mb-6 max-w-sm">
                                Empowering students to track, manage, and showcase their extra-curricular achievements effortlessly.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-blue-200 hover:text-white transition"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="text-blue-200 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-blue-200 hover:text-white transition"><Instagram className="w-5 h-5" /></a>
                                <a href="#" className="text-blue-200 hover:text-white transition"><Linkedin className="w-5 h-5" /></a>
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-blue-50">Quick Links</h3>
                            <ul className="space-y-2 text-sm text-blue-200">
                                <li><Link to="/" className="hover:text-white">Home</Link></li>
                                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                                <li><Link to="/events" className="hover:text-white">Events</Link></li>
                                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact Support</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-blue-50">Resources</h3>
                            <ul className="space-y-2 text-sm text-blue-200">
                                <li><a href="#" className="hover:text-white">VTU Official Website</a></li>
                                <li><a href="#" className="hover:text-white">AICTE Activity Guidelines</a></li>
                                <li><a href="#" className="hover:text-white">Student Handbook</a></li>
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-blue-800 pt-8 text-center text-sm text-blue-300">
                        <p>© 2025 AICTE Tracker for VTU Students. All rights reserved.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;
