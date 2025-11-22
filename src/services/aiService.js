import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";


const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);


const runWithRetry = async (fn, retries = 3, delay = 2000) => {
    try {
        console.log(`Attempting API call... (${retries} retries left)`);
        const result = await fn();
        console.log("API call successful!");
        return result;
    } catch (err) {
        console.warn(`API Error (Attempt ${4 - retries}/3):`, err.message);
        if (retries > 0 && (err.message.includes("429") || err.message.includes("Quota exceeded") || err.message.includes("503"))) {
            console.warn(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return runWithRetry(fn, retries - 1, delay * 2);
        }
        throw err;
    }
};

export const getAIResponse = async (messages, topic) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025"
        });




        const formattedHistory = messages.map(msg => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

        const prompt = `
You are a technical interviewer for a fresher applying for a ${topic} role.
Ask one interview question at a time.
Ask follow-up questions based on what the candidate says.
Keep questions short and beginner-friendly.
Do not answer your own questions.
Start your response ONLY with your next question.
`;

        const res = await runWithRetry(() => model.generateContent({
            contents: [
                ...formattedHistory,
                { role: "user", parts: [{ text: prompt }] }
            ]
        }));

        return res.response.text();
    } catch (err) {
        console.error("AI Error:", err);
        return "Can you repeat that?";
    }
};

export const generateFeedback = async (messages, topic, userId) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025"
        });

        const userAnswers = messages
            .filter(m => m.sender === "user")
            .map((m, i) => `Answer ${i + 1}: ${m.text}`)
            .join("\n");


        const feedbackPrompt = `
Evaluate the following interview answers for a ${topic} role.

Return ONLY a valid JSON object in this exact format:
{
  "technicalScore": number (1-5),
  "communicationScore": number (1-5),
  "suggestions": string
}

Here are the answers:
${userAnswers}
`;


        const res = await runWithRetry(() => model.generateContent(feedbackPrompt));
        const text = res.response.text();

        let jsonString = text
            .replace("```json", "")
            .replace("```", "")
            .trim();

        let feedbackJSON;
        try {
            feedbackJSON = JSON.parse(jsonString);
        } catch (e) {
            console.warn("Retrying JSON parse with regex...");
            const match = jsonString.match(/\{[\s\S]*\}/);
            if (!match) throw new Error("Couldn’t extract JSON!");
            feedbackJSON = JSON.parse(match[0]);
        }
        const docRef = await addDoc(collection(db, "feedbackReports"), {
            userId,
            topic,
            ...feedbackJSON,
            createdAt: serverTimestamp()
        });

        return { id: docRef.id, ...feedbackJSON };
    } catch (err) {
        console.error("Feedback Error:", err);
        return null;
    }
};
