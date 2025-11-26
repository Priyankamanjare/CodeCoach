import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export const getUserStats = async (userId) => {
    try {
        const docRef = doc(db, "users", userId, "stats", "usage");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Initialize if not exists
            const initialStats = { callsUsed: 0 };
            await setDoc(docRef, initialStats);
            return initialStats;
        }
    } catch (e) {
        console.error("Error getting user stats:", e);
        return { callsUsed: 0 };
    }
};

export const incrementCallCount = async (userId) => {
    try {
        const docRef = doc(db, "users", userId, "stats", "usage");
        // We assume the document exists because getUserStats should have been called first
        // But setDoc with merge is safer if we are unsure
        await setDoc(docRef, { callsUsed: increment(1) }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error incrementing call count:", e);
        return false;
    }
};
