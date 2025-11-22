import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import topics from '../data/topics'

const DashboardPage = () => {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()


    return (

        <div className='p-6'>

            <h2 className='text-2xl font-bold mb-4'>
                Welcome {currentUser?.displayName || currentUser?.email} 👋
            </h2>

            <h3 className='text-xl font-semibold mb-3'>Choose Your Path 🚀</h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        className='border p-5 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 transition'
                        onClick={() => navigate(`/topic/${topic.id}`)}
                    >
                        <h4 className='text-lg font-bold mb-2'>{topic.title}</h4>
                        <p className='text-sm text-gray-600 mb-3'>{topic.description}</p>
                        <span className='text-blue-600 font-medium'>
                            Explore →
                        </span>
                    </div>
                ))}
            </div>

            <button
                className='mt-6 bg-red-500 text-white px-4 py-2 rounded'
                onClick={logout}
            >
                Logout
            </button>
        </div>
    )
}

export default DashboardPage
