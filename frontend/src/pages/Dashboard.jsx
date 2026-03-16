import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
    alpha,
    Tooltip
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { AuthContext } from "../components/AuthContext";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [supervisorComments, setSupervisorComments] = useState("");
    const theme = useTheme();

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = user.role === "supervisor"
                ? "http://localhost:5000/api/inspections/pending"
                : "http://localhost:5000/api/inspections/mine";
            const resp = await axios.get(endpoint);
            setInspections(resp.data);
        } catch (err) {
            console.error("Failed to fetch inspections", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.role]);

    const handleOpenReview = (inspection) => {
        setSelectedInspection(inspection);
        setSupervisorComments("");
        setReviewDialogOpen(true);
    };

    const handleReviewDecision = async (decision) => {
        try {
            await axios.put(`http://localhost:5000/api/inspections/${selectedInspection.id}/review`, {
                decision,
                supervisorComments
            });
            setReviewDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to submit review", err);
        }
    };

    const getStatusChip = (status) => {
        let color = "default";
        if (status === "approved") color = "success";
        if (status === "rejected") color = "error";
        if (status === "pending") color = "warning";

        return (
            <Chip
                label={status.toUpperCase()}
                color={color}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: '8px', borderWeight: 2 }}
            />
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress color="primary" thickness={5} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={5}>
                <Box>
                    <Typography variant="h3" sx={{ color: theme.palette.text.primary, fontWeight: 900, letterSpacing: '-1px' }}>
                        {user.role === "supervisor" ? "Review Queue" : "My Workspace"}
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                        {user.role === "supervisor"
                            ? `You have ${inspections.length} pending inspections to review.`
                            : `Manage and track your submitted equipment inspections.`}
                    </Typography>
                </Box>
                {user.role === "inspector" && (
                    <Button
                        variant="contained"
                        component={RouterLink}
                        to="/inspection/new"
                        startIcon={<AddIcon />}
                        sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                            fontWeight: 700,
                            borderRadius: '12px',
                            px: 3,
                            py: 1.2,
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                    >
                        New Inspection
                    </Button>
                )}
            </Box>

            {inspections.length === 0 ? (
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
                        No inspections found in this view.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        overflow: 'hidden'
                    }}
                >
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Equipment</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Date</TableCell>
                                {user.role === "supervisor" && <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Inspector</TableCell>}
                                <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inspections.map((row) => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background 0.2s' }}
                                >
                                    <TableCell component="th" scope="row" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                                        {row.equipment_name}
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.secondary }}>
                                        {new Date(row.inspection_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </TableCell>
                                    {user.role === "supervisor" && (
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.inspector_name}</Typography>
                                            </Box>
                                        </TableCell>
                                    )}
                                    <TableCell>{getStatusChip(row.status)}</TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                            {user.role === "supervisor" ? (
                                                <Button
                                                    variant="soft"
                                                    size="small"
                                                    onClick={() => handleOpenReview(row)}
                                                    sx={{
                                                        fontWeight: 700,
                                                        borderRadius: '8px',
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                                                    }}
                                                >
                                                    Review
                                                </Button>
                                            ) : (
                                                <>
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {row.status === 'rejected' && (
                                                        <Tooltip title="Edit & Resubmit">
                                                            <IconButton
                                                                size="small"
                                                                component={RouterLink}
                                                                to={`/inspection/edit/${row.id}`}
                                                                sx={{
                                                                    color: theme.palette.warning.main,
                                                                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                                    '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.2) }
                                                                }}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Review Dialog for Supervisor */}
            <Dialog
                open={reviewDialogOpen}
                onClose={() => setReviewDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        padding: 1,
                        maxWidth: '500px',
                        width: '100%'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Review Inspection</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3, p: 2, borderRadius: '12px', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>Equipment</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedInspection?.equipment_name}</Typography>

                        <Typography variant="overline" color="primary" sx={{ fontWeight: 800, mt: 2, display: 'block' }}>Inspector Comments</Typography>
                        <Typography variant="body2">{selectedInspection?.comments || "No comments provided."}</Typography>
                    </Box>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Add your review feedback"
                        placeholder="Explain why you are approving or rejecting this inspection..."
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={supervisorComments}
                        onChange={(e) => setSupervisorComments(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
                    <Button onClick={() => setReviewDialogOpen(false)} sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Cancel</Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            onClick={() => handleReviewDecision("rejected")}
                            color="error"
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            sx={{ fontWeight: 700, borderRadius: '12px', px: 3 }}
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={() => handleReviewDecision("approved")}
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            sx={{ fontWeight: 700, borderRadius: '12px', px: 3 }}
                        >
                            Approve
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard;
