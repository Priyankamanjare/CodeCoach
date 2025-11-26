import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TopicPage from './pages/TopicPage'
import InterviewPage from "./pages/InterviewPage"
import VoiceInterviewPage from "./pages/VoiceInterviewPage"
import HistoryPage from "./pages/HistoryPage"

import ReportPage from "./pages/ReportPage"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"





const App = () => {
  const { currentUser } = useAuth()

  const Protected = ({ children }) => {
    const location = useLocation();
    const isInterviewPage = location.pathname === '/interview' || location.pathname === '/voice-interview';

    if (!currentUser) return <Navigate to="/login" />;
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow">
          {children}
        </main>
        {!isInterviewPage && <Footer />}
      </div>
    );
  };

  return (
    <div className='min-h-screen p-4'>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login"
          element={!currentUser ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register"
          element={!currentUser ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={<Protected><DashboardPage /></Protected>}
        />
        <Route path="/topic/:id"
          element={<Protected><TopicPage /></Protected>} />
        <Route path="/interview"
          element={<Protected><InterviewPage /></Protected>} />
        <Route path="/voice-interview"
          element={<Protected><VoiceInterviewPage /></Protected>} />
        <Route path="/history"
          element={<Protected><HistoryPage /></Protected>} />
        <Route path="/report/:id"
          element={<Protected><ReportPage /></Protected>} />

      </Routes>
    </div>
  )
}

export default App
