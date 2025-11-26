import React, { useEffect, useState, useRef } from "react";
import { vapi } from "../services/vapiService";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveInterview } from "../services/interviewService";
import { generateFeedback } from "../services/aiService";

const VoiceInterviewPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const topic = query.get("topic") || "General";

    const [messages, setMessages] = useState([]); // {role: "ai"|"user", text, timestamp}
    const [timer, setTimer] = useState(0);
    const [isInterviewActive, setIsInterviewActive] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState("idle"); // idle, speaking, listening, thinking
    const [isTestMode, setIsTestMode] = useState(false);
    const mockIntervalRef = useRef(null);
    const transcriptContainerRef = useRef(null);

    // Auto‑scroll for transcript panels (used only in mock mode)
    useEffect(() => {
        if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Vapi listeners – disabled when test mode is on
    useEffect(() => {
        if (isTestMode) return;
        const onSpeechStart = () => setStatus("speaking");
        const onSpeechEnd = () => setStatus("listening");
        const onMessage = (msg) => {
            if (msg.type === "transcript" && msg.transcriptType === "final") {
                const newMsg = {
                    role: msg.role === "assistant" ? "ai" : "user",
                    text: msg.transcript,
                    timestamp: new Date().toISOString()
                };
                setMessages((prev) => [...prev, newMsg]);
                console.log("Vapi message added", newMsg);
            }
        };
        const onError = async (e) => {
            console.error("Vapi Error:", e);
            let errorMessage = "Connection failed. Please check your API key and try again.";
            if (e.type === "start-method-error" && e.error instanceof Response) {
                try {
                    const errorBody = await e.error.text();
                    errorMessage = `Connection failed: ${errorBody}`;
                } catch (parseErr) {
                    console.error("Error parsing response:", parseErr);
                }
            } else if (e.message) {
                errorMessage = e.message;
            }
            setError(errorMessage);
            setIsInterviewActive(false);
            setStatus("idle");
        };
        const onCallStart = () => {
            console.log("Call connected");
            setIsInterviewActive(true);
            setStatus("speaking"); // AI usually starts speaking
        };
        const onCallEnd = () => {
            console.log("Call disconnected");
            setIsInterviewActive(false);
            setStatus("idle");
        };
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("message", onMessage);
        vapi.on("error", onError);
        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        return () => {
            vapi.stop();
            vapi.removeAllListeners();
        };
    }, [isTestMode]);

    // Interview timer
    useEffect(() => {
        let interval;
        if (isInterviewActive) {
            interval = setInterval(() => setTimer((t) => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isInterviewActive]);

    // Cleanup mock interval when interview ends
    useEffect(() => {
        if (!isInterviewActive && mockIntervalRef.current) {
            clearInterval(mockIntervalRef.current);
            mockIntervalRef.current = null;
        }
    }, [isInterviewActive]);

    // ---------- Mock interview flow ----------
    const startMockCall = () => {
        console.log("Starting mock interview");
        setIsInterviewActive(true);
        setStatus("speaking");
        setMessages([
            {
                role: "ai",
                text: `[TEST MODE] Hello! I am your AI interviewer for ${topic}. Let's begin.`,
                timestamp: new Date().toISOString()
            }
        ]);
        let step = 0;
        mockIntervalRef.current = setInterval(() => {
            step = (step + 1) % 4;
            if (step === 0) {
                setStatus("listening");
            } else if (step === 1) {
                setStatus("thinking");
            } else if (step === 2) {
                setStatus("speaking");
            } else if (step === 3) {
                const newMsg = {
                    role: "ai",
                    text: `[TEST MODE] This is a simulated question about ${topic}. Please respond.`,
                    timestamp: new Date().toISOString()
                };
                setMessages((prev) => [...prev, newMsg]);
            }
        }, 3000);
    };

    // ---------- Real interview start ----------
    const startCall = async () => {
        if (isTestMode) {
            startMockCall();
            return;
        }
        setError(null);
        setStatus("thinking"); // connecting
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            await vapi.start(import.meta.env.VITE_VAPI_ASSISTANT_ID, {
                model: {
                    provider: "openai",
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: `You are a friendly but strict senior interviewer.\nAsk ONLY ${topic} interview questions.\nAsk ONE question at a time.\nWAIT for the user's full response before continuing.\nGive follow‑up questions if necessary.\nEncourage but keep it professional.`
                        }
                    ]
                }
            });
        } catch (err) {
            console.error("Failed to start call:", err);
            setError("Microphone permission denied or connection failed.");
            setIsInterviewActive(false);
            setStatus("idle");
        }
    };

    // ---------- End interview ----------
    const endCall = async () => {
        console.log("Ending interview, messages count:", messages.length);
        if (mockIntervalRef.current) {
            clearInterval(mockIntervalRef.current);
            mockIntervalRef.current = null;
        }
        vapi.stop();
        setIsInterviewActive(false);
        setStatus("idle");
        setIsSaving(true);
        if (messages.length > 0) {
            try {
                // Generate AI feedback
                const feedback = await generateFeedback(messages, topic, currentUser.uid);

                // Calculate average score (if feedback exists)
                let overallScore = 0;
                if (feedback) {
                    const scores = [
                        feedback.technicalScore,
                        feedback.communicationScore,
                        feedback.confidenceScore,
                        feedback.structureScore
                    ].filter(s => typeof s === 'number');
                    if (scores.length > 0) {
                        overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                    }
                }

                await saveInterview(currentUser.uid, {
                    topic,
                    duration: timer,
                    transcript: messages,
                    feedbackReportId: feedback?.id || null,
                    overallScore: overallScore || 0,
                    feedbackSummary: feedback ? {
                        technical: feedback.technicalScore,
                        communication: feedback.communicationScore,
                        confidence: feedback.confidenceScore,
                        structure: feedback.structureScore
                    } : null
                });
                console.log("Interview saved successfully");
                setIsSaving(false);
                if (feedback?.id) {
                    navigate(`/report/${feedback.id}`);
                } else {
                    navigate('/history');
                }
            } catch (e) {
                console.error("Failed to save interview:", e);
                alert("Failed to save interview. Please check your connection.");
                setIsSaving(false);
            }
        } else {
            console.warn("No messages to save");
            setIsSaving(false);
            navigate('/history');
        }
    };

    const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

    // Split messages for mock UI
    const aiMessages = messages.filter((m) => m.role === "ai");
    const userMessages = messages.filter((m) => m.role === "user");

    return (
        <div className="fixed inset-0 w-full bg-gray-950 backdrop-blur-sm text-white flex flex-col overflow-hidden font-sans pt-16 z-0">
            {/* Header */}
            <div className="w-full px-4 py-2 bg-gray-950 backdrop-blur-md flex justify-between items-center border-b border-gray-700 z-20 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎤</span>
                    <h2 className="text-xl font-semibold tracking-wide">
                        {topic} Interview {isTestMode && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded ml-2">TEST MODE</span>}
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === "speaking" ? "bg-purple-500/20 text-purple-300 border border-purple-500/50" :
                        status === "listening" ? "bg-blue-500/20 text-blue-300 border border-blue-500/50" :
                            "bg-gray-700 text-gray-400"
                        }`}>{status === "idle" ? "Ready" : status}</div>
                    <p className="text-lg font-mono text-gray-300">{formatTime(timer)}</p>
                </div>
            </div>

            {/* Mock mode banner */}
            {isTestMode && (
                <div className="w-full text-center bg-yellow-600 text-black py-2 shrink-0">
                    Mock Mode Active – AI responses are simulated.
                </div>
            )}

            {/* Main Stage */}
            <div className="flex-1 flex flex-col md:flex-row relative overflow-y-auto min-h-0">
                {/* Start Overlay */}
                {!isInterviewActive && (
                    <div className="absolute inset-0 bg-gray-950 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-all">
                        <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 max-w-sm w-full text-center mx-4">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/30">🤖</div>
                            <h2 className="text-xl font-bold mb-1">Ready to Interview?</h2>
                            <p className="text-gray-400 mb-4 text-sm">Topic: <span className="text-white font-semibold">{topic}</span></p>
                            {/* Test mode toggle */}
                            <div className="flex items-center justify-center gap-3 mb-4 bg-gray-700/50 p-2 rounded-lg">
                                <span className={`text-xs font-medium ${!isTestMode ? 'text-white' : 'text-gray-400'}`}>Real AI</span>
                                <button onClick={() => setIsTestMode(!isTestMode)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isTestMode ? 'bg-yellow-500' : 'bg-gray-600'}`}>
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isTestMode ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                                <span className={`text-xs font-medium ${isTestMode ? 'text-yellow-400' : 'text-gray-400'}`}>Test Mode</span>
                            </div>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-2 rounded mb-4 text-xs">{error}</div>
                            )}
                            <button onClick={startCall}
                                className={`w-full py-3 rounded-xl text-base font-bold transition-all transform hover:scale-[1.02] shadow-xl ${isTestMode ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500" : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"}`}
                            >
                                {isTestMode ? "Start Test Interview" : "Start Interview"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Content based on mode */}
                {isTestMode ? (
                    // Mock mode – three transcript columns
                    <>
                        <div className="flex-1 flex flex-col p-4 overflow-y-auto border-r border-gray-800">
                            <h3 className="text-lg font-semibold mb-2 text-purple-200">AI Messages</h3>
                            <div className="flex-1 bg-gray-800 p-2 rounded overflow-y-auto max-h-64">
                                {aiMessages.length === 0 ? <p className="text-gray-400">No AI messages yet.</p> : aiMessages.map((msg, i) => (
                                    <p key={i} className="text-sm mb-1"><strong>AI:</strong> {msg.text}</p>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col p-4 overflow-y-auto border-r border-gray-800">
                            <h3 className="text-lg font-semibold mb-2 text-blue-200">User Messages</h3>
                            <div className="flex-1 bg-gray-800 p-2 rounded overflow-y-auto max-h-64">
                                {userMessages.length === 0 ? <p className="text-gray-400">No user messages yet.</p> : userMessages.map((msg, i) => (
                                    <p key={i} className="text-sm mb-1"><strong>You:</strong> {msg.text}</p>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-2 text-gray-200">Full Transcript</h3>
                            <div ref={transcriptContainerRef} className="flex-1 bg-gray-800 p-2 rounded overflow-y-auto max-h-64">
                                {messages.length === 0 ? <p className="text-gray-400">No transcript yet.</p> : messages.map((msg, i) => (
                                    <p key={i} className="text-sm mb-1"><strong>{msg.role === "ai" ? "AI" : "You"}:</strong> {msg.text}</p>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    // Real interview – two avatar columns, no transcript panels
                    <>
                        <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 border-r border-gray-800 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
                            <div className={`absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl transition-opacity duration-1000 ${status === "speaking" ? "opacity-100" : "opacity-20"}`} />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center text-6xl md:text-7xl shadow-2xl transition-all duration-300 ${status === "speaking" ? "animate-ripple-purple border-purple-500 scale-105" : ""}`}>
                                    🤖
                                </div>
                                <h3 className="mt-6 text-xl font-semibold text-purple-200">AI Interviewer</h3>
                                <p className="text-purple-400/60 text-sm mt-1">
                                    {status === "speaking" ? "Speaking..." : status === "thinking" ? "Thinking..." : "Listening"}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 bg-gray-900 relative overflow-hidden">
                            <div className={`absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl transition-opacity duration-500 ${status === "listening" ? "opacity-100" : "opacity-0"}`} />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center text-4xl md:text-5xl shadow-2xl transition-all duration-300 ${status === "listening" ? "animate-ripple-blue border-blue-500 scale-105" : ""}`}>
                                    {currentUser?.displayName?.charAt(0) || "U"}
                                </div>
                                <h3 className="mt-6 text-xl font-semibold text-blue-200">You</h3>
                                <p className="text-blue-400/60 text-sm mt-1">
                                    {status === "listening" ? "Listening..." : "Ready"}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-center p-4 bg-gray-950/50 backdrop-blur-md shrink-0">
                <button
                    className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform flex items-center gap-2 ${isSaving ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 hover:scale-105"}`}
                    onClick={endCall}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <span className="animate-spin">⏳</span> Generating Feedback...
                        </>
                    ) : (
                        <>
                            <span>🛑</span> End Interview
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default VoiceInterviewPage;
