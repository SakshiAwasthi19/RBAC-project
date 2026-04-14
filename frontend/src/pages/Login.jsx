import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const user = await login(data.email, data.password);
            if (user) {
                if (user.userType === 'student') navigate('/student');
                else if (user.userType === 'admin') navigate('/admin');
                else navigate('/organization');
            }
        } catch (error) {
            console.error("Login redirect error", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Sign in to Pointmate
                    </h2>
                    <div className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <div className="flex flex-col gap-1 mt-2">
                            <Link to="/register-student" className="font-medium text-primary-600 hover:text-primary-500">
                                Create Student Account
                            </Link>
                            <Link to="/register-organization" className="font-medium text-blue-600 hover:text-blue-500">
                                Register as Organization
                            </Link>
                        </div>
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                type="email"
                                disabled={isSubmitting}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="Email address"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                disabled={isSubmitting}
                                {...register("password", { required: "Password is required" })}
                                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="Password"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
