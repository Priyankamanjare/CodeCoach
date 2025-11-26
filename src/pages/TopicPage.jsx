import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import topics from '../data/topics'
import jsFlashcards from '../data/jsFlashcards'
import reactFlashcards from '../data/reactFlashcards'
import oopFlashcards from '../data/oopFlashcards'
import dsaFlashcards from '../data/dsaFlashcards'
import dbmsFlashcards from '../data/dbmsFlashcards'
import osFlashcards from '../data/osFlashcards'
import cnsFlashcards from '../data/cnsFlashcards'
import fullStackFlashcards from '../data/fullStackFlashcards'

const TopicPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const topic = topics.find(t => t.id === id)

    // Map topic IDs to their flashcard data
    const flashcardMap = {
        javascript: jsFlashcards,
        react: reactFlashcards,
        oop: oopFlashcards,
        dsa: dsaFlashcards,
        dbms: dbmsFlashcards,
        os: osFlashcards,
        cns: cnsFlashcards,
        fullStack: fullStackFlashcards
    }

    const flashcards = flashcardMap[id]

    if (!topic) return <div className="p-6">Topic not found</div>

    return (
        <div className="p-6 mt-12">
            <h1 className="text-3xl font-bold text-center md:text-left mb-4">{topic.title}</h1>
            <div className="flex justify-center md:justify-start gap-4 mb-4">
                <button
                    className="bg-blue-600 text-white text-xs md:text-sm px-3 py-2 rounded-2xl"
                    onClick={() => navigate(`/interview?topic=${topic.title}`)}
                >
                    Mock Interview 🎤
                </button>
                <button
                    className="bg-purple-600 text-white text-xs md:text-sm px-4 py-2 rounded-2xl"
                    onClick={() => navigate(`/voice-interview?topic=${topic.title}`)}
                >
                    Voice Interview 🎙️
                </button>
            </div>
            <p className="text-gray-400 text-center md:text-left mb-6">{topic.description}</p>


            {/* Flashcards */}
            {flashcards && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {flashcards.map((card, index) => (
                            <div key={index} className="border-2 border-gray-800 p-4 rounded-2xl">
                                <p className="font-medium text-gray-100">Q: {card.question}</p>
                                <p className="text-sm text-gray-400 mt-2">A: {card.answer}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

        </div>
    )
}

export default TopicPage

