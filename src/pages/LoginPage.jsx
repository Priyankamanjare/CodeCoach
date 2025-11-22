import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const LoginPage = () => {
    const { login, googleSignIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(email, password)
            navigate("/dashboard")
        } catch {
            setError("Login failed")
        }
    }

    return (
        <div className='max-w-sm mx-auto mt-20'>
            <h2 className='text-2xl font-bold mb-4'>Login</h2>
            {error && <p className='text-red-500'>{error}</p>}

            <form className='space-y-3' onSubmit={handleSubmit}>
                <input className='w-full border p-2'
                    type="email" placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)} />

                <input className='w-full border p-2'
                    type="password" placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)} />

                <button className='w-full bg-blue-600 text-white p-2 rounded'>
                    Login
                </button>
                <button
                    onClick={async () => {
                        try {
                            await googleSignIn();
                            navigate("/dashboard");
                        } catch (err) {
                            console.log(err);
                        }
                    }}
                    className="w-full bg-white border flex justify-center items-center gap-2 py-2 rounded shadow mt-2"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Sign in with Google
                </button>

            </form>

            <p className='mt-4 text-sm'>
                New User? <Link className='text-blue-600' to="/register">Create Account</Link>
            </p>
        </div>
    )
}

export default LoginPage
