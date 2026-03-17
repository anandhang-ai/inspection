import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
    alpha,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const MaterialManagement = () => {
    const theme = useTheme();
    const [searchId, setSearchId] = useState("100-100");
    const [plant, setPlant] = useState("1000");
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        MATERIAL: "",
        MATL_DESC: "",
        MATL_TYPE: "HALB",
        BASE_UOM: "ST"
    });
    const [editMode, setEditMode] = useState(false);

    const handleSearch = async () => {
        if (!searchId) return;
        setLoading(true);
        setError(null);
        setMaterial(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/api/materials/${searchId}?plant=${plant}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.type === "result" || response.data.MATL_DESC) {
                const data = response.data.type === "result" ? response.data.result : response.data;
                setMaterial(data);
            } else {
                setError("Material not found or SAP error occurred.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch material details from SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMaterial = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const method = editMode ? "put" : "post";
            const url = editMode
                ? `http://localhost:5000/api/materials/${formData.MATERIAL}`
                : `http://localhost:5000/api/materials`;

            const response = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            if (data.TYPE === "S" || data.type === "result" || (data.result && data.result.TYPE === "S")) {
                setCreateDialogOpen(false);
                setSearchId(formData.MATERIAL);
                handleSearch();
            } else {
                setError(data.MESSAGE || (data.result && data.result.MESSAGE) || "SAP error occurred during save.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to save material to SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = () => {
        setFormData({
            MATERIAL: searchId,
            MATL_DESC: material.MATL_DESC,
            MATL_TYPE: material.MATL_TYPE || "HALB",
            BASE_UOM: material.BASE_UOM || "ST"
        });
        setEditMode(true);
        setCreateDialogOpen(true);
    };

    const handleOpenCreate = () => {
        setFormData({
            MATERIAL: "",
            MATL_DESC: "",
            MATL_TYPE: "HALB",
            BASE_UOM: "ST"
        });
        setEditMode(false);
        setCreateDialogOpen(true);
    };

    const handleDeleteMaterial = async () => {
        if (!window.confirm(`Are you sure you want to flag material ${searchId} for deletion in SAP?`)) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`http://localhost:5000/api/materials/${searchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            // Handle both result.TYPE (direct) and wrapping result.result.TYPE from MCP
            const success = data.TYPE === "S" || (data.result && data.result.TYPE === "S");

            if (success) {
                alert("Material flagged for deletion successfully in SAP.");
                setMaterial(null);
                setSearchId("");
            } else {
                setError(data.MESSAGE || (data.result && data.result.MESSAGE) || "SAP error occurred during delete.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to delete material from SAP.");
        } finally {
            setLoading(false);
        }
    };

    // Initial search
    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={5}>
                <Box>
                    <Typography variant="h3" sx={{ color: theme.palette.text.primary, fontWeight: 900, letterSpacing: '-1px' }}>
                        Material Portal
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                        Live SAP inventory management via Pillir Flow MCP.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                        fontWeight: 700,
                        borderRadius: '12px',
                        px: 3,
                        py: 1.2,
                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                >
                    Create Material
                </Button>
            </Box>

            <Grid container spacing={4}>
                {/* Search Bar */}
                <Grid item xs={12}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: '24px',
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    label="Material ID"
                                    variant="outlined"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="e.g. 100-100"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <InventoryIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '12px' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Plant"
                                    variant="outlined"
                                    value={plant}
                                    onChange={(e) => setPlant(e.target.value)}
                                    placeholder="1000"
                                    InputProps={{ sx: { borderRadius: '12px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                    onClick={handleSearch}
                                    disabled={loading}
                                    sx={{ height: '56px', borderRadius: '12px', fontWeight: 700 }}
                                >
                                    Fetch from SAP
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" variant="filled" sx={{ borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    </Grid>
                )}

                {/* Material Details Card */}
                {material && (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                borderRadius: '24px',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: '16px',
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: theme.palette.primary.main
                                            }}
                                        >
                                            <InventoryIcon fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                {material.MATL_DESC}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Material Type: {material.MATL_TYPE} | Base UoM: {material.BASE_UOM}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={1}>
                                        <IconButton
                                            onClick={handleOpenEdit}
                                            sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleDeleteMaterial}
                                            sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                            Standard Price
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                            {material.STD_PRICE} {material.CURRENCY?.split('$').pop() || 'EUR'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                            Sync Status
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: material.TYPE === 'S' ? '#4caf50' : '#f44336' }} />
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {material.TYPE === 'S' ? 'Live SAP Data' : 'Error'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {!loading && !material && !error && (
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: 8,
                                textAlign: 'center',
                                borderRadius: '24px',
                                border: `2px dashed ${theme.palette.divider}`,
                                backgroundColor: alpha(theme.palette.background.paper, 0.4)
                            }}
                        >
                            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                Search for a material to view SAP details.
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Placeholder Dialog for Create Material */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1, minWidth: '400px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {editMode ? "Update Material" : "Create New Material"}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!editMode && (
                            <TextField
                                label="Material ID"
                                value={formData.MATERIAL}
                                onChange={(e) => setFormData({ ...formData, MATERIAL: e.target.value })}
                                fullWidth
                            />
                        )}
                        <TextField
                            label="Description"
                            value={formData.MATL_DESC}
                            onChange={(e) => setFormData({ ...formData, MATL_DESC: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Material Type"
                            value={formData.MATL_TYPE}
                            onChange={(e) => setFormData({ ...formData, MATL_TYPE: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Base UoM"
                            value={formData.BASE_UOM}
                            onChange={(e) => setFormData({ ...formData, BASE_UOM: e.target.value })}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveMaterial}
                        disabled={loading || !formData.MATL_DESC || (!editMode && !formData.MATERIAL)}
                        sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                        {loading ? <CircularProgress size={24} /> : (editMode ? "Update in SAP" : "Create in SAP")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MaterialManagement;
