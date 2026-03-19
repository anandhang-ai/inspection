// src/components/NavBar.jsx
import React, { useContext, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Tooltip,
    useTheme,
    alpha
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/WbSunny";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { ThemeContext } from "./ThemeContext";

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const { mode, toggleTheme } = useContext(ThemeContext);
    const theme = useTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate("/login");
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: alpha(theme.palette.background.default, 0.8),
                backdropFilter: "blur(12px)",
                borderBottom: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between" }}>
                {/* Logo / Title */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: "-0.5px",
                            textDecoration: "none",
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white"
                            }}
                        >
                            I
                        </Box>
                        <Box component="span" sx={{ color: theme.palette.text.primary }}>
                            Inspect
                        </Box>
                    </Typography>

                    {/* Nav Links - Desktop */}
                    {user && (
                        <Box sx={{ ml: 4, display: { xs: "none", md: "flex" }, gap: 1 }}>
                            <Button
                                component={Link}
                                to="/dashboard"
                                startIcon={<DashboardIcon />}
                                color="inherit"
                                sx={{ borderRadius: "8px", px: 2 }}
                            >
                                Dashboard
                            </Button>
                            <Button
                                component={Link}
                                to="/materials"
                                startIcon={<InventoryIcon />}
                                color="inherit"
                                sx={{ borderRadius: "8px", px: 2 }}
                            >
                                Materials
                            </Button>
                            <Button
                                component={Link}
                                to="/customers"
                                startIcon={<PersonIcon />}
                                color="inherit"
                                sx={{ borderRadius: "8px", px: 2 }}
                            >
                                Customers
                            </Button>
                            <Button
                                component={Link}
                                to="/pr"
                                startIcon={<ShoppingCartIcon />}
                                color="inherit"
                                sx={{ borderRadius: "8px", px: 2 }}
                            >
                                Requisitions
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Right Side Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Theme Toggle */}
                    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                        <IconButton
                            onClick={toggleTheme}
                            sx={{
                                width: 40,
                                height: 40,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: "10px"
                            }}
                        >
                            {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    {/* User Profile */}
                    {user ? (
                        <>
                            <Box
                                onClick={handleClick}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    ml: 1,
                                    cursor: "pointer",
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        backgroundColor: theme.palette.action.hover
                                    }
                                }}
                            >
                                <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                        {user.username}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "capitalize" }}>
                                        {user.role}
                                    </Typography>
                                </Box>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    }}
                                >
                                    {user.username.charAt(0).toUpperCase()}
                                </Avatar>
                            </Box>

                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                onClick={handleClose}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        width: 200,
                                        mt: 1.5,
                                        borderRadius: "16px",
                                        border: `1px solid ${theme.palette.divider}`,
                                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                        overflow: "visible",
                                        "&::before": {
                                            content: '""',
                                            display: "block",
                                            position: "absolute",
                                            top: 0,
                                            right: 24,
                                            width: 10,
                                            height: 10,
                                            bgcolor: "background.paper",
                                            transform: "translateY(-50%) rotate(45deg)",
                                            zIndex: 0,
                                            borderLeft: `1px solid ${theme.palette.divider}`,
                                            borderTop: `1px solid ${theme.palette.divider}`,
                                        },
                                    },
                                }}
                                transformOrigin={{ horizontal: "right", vertical: "top" }}
                                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            >
                                <Box sx={{ px: 2, py: 1.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        {user.username}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user.role} Account
                                    </Typography>
                                </Box>
                                <Divider />
                                <MenuItem onClick={() => navigate("/dashboard")}>
                                    <ListItemIcon>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    Profile Details
                                </MenuItem>
                                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            size="small"
                            sx={{
                                px: 3,
                                borderRadius: "8px",
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                            }}
                        >
                            Sign In
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
