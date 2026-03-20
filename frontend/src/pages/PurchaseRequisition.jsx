import React, { useState } from "react";
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    useTheme,
    alpha
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const PurchaseRequisition = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [searchId, setSearchId] = useState("");
    const [plantFilter, setPlantFilter] = useState("1000");
    const [prList, setPrList] = useState([]);
    const [prData, setPrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        MATERIAL: "100-100",
        PLANT: "1000",
        QUANTITY: 1,
        PRICE: 10,
        ACCTASSCAT: "",
        COSTCENTER: "",
        DELIV_DATE: "2026-05-01" // Targeted date for the user's suggestion
    });

    const [poSearchId, setPoSearchId] = useState("");
    const [poPlantFilter, setPoPlantFilter] = useState("1000");
    const [poList, setPoList] = useState([]);
    const [poData, setPoData] = useState(null);

    const handlePOSearch = async (overrideId = null) => {
        const idToSearch = overrideId || poSearchId;
        if (!idToSearch) return;

        setLoading(true);
        setError(null);
        setPrData(null);
        setPrList([]);
        setPoData(null);
        setPoList([]);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/api/po/${idToSearch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.type === "result" ? response.data.result : response.data;
            if (data.POHEADER || data.POITEM) {
                setPoData(data);
            } else {
                setError(data.RETURN?.MESSAGE || "PO not found in SAP.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch PO from SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handlePOListByPlant = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        setPrData(null);
        setPrList([]);
        setPoData(null);
        setPoList([]);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/api/po/list?plant=${poPlantFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.type === "result" ? response.data.result : response.data;
            if (Array.isArray(data)) {
                setPoList(data);
            } else {
                setError("No POs found for this plant.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch PO list from SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (overrideId = null) => {
        const idToSearch = overrideId || searchId;
        if (!idToSearch) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        setPrData(null);
        setPrList([]);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/api/pr/${idToSearch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.type === "result" ? response.data.result : response.data;
            if (data.REQUISITION_ITEMS) {
                setPrData(data);
            } else {
                setError(data.RETURN?.MESSAGE || "PR not found in SAP.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch PR from SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handleListByPlant = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        setPrData(null);
        setPrList([]);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:5000/api/pr/list?plant=${plantFilter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.type === "result" ? response.data.result : response.data;
            if (Array.isArray(data)) {
                setPrList(data);
            } else {
                setError("No PRs found for this plant.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch PR list from SAP.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePR = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:5000/api/pr", {
                items: [newItem]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.type === "result" ? response.data.result : response.data;
            if (data.NUMBER) {
                alert(`Purchase Requisition Created: ${data.NUMBER}`);
                setSearchId(data.NUMBER);
                handleSearch();
                setCreateDialogOpen(false);
                setTabValue(0); // Switch to detail view
            } else {
                setError(data.RETURN?.MESSAGE || "SAP error occurred during PR creation.");
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || "Failed to create PR in SAP.";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePO = async (prNumber, prItem) => {
        if (!window.confirm(`Create Purchase Order from PR ${prNumber}, Item ${prItem}?`)) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`http://localhost:5000/api/po/create`,
                { prNumber, prItem },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Handle success
            const result = response.data;
            const finalData = result.type === "result" ? result.result : result;
            console.log("Creation Result:", finalData);

            let poNumber = finalData.EXPPURCHASEORDER || finalData.PURCHASEORDER || finalData.PO_NUMBER || "";

            // Fallback: Parse from Return Message (e.g. "Standard PO created under the number 4500017823")
            // Handle if finalData itself is an array of messages
            const potentialReturns = Array.isArray(finalData) ? finalData : (finalData.RETURN || []);
            const returns = Array.isArray(potentialReturns) ? potentialReturns : [potentialReturns];

            if (!poNumber) {
                const successMsg = returns.find(r => r.TYPE === 'S' && r.MESSAGE.includes('45'));
                if (successMsg) {
                    const match = successMsg.MESSAGE.match(/45\d{8}/);
                    if (match) poNumber = match[0];
                }
            }

            if (!poNumber && typeof finalData === 'string' && finalData.startsWith('45')) {
                poNumber = finalData;
            }

            if (poNumber) {
                setSuccess(`Successfully converted PR ${prNumber} to PO ${poNumber}`);
                setPrData(null);
                setPrList([]);
            } else if (result.type === "result" || finalData.EXPPURCHASEORDER === "") {
                setSuccess(`Successfully converted PR ${prNumber} to a PO! Check the Purchase Order list for details.`);
                setPrData(null);
                setPrList([]);
            } else {
                setError(finalData.RETURN?.MESSAGE || finalData.error || "SAP error occurred during PO creation.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to create PO in SAP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={5}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>
                        Purchase Requisitions
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Manage SAP Requisitions via Pillir Flow MCP.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                        fontWeight: 700,
                        borderRadius: '12px',
                        px: 3,
                        py: 1.2
                    }}
                >
                    Create PR
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newVal) => setTabValue(newVal)} aria-label="PR/PO search tabs">
                    <Tab label="Search PR" sx={{ fontWeight: 700 }} />
                    <Tab label="PR by Plant" sx={{ fontWeight: 700 }} />
                    <Tab label="Search PO" sx={{ fontWeight: 700 }} />
                    <Tab label="PO by Plant" sx={{ fontWeight: 700 }} />
                </Tabs>
            </Box>

            {tabValue === 2 && (
                <Paper sx={{ p: 4, borderRadius: '24px', mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Search by Purchase Order Number</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                label="PO Number"
                                value={poSearchId}
                                onChange={(e) => setPoSearchId(e.target.value)}
                                placeholder="Enter PO Number (e.g. 4500000001)"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => handlePOSearch()}
                                disabled={loading}
                                sx={{ height: '56px', borderRadius: '12px' }}
                                startIcon={<SearchIcon />}
                            >
                                Fetch PO
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {tabValue === 3 && (
                <Paper sx={{ p: 4, borderRadius: '24px', mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>List POs by Plant (EKPO Access)</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                label="Plant Code"
                                value={poPlantFilter}
                                onChange={(e) => setPoPlantFilter(e.target.value)}
                                placeholder="Enter Plant (e.g. 1000)"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                size="large"
                                onClick={handlePOListByPlant}
                                disabled={loading}
                                sx={{ height: '56px', borderRadius: '12px' }}
                                startIcon={<SearchIcon />}
                            >
                                List POs
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {tabValue === 0 && (
                <Paper sx={{ p: 4, borderRadius: '24px', mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Search by PR Number</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                label="Requisition Number"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="Enter PR Number (e.g. 10000001)"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => handleSearch()}
                                disabled={loading}
                                sx={{ height: '56px', borderRadius: '12px' }}
                                startIcon={<SearchIcon />}
                            >
                                Fetch Detail
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {tabValue === 1 && (
                <Paper sx={{ p: 4, borderRadius: '24px', mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>List by Plant (Direct EBAN Access)</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={9}>
                            <TextField
                                fullWidth
                                label="Plant Code"
                                value={plantFilter}
                                onChange={(e) => setPlantFilter(e.target.value)}
                                placeholder="Enter Plant (e.g. 1000)"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                onClick={handleListByPlant}
                                disabled={loading}
                                sx={{ height: '56px', borderRadius: '12px' }}
                                startIcon={<SearchIcon />}
                            >
                                List PRs
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '12px' }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}

            {poList.length > 0 && (
                <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', mb: 4 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
                            Purchase Orders for Plant {poPlantFilter}
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}` }}>
                            <Table>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>PO Number</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {poList.map((item, index) => (
                                        <TableRow key={index} hover sx={{ cursor: 'pointer' }} onClick={() => {
                                            setPoSearchId(item.EBELN);
                                            handlePOSearch(item.EBELN);
                                        }}>
                                            <TableCell>{item.EBELN}</TableCell>
                                            <TableCell>{item.EBELP}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{item.MATNR}</TableCell>
                                            <TableCell>{item.MENGE}</TableCell>
                                            <TableCell>{item.TXZ01}</TableCell>
                                            <TableCell>{item.AEDAT}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {poData && (
                <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', mb: 4 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
                            Purchase Order Details: {poSearchId}
                        </Typography>
                        {poData.POHEADER && (
                            <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: '12px' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">Vendor</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{poData.POHEADER.VENDOR}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">Doc Type</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{poData.POHEADER.DOC_TYPE}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">Purch. Org</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{poData.POHEADER.PURCH_ORG}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">Comp Code</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{poData.POHEADER.COMP_CODE}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}` }}>
                            <Table>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Plant</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Net Price</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {poData.POITEM && poData.POITEM.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.PO_ITEM}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{item.MATERIAL}</TableCell>
                                            <TableCell>{item.PLANT}</TableCell>
                                            <TableCell align="right">{item.QUANTITY}</TableCell>
                                            <TableCell>{item.NET_PRICE}</TableCell>
                                            <TableCell>{item.SHORT_TEXT}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {prList.length > 0 && (
                <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', mb: 4 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
                            Requisitions for Plant {plantFilter}
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}` }}>
                            <Table>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>PR Number</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Text</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prList.map((item, index) => (
                                        <TableRow key={index} hover sx={{ cursor: 'pointer' }} onClick={() => {
                                            setSearchId(item.BANFN);
                                            handleSearch(item.BANFN);
                                            setTabValue(0);
                                        }}>
                                            <TableCell>{item.BANFN}</TableCell>
                                            <TableCell>{item.BNFPO}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{item.MATNR}</TableCell>
                                            <TableCell>{item.MENGE}</TableCell>
                                            <TableCell>{item.BADAT}</TableCell>
                                            <TableCell>{item.TXZ01}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {prData && (
                <Card sx={{ borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
                            Requisition Details {searchId}
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}` }}>
                            <Table>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Plant</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {prData.REQUISITION_ITEMS.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.PREQ_ITEM}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{item.MATERIAL}</TableCell>
                                            <TableCell>{item.PLANT}</TableCell>
                                            <TableCell align="right">{item.QUANTITY}</TableCell>
                                            <TableCell>{item.SHORT_TEXT}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    size="small"
                                                    onClick={() => handleCreatePO(searchId, item.PREQ_ITEM)}
                                                    disabled={loading}
                                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                                >
                                                    PO Creation
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Create New Purchase Requisition</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="Material"
                                value={newItem.MATERIAL}
                                onChange={(e) => setNewItem({ ...newItem, MATERIAL: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Plant"
                                value={newItem.PLANT}
                                onChange={(e) => setNewItem({ ...newItem, PLANT: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Quantity"
                                type="number"
                                value={newItem.QUANTITY}
                                onChange={(e) => setNewItem({ ...newItem, QUANTITY: Number(e.target.value) })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Price"
                                type="number"
                                value={newItem.PRICE}
                                onChange={(e) => setNewItem({ ...newItem, PRICE: Number(e.target.value) })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Acct. Assign. Cat"
                                value={newItem.ACCTASSCAT}
                                onChange={(e) => setNewItem({ ...newItem, ACCTASSCAT: e.target.value.toUpperCase() })}
                                fullWidth
                                placeholder="K, P, F, etc."
                                helperText="K = Cost Center, P = Project"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Cost Center ID"
                                value={newItem.COSTCENTER}
                                onChange={(e) => setNewItem({ ...newItem, COSTCENTER: e.target.value })}
                                fullWidth
                                placeholder="e.g. 1000"
                                helperText="Required if Category is K"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Delivery Date"
                                type="date"
                                value={newItem.DELIV_DATE}
                                onChange={(e) => setNewItem({ ...newItem, DELIV_DATE: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreatePR} disabled={loading} sx={{ borderRadius: '12px' }}>
                        {loading ? <CircularProgress size={24} /> : "Create in SAP"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PurchaseRequisition;
