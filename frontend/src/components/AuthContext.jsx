// src/components/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, username, role, token }
    const [loading, setLoading] = useState(true);

    // On mount, try to restore session from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("auth");
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const resp = await axios.post("http://localhost:5000/api/auth/login", {
            username,
            password,
        });
        const data = resp.data; // { token, role, username }
        const auth = {
            token: data.token,
            username: data.username,
            role: data.role,
        };
        localStorage.setItem("auth", JSON.stringify(auth));
        setUser(auth);
        return auth;
    };

    const register = async (username, password, role) => {
        await axios.post("http://localhost:5000/api/auth/register", {
            username,
            password,
            role,
        });
        // After successful registration, auto‑login
        return login(username, password);
    };

    const logout = () => {
        localStorage.removeItem("auth");
        setUser(null);
    };

    const isAuthorized = (allowedRoles) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    };

    // Attach token to every request automatically
    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            if (user?.token) {
                config.headers["Authorization"] = `Bearer ${user.token}`;
            }
            return config;
        });
        return () => axios.interceptors.request.eject(interceptor);
    }, [user]);

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, isAuthorized }}
        >
            {children}
        </AuthContext.Provider>
    );
};
