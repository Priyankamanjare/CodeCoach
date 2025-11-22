import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../services/firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

const ReportsPage = () => {
    const { currentUser } = useAuth()
    const [reports, setReports] = useState([])

    useEffect(() => {
        const q = query(
            collection(db, "feedbackReports"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        )

        const unsub = onSnapshot(q, (snap) => {
            setReports(snap.docs.map(doc => ({
                id: doc.id, ...doc.data()
            })))
        })

        return () => unsub()
    }, [])

    if (!reports.length) return <div className="p-6">No reports found yet</div>

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Your Feedback Reports 📄</h2>

            {reports.map((r) => (
                <div key={r.id} className="border p-4 rounded shadow-sm">
                    <h3 className="font-bold text-xl mb-2">{r.topic} Interview</h3>
                    <p>Technical: ⭐ {r.technicalScore}/5</p>
                    <p>Communication: ⭐ {r.communicationScore}/5</p>
                    <p>Confidence: ⭐ {r.confidenceScore}/5</p>

                    <p className="mt-2 text-gray-700">
                        <b>Structured Approach:</b> {r.structuredApproach}
                    </p>
                    <p className="text-gray-700">
                        <b>Suggestions:</b> {r.suggestions}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default ReportsPage
