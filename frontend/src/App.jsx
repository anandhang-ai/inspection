// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InspectionForm from "./pages/InspectionForm";
import MaterialManagement from "./pages/MaterialManagement";
import CustomerManagement from "./pages/CustomerManagement";
import PurchaseRequisition from "./pages/PurchaseRequisition";
import NavBar from "./components/NavBar";

import { CustomThemeProvider } from "./components/ThemeContext";

const App = () => {
    return (
        <AuthProvider>
            <CustomThemeProvider>
                <Router>
                    <NavBar />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route element={<ProtectedRoute allowedRoles={["inspector", "supervisor"]} />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/inspection/new" element={<InspectionForm />} />
                            <Route path="/inspection/edit/:id" element={<InspectionForm />} />
                            <Route path="/materials" element={<MaterialManagement />} />
                            <Route path="/customers" element={<CustomerManagement />} />
                            <Route path="/pr" element={<PurchaseRequisition />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </CustomThemeProvider>
        </AuthProvider>
    );
};

export default App;
