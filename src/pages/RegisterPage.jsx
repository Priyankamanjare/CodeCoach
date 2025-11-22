import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const RegisterPage = () => {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setError("")
            await register(email, password)
            navigate("/dashboard")
        } catch {
            setError("Signup failed")
        }
    }

    return (
        <div className='max-w-sm mx-auto mt-20'>
            <h2 className='text-2xl font-bold mb-4'>Create Account</h2>
            {error && <p className='text-red-500'>{error}</p>}

            <form className='space-y-3' onSubmit={handleSubmit}>
                <input className='w-full border p-2'
                    type="email" placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)} />

                <input className='w-full border p-2'
                    type="password" placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)} />

                <button className='w-full bg-blue-600 text-white p-2 rounded'>
                    Sign Up
                </button>
            </form>

            <p className='mt-4 text-sm'>
                Already have an account? <Link className='text-blue-600' to="/login">Login</Link>
            </p>
        </div>
    )
}

export default RegisterPage
