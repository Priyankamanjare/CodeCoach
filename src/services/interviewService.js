import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    doc,
    deleteDoc,
    getDoc
} from "firebase/firestore";

const COLLECTION_NAME = "interviews";

export const saveInterview = async (userId, interviewData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            userId,
            ...interviewData,
            createdAt: serverTimestamp(),
        });
        console.log("Interview saved with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding interview: ", e);
        throw e;
    }
};

export const getUserInterviews = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (e) {
        console.error("Error fetching interviews with orderBy: ", e);
        if (e.message && e.message.includes("The query requires an index")) {
            console.warn("Missing index detected. Falling back to unordered query.");
            try {
                const simpleQ = query(
                    collection(db, COLLECTION_NAME),
                    where("userId", "==", userId)
                );
                const simpleSnap = await getDocs(simpleQ);
                return simpleSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            } catch (retryError) {
                console.error("Error fetching interviews after fallback: ", retryError);
                throw retryError;
            }
        }
        throw e;
    }
};

export const getFeedbackReport = async (reportId) => {
    try {
        const docRef = doc(db, "feedbackReports", reportId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such feedback report!");
            return null;
        }
    } catch (e) {
        console.error("Error getting feedback report:", e);
        throw e;
    }
};

export const deleteInterview = async (interviewId, feedbackReportId) => {
    try {
        // Delete the interview document
        await deleteDoc(doc(db, COLLECTION_NAME, interviewId));

        // If there's a feedback report, delete that too
        if (feedbackReportId) {
            await deleteDoc(doc(db, "feedbackReports", feedbackReportId));
        }

        console.log("Interview and feedback deleted successfully");
        return true;
    } catch (e) {
        console.error("Error deleting interview:", e);
        throw e;
    }
};
