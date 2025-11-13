import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import type { SelectChangeEvent } from "@mui/material/Select";

interface CarCompany {
    _id: string;
    companyName: string;
    companyLogo: string;
    companyDescription: string;
    timestamp: string;
}

interface FileOption {
    _id: string;
    filename: string;
    filePath: string;
}

const AddCarCompany = () => {
    const [companyName, setCompanyName] = useState("");
    const [companyDescription, setCompanyDescription] = useState("");
    const [companyLogo, setCompanyLogo] = useState("");

    const [companies, setCompanies] = useState<CarCompany[]>([]);
    const [logoFiles, setLogoFiles] = useState<FileOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingLogos, setLoadingLogos] = useState(false);

    // Update modal state
    const [openUpdate, setOpenUpdate] = useState(false);
    const [updateCompanyId, setUpdateCompanyId] = useState<string | null>(null);

    // Fetch car companies
    const fetchCompanies = async () => {
        try {
            const res = await api.get("/api/v1/car-companies");
            if (res.data.success) setCompanies(res.data.result);
        } catch (err) {
            console.error("Failed to fetch companies:", err);
        }
    };

    // Fetch logos for dropdown
    const fetchLogos = async () => {
        setLoadingLogos(true);
        try {
            const res = await api.get(
                "/api/v1/file-details/by-category?category=logo"
            );
            if (res.data.success) setLogoFiles(res.data.data);
        } catch (err) {
            console.error("Failed to fetch logos:", err);
        } finally {
            setLoadingLogos(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchLogos();
    }, []);

    const handleAddCompany = async () => {
        if (!companyName || !companyDescription || !companyLogo)
            return alert("Please fill all fields");

        setLoading(true);
        try {
            const res = await api.post("/api/v1/car-companies", {
                companyName,
                companyDescription,
                companyLogo,
            });

            if (res.data.success) {
                setCompanies((prev) => [res.data.result, ...prev]);
                setCompanyName("");
                setCompanyDescription("");
                setCompanyLogo("");
            } else {
                alert(res.data.message || "Failed to add company");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add company");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm("Are you sure you want to delete this company?")) return;

        try {
            const res = await api.delete(`/api/v1/car-companies/${id}`);
            if (res.data.success) {
                setCompanies((prev) => prev.filter((c) => c._id !== id));
            } else {
                alert(res.data.message || "Failed to delete company");
            }
        } catch (err) {
            alert("Failed to delete company");
        }
    };

    // Open update modal
    const handleOpenUpdate = (company: CarCompany) => {
        setUpdateCompanyId(company._id);
        setCompanyName(company.companyName);
        setCompanyDescription(company.companyDescription);
        setCompanyLogo(company.companyLogo);
        setOpenUpdate(true);
    };

    // Close update modal
    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setUpdateCompanyId(null);
        setCompanyName("");
        setCompanyDescription("");
        setCompanyLogo("");
    };

    // Update company
    const handleUpdateCompany = async () => {
        if (!updateCompanyId) return;

        if (!companyName || !companyDescription || !companyLogo)
            return alert("Please fill all fields");

        setLoading(true);
        try {
            const res = await api.put(`/api/v1/car-companies?carCompanyId=${updateCompanyId}`, {
                companyName,
                companyDescription,
                companyLogo,
            });

            if (res.data.success) {
                fetchCompanies(); // Refetch updated list
                handleCloseUpdate();
            } else {
                alert(res.data.message || "Failed to update company");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" mb={2}>
                Add Car Company
            </Typography>

            {/* Form */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                    <TextField
                        label="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        sx={{ flex: "1 1 200px" }}
                    />
                    <TextField
                        label="Description"
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        sx={{ flex: "2 1 300px" }}
                    />

                    <FormControl sx={{ flex: "1 1 200px" }}>
                        <InputLabel>Company Logo</InputLabel>
                        {loadingLogos ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Select
                                value={companyLogo}
                                onChange={(e: SelectChangeEvent) => setCompanyLogo(e.target.value)}
                                label="Company Logo"
                            >
                                {logoFiles.map((logo) => (
                                    <MenuItem key={logo._id} value={logo.filePath}>
                                        <img
                                            src={logo.filePath}
                                            alt={logo.filename}
                                            style={{ width: 30, height: 30, marginRight: 8 }}
                                        />
                                        {logo.filename}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={handleAddCompany}
                        disabled={loading}
                        sx={{ flex: "0 0 auto", height: 40 }}
                    >
                        {loading ? "Adding..." : "Add Company"}
                    </Button>
                </Box>
            </Paper>

            {/* Companies Table */}
            {companies.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Logo</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {companies.map((c) => (
                                <TableRow key={c._id}>
                                    <TableCell>{c._id}</TableCell>
                                    <TableCell>{c.companyName}</TableCell>
                                    <TableCell>
                                        <img
                                            src={c.companyLogo}
                                            alt={c.companyName}
                                            style={{ width: 50, height: 50 }}
                                        />
                                    </TableCell>
                                    <TableCell>{c.companyDescription}</TableCell>
                                    <TableCell>{new Date(c.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenUpdate(c)}
                                            sx={{ mr: 1 }}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleDeleteCompany(c._id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Update Modal */}
            <Dialog open={openUpdate} onClose={handleCloseUpdate}>
                <DialogTitle>Update Car Company</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Company Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <TextField
                        label="Description"
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                    />
                    <FormControl>
                        <InputLabel>Company Logo</InputLabel>
                        <Select
                            value={companyLogo}
                            onChange={(e: SelectChangeEvent) => setCompanyLogo(e.target.value)}
                            label="Company Logo"
                        >
                            {logoFiles.map((logo) => (
                                <MenuItem key={logo._id} value={logo.filePath}>
                                    <img
                                        src={logo.filePath}
                                        alt={logo.filename}
                                        style={{ width: 30, height: 30, marginRight: 8 }}
                                    />
                                    {logo.filename}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdate}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateCompany} disabled={loading}>
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddCarCompany;
