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
    useTheme,
    alpha,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import axios from "axios";

const CustomerManagement = () => {
    const theme = useTheme();
    const [searchId, setSearchId] = useState("0000000001");
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        CUSTOMERNO: "",
        FIRSTNAME: "",
        LASTNAME: "",
        STREET: "",
        CITY: "",
        POSTL_CODE: "",
        COUNTRY: "US",
        SALESORG: "1000",
        DISTR_CHAN: "10",
        DIVISION: "00"
    });
    const [editMode, setEditMode] = useState(false);

    const handleSearch = async () => {
        if (!searchId) return;
        setLoading(true);
        setError(null);
        setCustomer(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/api/customers/${searchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.type === "result" || response.data.CUSTOMERADDRESS) {
                const data = response.data.type === "result" ? response.data.result : response.data;
                setCustomer(data);
            } else {
                setError("Customer not found or SAP error occurred.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch customer details from SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCustomer = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const method = editMode ? "put" : "post";
            const url = editMode
                ? `http://localhost:5000/api/customers/${formData.CUSTOMERNO}`
                : `http://localhost:5000/api/customers`;

            const response = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            if (data.TYPE === "S" || data.type === "result" || (data.result && data.result.TYPE === "S") || data.CUSTOMERNO) {
                setCreateDialogOpen(false);
                setSearchId(data.CUSTOMERNO || formData.CUSTOMERNO);
                handleSearch();
            } else {
                setError(data.MESSAGE || (data.result && data.result.MESSAGE) || "SAP error occurred during save.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to save customer to SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = () => {
        const name = customer.NAME || customer.CUSTOMERADDRESS?.NAME || "";
        const addr = customer.STREET || customer.CUSTOMERADDRESS?.STREET || "";
        const city = customer.CITY || customer.CUSTOMERADDRESS?.CITY || "";
        const zip = customer.POSTL_CODE || customer.CUSTOMERADDRESS?.POSTL_CODE || "";
        const country = customer.COUNTRY || customer.CUSTOMERADDRESS?.COUNTRY || "US";

        const nameParts = name.split(' ');
        setFormData({
            CUSTOMERNO: searchId,
            FIRSTNAME: nameParts[0] || "",
            LASTNAME: nameParts.slice(1).join(' ') || "",
            STREET: addr,
            CITY: city,
            POSTL_CODE: zip,
            COUNTRY: country,
            SALESORG: "1000", // Often not returned in GetDetail2
            DISTR_CHAN: "10",
            DIVISION: "00"
        });
        setEditMode(true);
        setCreateDialogOpen(true);
    };

    const handleOpenCreate = () => {
        setFormData({
            CUSTOMERNO: "",
            FIRSTNAME: "",
            LASTNAME: "",
            STREET: "",
            CITY: "",
            POSTL_CODE: "",
            COUNTRY: "US",
            SALESORG: "1000",
            DISTR_CHAN: "10",
            DIVISION: "00"
        });
        setEditMode(false);
        setCreateDialogOpen(true);
    };

    const handleDeleteCustomer = async () => {
        if (!window.confirm(`Are you sure you want to flag customer ${searchId} for deletion in SAP?`)) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`http://localhost:5000/api/customers/${searchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(response.data.message || "Customer flagged for deletion successfully.");
            setCustomer(null);
            setSearchId("");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to delete customer from SAP.");
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
                        Customer Portal
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                        Manage SAP Customer Master Data via Pillir Flow MCP.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{
                        background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                        fontWeight: 700,
                        borderRadius: '12px',
                        px: 3,
                        py: 1.2,
                        boxShadow: `0 8px 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    }}
                >
                    Create Customer
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
                            <Grid item xs={12} sm={9}>
                                <TextField
                                    fullWidth
                                    label="Customer Number"
                                    variant="outlined"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="e.g. 0000000001"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: '12px' }
                                    }}
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

                {/* Customer Details Card */}
                {customer && (customer.NAME || customer.CUSTOMERADDRESS) && (
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
                                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: theme.palette.secondary.main
                                            }}
                                        >
                                            <PersonIcon fontSize="large" />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                {customer.NAME || customer.CUSTOMERADDRESS?.NAME}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Customer ID: {searchId} | Type: {customer.TYPE || "Live"}
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
                                            onClick={handleDeleteCustomer}
                                            sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <LocationOnIcon fontSize="small" color="action" />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                                Address
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {customer.STREET || customer.CUSTOMERADDRESS?.STREET}<br />
                                            {customer.POSTL_CODE || customer.CUSTOMERADDRESS?.POSTL_CODE} {customer.CITY || customer.CUSTOMERADDRESS?.CITY}<br />
                                            {customer.COUNTRY || customer.CUSTOMERADDRESS?.COUNTRY}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <PhoneIcon fontSize="small" color="action" />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                                Contact
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {customer.TELEPHONE || customer.CUSTOMERADDRESS?.TELEPHONE || "N/A"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                            SAP Message
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.info.main, mt: 1 }}>
                                            {customer.MESSAGE || "Operational"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {!loading && !customer && !error && (
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
                                Search for a customer to view SAP details.
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Create/Edit Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1, minWidth: '500px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {editMode ? "Update Customer" : "Create New Customer"}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Customer Number"
                                    value={formData.CUSTOMERNO}
                                    onChange={(e) => setFormData({ ...formData, CUSTOMERNO: e.target.value })}
                                    fullWidth
                                    placeholder="Leave empty for internal assignment"
                                    disabled={editMode}
                                    helperText={editMode ? "Customer IDs are fixed in SAP" : "Optional for some SAP configurations"}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="First Name"
                                    value={formData.FIRSTNAME}
                                    onChange={(e) => setFormData({ ...formData, FIRSTNAME: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Last Name"
                                    value={formData.LASTNAME}
                                    onChange={(e) => setFormData({ ...formData, LASTNAME: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Street"
                                    value={formData.STREET}
                                    onChange={(e) => setFormData({ ...formData, STREET: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="City"
                                    value={formData.CITY}
                                    onChange={(e) => setFormData({ ...formData, CITY: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Postal Code"
                                    value={formData.POSTL_CODE}
                                    onChange={(e) => setFormData({ ...formData, POSTL_CODE: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Country"
                                    value={formData.COUNTRY}
                                    onChange={(e) => setFormData({ ...formData, COUNTRY: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Sales Area (Copy Reference)
                                    </Typography>
                                </Divider>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Sales Org"
                                    value={formData.SALESORG}
                                    onChange={(e) => setFormData({ ...formData, SALESORG: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Dist Channel"
                                    value={formData.DISTR_CHAN}
                                    onChange={(e) => setFormData({ ...formData, DISTR_CHAN: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Division"
                                    value={formData.DIVISION}
                                    onChange={(e) => setFormData({ ...formData, DIVISION: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveCustomer}
                        disabled={loading || !formData.FIRSTNAME || !formData.LASTNAME}
                        sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                        {loading ? <CircularProgress size={24} /> : (editMode ? "Update in SAP" : "Create in SAP")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CustomerManagement;
