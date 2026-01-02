import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const googleProvider = new GoogleAuthProvider();

    const loginWithGoogle = async () => {
        try {
            console.log("Attempting Google Sign-In...");
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Sign-In Successful:", result.user);
            return result;
        } catch (error) {
            console.error("Google Sign-In Error:", error.code, error.message);
            alert(`Sign-In Failed: ${error.message}`);
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div className="min-h-screen flex items-center justify-center">Loading Prompt Co...</div> : children}
        </AuthContext.Provider>
    );
}
