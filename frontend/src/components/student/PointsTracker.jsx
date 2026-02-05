import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Award, TrendingUp, Info } from 'lucide-react';

const PointsTracker = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchPointsData();
    }, []);

    const fetchPointsData = async () => {
        try {
            const response = await studentAPI.getPointsSummary();
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch points data", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>;
    if (!data) return <div className="text-center p-12 text-red-500">Failed to load data</div>;

    // Prepare Chart Data
    const categoryData = Object.entries(data.pointsByCategory).map(([name, value]) => ({
        name,
        value
    })).filter(item => item.value > 0);

    // If no data, show placeholder
    const chartData = categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1 }];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                            Total Scored
                        </span>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-4xl font-bold">{data.totalPoints}</h3>
                        <p className="text-blue-100 text-sm mt-1">out of 100 required points</p>
                    </div>
                    <div className="mt-6 bg-blue-900/30 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-green-400 transition-all duration-1000"
                            style={{ width: `${Math.min(100, (data.totalPoints / 100) * 100)}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <h3 className="font-semibold text-gray-700">Progress Status</h3>
                    </div>
                    <div className="flex items-center justify-between mt-8">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{data.progress?.percentage.toFixed(0)}%</p>
                            <p className="text-gray-500 text-sm">Completed</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-orange-500">{data.progress?.remaining}</p>
                            <p className="text-gray-500 text-sm">Points to go</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-start space-x-3">
                        <Info className="w-6 h-6 text-blue-500 mt-1" />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Did you know?</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                You can earn up to 20 points per semester. Try to diversify your activities across Technical and Social domains for a well-rounded profile.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Points by Category</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Semester Wise */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Semester-wise Progress</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.semesterWisePoints}>
                                <XAxis dataKey="semester" tickFormatter={(val) => `Sem ${val}`} />
                                <YAxis />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="points" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Category Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points Earned</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(data.pointsByCategory).map(([category, points]) => (
                                <tr key={category}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{points}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {points > 0 ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                No Activity
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default PointsTracker;
