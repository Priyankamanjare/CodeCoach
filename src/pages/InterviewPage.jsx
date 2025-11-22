import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAIResponse, generateFeedback } from "../services/aiService"
import { useAuth } from "../context/AuthContext"

const MAX_QUESTIONS = 2



const InterviewPage = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const query = new URLSearchParams(useLocation().search)
    const topic = query.get("topic") || "General"

    const initialQuestion = {
        "JavaScript": "What is JavaScript?",
        "ReactJS": "What are React Hooks?",
        "OOP": "What is Object-Oriented Programming?",
        "DSA": "Explain an array vs a linked list.",
        "CNS": "What is OSI Model?",
        "OS": "What is a process vs thread?",
        "DBMS": "What is normalization?"
    }[topic] || "Tell me about yourself related to this role."

    const [messages, setMessages] = useState([
        { sender: "bot", text: `Let's start your ${topic} interview!` },
        { sender: "bot", text: initialQuestion }
    ])

    const [questionCount, setQuestionCount] = useState(1)
    const [userInput, setUserInput] = useState("")
    const [loadingFeedback, setLoadingFeedback] = useState(false)
    const chatEndRef = useRef(null)

    const speakText = (text) => {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    }

    useEffect(() => {
        const last = messages[messages.length - 1]
        if (last?.sender === "bot") speakText(last.text)
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!userInput.trim()) return
        if (questionCount >= MAX_QUESTIONS) {
            alert("Interview limit reached! Generate feedback now.")
            return
        }

        const updatedMessages = [...messages, { sender: "user", text: userInput }]
        setMessages(updatedMessages)
        setUserInput("")

        const aiReply = await getAIResponse(updatedMessages, topic)
        setMessages(prev => [...prev, { sender: "bot", text: aiReply }])

        setQuestionCount(prev => prev + 1)
    }

    const handleSpeech = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) return alert("Voice input not supported")

        const rec = new SpeechRecognition()
        rec.lang = "en-US"
        rec.start()

        rec.onresult = e =>
            setUserInput(e.results[0][0].transcript)
    }

    const handleEndInterview = async () => {
        if (!currentUser) return alert("Not logged in!")

        setLoadingFeedback(true);
        let timeoutReached = false;

        const timeout = setTimeout(() => {
            timeoutReached = true;
            setLoadingFeedback(false);
            alert("Server is taking longer than usual. Please try again in a few seconds.");
        }, 30000);

        const feedback = await generateFeedback(messages, topic, currentUser.uid);

        clearTimeout(timeout);

        if (timeoutReached) return;

        setLoadingFeedback(false);

        if (feedback) {
            navigate("/reports");
        } else {
            alert("Please try again after a moment. AI might be overloaded.");
        }


        if (feedback) {
            navigate("/reports")
        } else {
            alert("AI busy — try again in 20 seconds")
        }
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-4">{topic} Mock Interview 🎤</h2>

            {/* Chat */}
            <div className="border rounded p-3 h-[350px] overflow-y-auto bg-gray-50 mb-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 text-sm ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                        <span className={`px-3 py-2 rounded-xl inline-block ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}>
                            {msg.text}
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="border p-2 flex-1 rounded"
                    placeholder="Type or speak..."
                    disabled={questionCount >= MAX_QUESTIONS}
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white px-4 rounded"
                    disabled={questionCount >= MAX_QUESTIONS}
                >
                    Send
                </button>
                <button
                    onClick={handleSpeech}
                    className="bg-gray-700 text-white px-3 rounded"
                    disabled={questionCount >= MAX_QUESTIONS}
                >
                    🎙️
                </button>
            </div>

            {/* End Interview Button */}
            <button
                className={`w-full mt-4 py-2 rounded ${loadingFeedback ? "bg-gray-500" : "bg-green-600 text-white"}`}
                onClick={handleEndInterview}
                disabled={loadingFeedback}
            >
                {loadingFeedback ? "Evaluating... Please wait ⏳" : "End Interview & Generate Feedback 📊"}
            </button>
        </div>
    )
}

export default InterviewPage
