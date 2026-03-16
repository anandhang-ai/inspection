// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

// allowedRoles: array of roles that may access the route
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null; // or a spinner

    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

    return <Outlet />; // render child routes
};

export default ProtectedRoute;
