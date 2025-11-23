import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";

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
