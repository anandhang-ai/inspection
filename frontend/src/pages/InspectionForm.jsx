import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Grid,
    Alert,
    CircularProgress,
    useTheme,
    alpha
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const InspectionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const theme = useTheme();

    const [formData, setFormData] = useState({
        equipmentName: "",
        inspectionDate: new Date().toISOString().split('T')[0],
        comments: ""
    });

    const [checklist, setChecklist] = useState({
        cleaning: false,
        lubrication: false,
        testing: false,
        safetyCheck: false,
        partsReplaced: false
    });

    // Fetch data if in edit mode
    useEffect(() => {
        if (isEdit) {
            const fetchInspection = async () => {
                try {
                    const resp = await axios.get(`http://localhost:5000/api/inspections/mine`);
                    const item = resp.data.find(i => i.id === parseInt(id));
                    if (item) {
                        setFormData({
                            equipmentName: item.equipment_name,
                            inspectionDate: new Date(item.inspection_date).toISOString().split('T')[0],
                            comments: item.comments || ""
                        });
                        setChecklist(item.checklist_items);
                    }
                } catch (err) {
                    setError("Failed to fetch inspection details");
                }
            };
            fetchInspection();
        }
    }, [id, isEdit]);

    const handleChecklistChange = (e) => {
        setChecklist({
            ...checklist,
            [e.target.name]: e.target.checked
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/inspections/${id}`, {
                    ...formData,
                    checklistItems: checklist
                });
            } else {
                await axios.post("http://localhost:5000/api/inspections", {
                    ...formData,
                    checklistItems: checklist
                });
            }
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit inspection");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: "blur(12px)",
                    borderRadius: "24px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 20px 40px rgba(0,0,0,0.4)'
                        : '0 20px 40px rgba(0,0,0,0.05)',
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ color: theme.palette.text.primary, fontWeight: 900, letterSpacing: '-1px' }}>
                        {isEdit ? "Update Report" : "New Report"}
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                        {isEdit ? "Correct the findings and resubmit for approval." : "Fill in the details below to document your equipment inspection."}
                    </Typography>
                </Box>

                {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }}>Report submitted successfully! Redirecting...</Alert>}
                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                label="Equipment Name"
                                variant="outlined"
                                value={formData.equipmentName}
                                onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                type="date"
                                label="Inspection Date"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                value={formData.inspectionDate}
                                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 700 }}>
                                Safety & Operational Checklist
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                                    borderRadius: '16px',
                                    borderStyle: 'dashed'
                                }}
                            >
                                <FormGroup sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                                    {[
                                        { name: "cleaning", label: "Basic Cleaning Done" },
                                        { name: "lubrication", label: "Moving Parts Lubricated" },
                                        { name: "testing", label: "Full Operational Test" },
                                        { name: "safetyCheck", label: "Safety Systems Verified" },
                                        { name: "partsReplaced", label: "Worn Parts Replaced" }
                                    ].map((item) => (
                                        <FormControlLabel
                                            key={item.name}
                                            control={
                                                <Checkbox
                                                    name={item.name}
                                                    checked={checklist[item.name]}
                                                    onChange={handleChecklistChange}
                                                    sx={{ '&.Mui-checked': { color: theme.palette.primary.main } }}
                                                />
                                            }
                                            label={item.label}
                                            sx={{ color: theme.palette.text.primary }}
                                        />
                                    ))}
                                </FormGroup>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Observations & Comments"
                                placeholder="Describe any specific findings or concerns..."
                                variant="outlined"
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.8,
                                    px: 8,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                                    fontWeight: 800,
                                    borderRadius: '12px',
                                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? "Resubmit Report" : "Submit Report")}
                            </Button>
                            <Button
                                onClick={() => navigate("/dashboard")}
                                variant="text"
                                sx={{ fontWeight: 700, color: theme.palette.text.secondary, px: 4 }}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default InspectionForm;
