import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

export const saveRun = async (userId, runData) => {
    try {
        // runData includes: config used, timestamp, status
        const docRef = await addDoc(collection(db, `users/${userId}/monitor_runs`), {
            ...runData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error saving run", e);
        throw e;
    }
};

export const updateRunStatus = async (userId, runId, status, metrics = {}) => {
    try {
        const runRef = doc(db, `users/${userId}/monitor_runs`, runId);
        await updateDoc(runRef, {
            status,
            ...metrics,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error updating run", e);
    }
};

export const getRuns = async (userId) => {
    try {
        const q = query(collection(db, `users/${userId}/monitor_runs`), orderBy('createdAt', 'desc'));
        const sn = await getDocs(q);
        return sn.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        return [];
    }
};
