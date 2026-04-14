import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'

export default function ClientApp() {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                    <Toaster position="top-right" />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    )
}
