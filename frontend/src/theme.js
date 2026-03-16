// src/theme.js
import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'dark' ? {
            // Dark Mode
            primary: {
                main: "hsl(210, 80%, 55%)",
            },
            secondary: {
                main: "hsl(260, 80%, 55%)",
            },
            background: {
                default: "hsl(220, 10%, 12%)",
                paper: "hsl(220, 10%, 15%)",
            },
            text: {
                primary: "hsl(0, 0%, 95%)",
                secondary: "hsl(0, 0%, 70%)",
            },
        } : {
            // Light Mode
            primary: {
                main: "hsl(210, 80%, 45%)",
            },
            secondary: {
                main: "hsl(260, 80%, 45%)",
            },
            background: {
                default: "hsl(220, 20%, 97%)",
                paper: "hsl(0, 0%, 100%)",
            },
            text: {
                primary: "hsl(220, 10%, 10%)",
                secondary: "hsl(220, 10%, 40%)",
            },
        }),
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

// Legacy colors for components still using them directly
export const colors = {
    background: "hsl(220, 10%, 12%)",
    surface: "rgba(255, 255, 255, 0.08)",
    primary: "hsl(210, 80%, 55%)",
    secondary: "hsl(260, 80%, 55%)",
    accent: "hsl(45, 85%, 55%)",
    textPrimary: "hsl(0, 0%, 95%)",
    textSecondary: "hsl(0, 0%, 70%)",
};

export const borderRadius = "12px";
