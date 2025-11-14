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

interface CarSide {
    _id: string;
    sideName: string;
    description: string;
}

interface Feature {
    _id: string;
    featureName: string;
    description: string;
    carSide?: string;
    carSidesName?: string;
    timestamp: string;
}

const CarFeatures = () => {
    const [featureName, setFeatureName] = useState("");
    const [description, setDescription] = useState("");
    const [sideId, setSideId] = useState("");
    const [carSides, setCarSides] = useState<CarSide[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSides, setLoadingSides] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

    // ✅ Fetch all car sides
    const fetchCarSides = async () => {
        setLoadingSides(true);
        try {
            const res = await api.get("/api/v1/car-sides");
            const data = res.data?.result || res.data?.data || [];
            setCarSides(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch car sides:", err);
            setCarSides([]);
        } finally {
            setLoadingSides(false);
        }
    };

    // ✅ Fetch all features
    const fetchFeatures = async () => {
        try {
            const res = await api.get("/api/v1/features");
            const data = res.data?.result || res.data?.data || [];
            setFeatures(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch features:", err);
            setFeatures([]);
        }
    };

    useEffect(() => {
        fetchCarSides();
        fetchFeatures();
    }, []);

    // ✅ Add new feature and reload table
    const handleAddFeature = async () => {
        if (!sideId || !featureName || !description)
            return alert("Please fill all fields");

        setLoading(true);
        try {
            const res = await api.post(`/api/v1/features?carSideId=${sideId}`, {
                featureName,
                description,
            });

            if (res.data?.success) {
                // ✅ Re-fetch full list from backend to show instantly
                await fetchFeatures();

                // ✅ Reset form
                setFeatureName("");
                setDescription("");
                setSideId("");
            } else {
                alert(res.data?.message || "Failed to add feature");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add feature");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete feature and reload list
    const handleDeleteFeature = async (id: string) => {
        if (!confirm("Are you sure you want to delete this feature?")) return;
        try {
            const res = await api.delete(`/api/v1/features?featureId=${id}`);
            if (res.data?.success) {
                await fetchFeatures();
            } else {
                alert(res.data?.message || "Failed to delete feature");
            }
        } catch (err) {
            alert("Failed to delete feature");
        }
    };

    // ✅ Update placeholder
    const handleOpenUpdate = (feature: Feature) => {
        setSelectedFeature(feature);
        setOpenUpdate(true);
    };

    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setSelectedFeature(null);
    };

    const handleUpdateFeature = () => {
        alert("Feature update coming soon 🚧");
        handleCloseUpdate();
    };

    return (
        <Box>
            <Typography variant="h5" mb={2}>
                Car Features
            </Typography>

            {/* ---------- Add Feature Form ---------- */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        alignItems: "center",
                    }}
                >
                    {/* Car Side Dropdown */}
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Car Side</InputLabel>
                        {loadingSides ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Select
                                value={sideId}
                                onChange={(e: SelectChangeEvent) => setSideId(e.target.value)}
                                label="Car Side"
                            >
                                {Array.isArray(carSides) && carSides.length > 0 ? (
                                    carSides.map((side) => (
                                        <MenuItem key={side._id} value={side._id}>
                                            {side.sideName}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>No sides found</MenuItem>
                                )}
                            </Select>
                        )}
                    </FormControl>

                    <TextField
                        label="Feature Name"
                        value={featureName}
                        onChange={(e) => setFeatureName(e.target.value)}
                        sx={{ flex: "1 1 200px" }}
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ flex: "2 1 300px" }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleAddFeature}
                        disabled={loading}
                        sx={{ height: 40 }}
                    >
                        {loading ? "Adding..." : "Add Feature"}
                    </Button>
                </Box>
            </Paper>

            {/* ---------- Features Table ---------- */}
            {Array.isArray(features) && features.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Feature Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Car Side Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {features.map((f) => (
                                <TableRow key={f._id}>
                                    <TableCell>{f._id}</TableCell>
                                    <TableCell>{f.featureName}</TableCell>
                                    <TableCell>{f.description}</TableCell>
                                    <TableCell>{f.carSidesName || "N/A"}</TableCell>
                                    <TableCell>
                                        {f.timestamp
                                            ? new Date(f.timestamp).toLocaleString()
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleOpenUpdate(f)}
                                            sx={{ mr: 1 }}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteFeature(f._id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography color="gray" textAlign="center">
                    No features found.
                </Typography>
            )}

            {/* ---------- Update Dialog ---------- */}
            <Dialog open={openUpdate} onClose={handleCloseUpdate}>
                <DialogTitle>Update Feature</DialogTitle>
                <DialogContent>
                    <Typography>Feature update coming soon 🚧</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdate}>Close</Button>
                    <Button onClick={handleUpdateFeature} variant="contained">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CarFeatures;
