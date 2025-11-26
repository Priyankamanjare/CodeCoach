import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAIResponse, generateFeedback } from "../services/aiService"
import { saveInterview } from "../services/interviewService"
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
    const chatContainerRef = useRef(null)

    const speakText = (text) => {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    }

    useEffect(() => {
        const last = messages[messages.length - 1]
        if (last?.sender === "bot") speakText(last.text)

        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
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
            // Calculate average score
            const scores = [
                feedback.technicalScore,
                feedback.communicationScore,
                feedback.confidenceScore,
                feedback.structureScore
            ].filter(s => typeof s === 'number');

            const overallScore = scores.length > 0
                ? scores.reduce((a, b) => a + b, 0) / scores.length
                : 0;

            try {
                await saveInterview(currentUser.uid, {
                    topic,
                    duration: 0, // Mock interviews don't track time yet, or we could add a timer
                    transcript: messages,
                    feedbackReportId: feedback.id,
                    overallScore,
                    feedbackSummary: {
                        technical: feedback.technicalScore,
                        communication: feedback.communicationScore,
                        confidence: feedback.confidenceScore,
                        structure: feedback.structureScore
                    }
                });
                console.log("Mock interview saved successfully");
            } catch (error) {
                console.error("Failed to save mock interview:", error);
                // Continue to navigation even if save fails, but maybe alert user?
            }

            navigate(`/report/${feedback.id}`)
        } else {
            alert("AI busy — try again in 20 seconds")
        }
    }

    return (
        <div className="p-4 max-w-2xl mx-auto mt-14">
            <h2 className="text-lg md:text-xl font-semibold text-center mb-4">{topic} Mock Interview 🎤</h2>

            {/* Chat */}
            <div ref={chatContainerRef} className="border border-gray-800 rounded-2xl p-3 h-[350px] overflow-y-auto bg-gray-930 mb-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 text-xs md:text-sm ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                        <span className={`px-3 py-2 rounded-xl inline-block ${msg.sender === "user" ? "bg-blue-600 text-white text-xs md:text-sm" : "bg-gray-900 text-white text-xs md:text-sm"}`}>
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="border p-2 flex-1 rounded-2xl text-xs md:text-sm"
                    placeholder="Type or speak..."
                    disabled={questionCount >= MAX_QUESTIONS}
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white px-2 rounded-2xl text-xs md:text-sm"
                    disabled={questionCount >= MAX_QUESTIONS}
                >
                    Send
                </button>
                <button
                    onClick={handleSpeech}
                    className="bg-gray-700 text-white px-2 rounded-2xl text-sm md:text-md"
                    disabled={questionCount >= MAX_QUESTIONS}
                >
                    🎙️
                </button>
            </div>

            {/* End Interview Button */}
            <button
                className={`w-full mt-4 py-2 rounded-2xl ${loadingFeedback ? "bg-gray-500" : "bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs md:text-sm"}`}
                onClick={handleEndInterview}
                disabled={loadingFeedback}
            >
                {loadingFeedback ? "Evaluating... Please wait ⏳" : "End Interview & Generate Feedback 📊"}
            </button>
        </div>
    )
}

export default InterviewPage
