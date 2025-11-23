import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import topics from '../data/topics'
import jsFlashcards from '../data/jsFlashcards'

const TopicPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const topic = topics.find(t => t.id === id)

    if (!topic) return <div className="p-6">Topic not found</div>

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
            <p className="text-gray-600 mb-6">{topic.description}</p>

            {/* Flashcards only for JS currently */}
            {id === "javascript" && (
                <>
                    <h3 className="text-xl font-semibold mb-2">Flashcards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {jsFlashcards.map((card, index) => (
                            <div key={index} className="border p-4 rounded shadow-sm">
                                <p className="font-medium">Q: {card.question}</p>
                                <p className="text-sm text-gray-700 mt-2">A: {card.answer}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
            <div className="flex gap-4">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate(`/interview?topic=${topic.title}`)}
                >
                    Start Mock Interview 🎤
                </button>
                <button
                    className="bg-purple-600 text-white w-full py-3 rounded"
                    onClick={() => navigate(`/voice-interview?topic=${topic.title}`)}
                >
                    🎙️ Start Voice Interview
                </button>
            </div>
        </div>
    )
}

export default TopicPage
