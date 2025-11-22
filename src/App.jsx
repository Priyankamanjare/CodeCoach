import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TopicPage from './pages/TopicPage'
import InterviewPage from "./pages/InterviewPage"
import ReportsPage from "./pages/ReportsPage"




const App = () => {
  const { currentUser } = useAuth()

  const Protected = ({ children }) =>
    currentUser ? children : <Navigate to="/login" />

  return (
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
      <Route path="/reports"
        element={<Protected><ReportsPage /></Protected>} />

    </Routes>
  )
}

export default App
