import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Saves a completed monitoring run to Firestore
 * @param {string} userId - The Firebase Auth UID of the user
 * @param {object} runData - The complete data object of the run
 * @returns {Promise<string>} - The ID of the created document
 */
export const saveRun = async (userId, runData) => {
    if (!userId) {
        console.error("Cannot save run: User ID is missing");
        throw new Error("User not authenticated");
    }

    try {
        const docRef = await addDoc(collection(db, `users/${userId}/monitor_runs`), {
            ...runData,
            savedAt: serverTimestamp(),
            createdAt: runData.timestamp || new Date().toISOString()
        });
        console.log("Run saved with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error saving monitor run: ", error);
        throw error;
    }
};
