import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface CarCompany {
    _id: string;
    companyName: string;
    companyLogo: string;
}

interface FileOption {
    _id: string;
    filename: string;
    filePath: string;
}

interface CarModel {
    _id: string;
    modelName: string;
    modelPicture: string;
    carCompany: string;
    modelDescription: string;
    timestamp: string;
}

const CarModelManager = () => {
    const [companies, setCompanies] = useState<CarCompany[]>([]);
    const [logoFiles, setLogoFiles] = useState<FileOption[]>([]);
    const [carModels, setCarModels] = useState<CarModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingLogos, setLoadingLogos] = useState(false);

    const [carCompany, setCarCompany] = useState("");
    const [modelName, setModelName] = useState("");
    const [modelDescription, setModelDescription] = useState("");
    const [modelPicture, setModelPicture] = useState("");

    const [openUpdate, setOpenUpdate] = useState(false);
    const [updateCarModelId, setUpdateCarModelId] = useState<string | null>(null);

    // Fetch Car Companies
    const fetchCompanies = async () => {
        try {
            const res = await api.get("/api/v1/car-companies");
            if (res.data.success) setCompanies(res.data.result);
        } catch (err) {
            console.error("Failed to fetch companies:", err);
        }
    };

    // Fetch Model Pictures (Logo files)
    const fetchModelPictures = async () => {
        setLoadingLogos(true);
        try {
            const res = await api.get("/api/v1/file-details/by-category?category=model");
            if (res.data.success) setLogoFiles(res.data.data);
        } catch (err) {
            console.error("Failed to fetch logos:", err);
        } finally {
            setLoadingLogos(false);
        }
    };

    // Fetch Car Models
    const fetchCarModels = async () => {
        try {
            const res = await api.get("/api/v1/car-models");
            if (res.data.success) setCarModels(res.data.result);
        } catch (err) {
            console.error("Failed to fetch car models:", err);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchModelPictures();
        fetchCarModels();
    }, []);

    // Add Car Model
    const handleAddCarModel = async () => {
        if (!carCompany || !modelName || !modelDescription || !modelPicture) {
            return alert("Please fill all fields");
        }

        setLoading(true);
        try {
            const res = await api.post(`/api/v1/car-models?companyId=${carCompany}`, {
                modelName,
                modelPicture,
                modelDescription,
            });

            if (res.data.success) {
                fetchCarModels();
                setCarCompany("");
                setModelName("");
                setModelDescription("");
                setModelPicture("");
            } else {
                alert(res.data.message || "Failed to add car model");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add car model");
        } finally {
            setLoading(false);
        }
    };

    // Delete Car Model
    const handleDeleteCarModel = async (id: string) => {
        if (!confirm("Are you sure you want to delete this car model?")) return;
        try {
            const res = await api.delete(`/api/v1/car-models?carModelId=${id}`);
            if (res.data.success) {
                fetchCarModels();
            } else {
                alert(res.data.message || "Failed to delete car model");
            }
        } catch (err) {
            alert("Failed to delete car model");
        }
    };

    // Open Update Modal
    const handleOpenUpdate = (model: CarModel) => {
        setUpdateCarModelId(model._id);
        setCarCompany(model.carCompany);
        setModelName(model.modelName);
        setModelDescription(model.modelDescription);
        setModelPicture(model.modelPicture);
        setOpenUpdate(true);
    };

    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setUpdateCarModelId(null);
        setCarCompany("");
        setModelName("");
        setModelDescription("");
        setModelPicture("");
    };

    // Update Car Model
    const handleUpdateCarModel = async () => {
        if (!updateCarModelId || !carCompany) return;

        if (!modelName || !modelDescription || !modelPicture) {
            return alert("Please fill all fields");
        }

        setLoading(true);
        try {
            const res = await api.put(
                `/api/v1/car-models?companyId=${carCompany}&carModelId=${updateCarModelId}`,
                { modelName, modelPicture, modelDescription }
            );

            if (res.data.success) {
                fetchCarModels();
                handleCloseUpdate();
            } else {
                alert(res.data.message || "Failed to update car model");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update car model");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" mb={2}>
                Car Models Management
            </Typography>

            {/* Add Form */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                    {/* Car Company Dropdown */}
                    <FormControl sx={{ flex: "1 1 200px" }}>
                        <InputLabel>Car Company</InputLabel>
                        <Select
                            value={carCompany}
                            onChange={(e: SelectChangeEvent) => setCarCompany(e.target.value)}
                            label="Car Company"
                        >
                            {companies.map((c) => (
                                <MenuItem key={c._id} value={c._id}>
                                    <img
                                        src={c.companyLogo}
                                        alt={c.companyName}
                                        style={{ width: 30, height: 30, marginRight: 8 }}
                                    />
                                    {c.companyName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Model Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        sx={{ flex: "1 1 200px" }}
                    />

                    <TextField
                        label="Model Description"
                        value={modelDescription}
                        onChange={(e) => setModelDescription(e.target.value)}
                        sx={{ flex: "2 1 300px" }}
                    />

                    {/* Model Picture Dropdown */}
                    <FormControl sx={{ flex: "1 1 200px" }}>
                        <InputLabel>Model Picture</InputLabel>
                        {loadingLogos ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Select
                                value={modelPicture}
                                onChange={(e: SelectChangeEvent) => setModelPicture(e.target.value)}
                                label="Model Picture"
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
                        onClick={handleAddCarModel}
                        disabled={loading}
                        sx={{ flex: "0 0 auto", height: 40 }}
                    >
                        {loading ? "Adding..." : "Add Model"}
                    </Button>
                </Box>
            </Paper>

            {/* Models Table */}
            {carModels.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Company</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Model Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Picture</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {carModels.map((m) => {
                                const company = companies.find((c) => c._id === m.carCompany);
                                return (
                                    <TableRow key={m._id}>
                                        <TableCell>{m._id}</TableCell>
                                        <TableCell>
                                            {company ? (
                                                <>
                                                    <img
                                                        src={company.companyLogo}
                                                        alt={company.companyName}
                                                        style={{ width: 30, height: 30, marginRight: 8 }}
                                                    />
                                                    {company.companyName}
                                                </>
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                        <TableCell>{m.modelName}</TableCell>
                                        <TableCell>
                                            <img
                                                src={m.modelPicture}
                                                alt={m.modelName}
                                                style={{ width: 50, height: 50 }}
                                            />
                                        </TableCell>
                                        <TableCell>{m.modelDescription}</TableCell>
                                        <TableCell>{new Date(m.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                                sx={{ mr: 1 }}
                                                onClick={() => handleOpenUpdate(m)}
                                            >
                                                Update
                                            </Button>
                                            <Button
                                                color="error"
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleDeleteCarModel(m._id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Update Modal */}
            <Dialog open={openUpdate} onClose={handleCloseUpdate}>
                <DialogTitle>Update Car Model</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <FormControl>
                        <InputLabel>Car Company</InputLabel>
                        <Select
                            value={carCompany}
                            onChange={(e: SelectChangeEvent) => setCarCompany(e.target.value)}
                            label="Car Company"
                        >
                            {companies.map((c) => (
                                <MenuItem key={c._id} value={c._id}>
                                    <img
                                        src={c.companyLogo}
                                        alt={c.companyName}
                                        style={{ width: 30, height: 30, marginRight: 8 }}
                                    />
                                    {c.companyName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Model Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                    />
                    <TextField
                        label="Model Description"
                        value={modelDescription}
                        onChange={(e) => setModelDescription(e.target.value)}
                    />

                    <FormControl>
                        <InputLabel>Model Picture</InputLabel>
                        <Select
                            value={modelPicture}
                            onChange={(e: SelectChangeEvent) => setModelPicture(e.target.value)}
                            label="Model Picture"
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
                    <Button variant="contained" onClick={handleUpdateCarModel} disabled={loading}>
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CarModelManager;
