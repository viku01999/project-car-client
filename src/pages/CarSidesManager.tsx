import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface CarSide {
    _id: string;
    sideName: string;
    description: string;
    timestamp: string;
}

const CarSidesManager = () => {
    const [sideName, setSideName] = useState("");
    const [description, setDescription] = useState("");
    const [sides, setSides] = useState<CarSide[]>([]);
    const [loading, setLoading] = useState(false);

    const [openUpdate, setOpenUpdate] = useState(false);
    const [updateSideId, setUpdateSideId] = useState<string | null>(null);

    // Fetch all sides
    const fetchSides = async () => {
        try {
            const res = await api.get("/api/v1/car-sides");
            if (res.data.success) setSides(res.data.result || res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch car sides:", err);
        }
    };

    useEffect(() => {
        fetchSides();
    }, []);

    // Add new side
    const handleAddSide = async () => {
        if (!sideName || !description) return alert("Please fill all fields");

        setLoading(true);
        try {
            const res = await api.post("/api/v1/car-sides", {
                sideName,
                description,
            });

            if (res.data.success) {
                fetchSides();
                setSideName("");
                setDescription("");
            } else {
                alert(res.data.message || "Failed to add car side");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add car side");
        } finally {
            setLoading(false);
        }
    };

    // Delete side
    const handleDeleteSide = async (id: string) => {
        if (!confirm("Are you sure you want to delete this car side?")) return;

        try {
            const res = await api.delete(`/api/v1/car-sides?carSideId=${id}`);
            if (res.data.success) {
                fetchSides();
            } else {
                alert(res.data.message || "Failed to delete side");
            }
        } catch {
            alert("Failed to delete side");
        }
    };

    // Open update modal
    const handleOpenUpdate = (side: CarSide) => {
        setUpdateSideId(side._id);
        setSideName(side.sideName);
        setDescription(side.description);
        setOpenUpdate(true);
    };

    const handleCloseUpdate = () => {
        setOpenUpdate(false);
        setUpdateSideId(null);
        setSideName("");
        setDescription("");
    };

    // Update side
    const handleUpdateSide = async () => {
        if (!updateSideId || !sideName || !description)
            return alert("Please fill all fields");

        setLoading(true);
        try {
            const res = await api.put(`/api/v1/car-sides?carSideId=${updateSideId}`, {
                sideName,
                description,
            });

            if (res.data.success) {
                fetchSides();
                handleCloseUpdate();
            } else {
                alert(res.data.message || "Failed to update car side");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update car side");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" mb={2}>
                Car Sides Management
            </Typography>

            {/* Add Form */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                    <TextField
                        label="Side Name"
                        value={sideName}
                        onChange={(e) => setSideName(e.target.value)}
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
                        onClick={handleAddSide}
                        disabled={loading}
                        sx={{ flex: "0 0 auto", height: 40 }}
                    >
                        {loading ? "Adding..." : "Add Side"}
                    </Button>
                </Box>
            </Paper>

            {/* Sides Table */}
            {sides.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Side Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sides.map((s) => (
                                <TableRow key={s._id}>
                                    <TableCell>{s._id}</TableCell>
                                    <TableCell>{s.sideName}</TableCell>
                                    <TableCell>{s.description}</TableCell>
                                    <TableCell>{new Date(s.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            sx={{ mr: 1 }}
                                            onClick={() => handleOpenUpdate(s)}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleDeleteSide(s._id)}
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
                <DialogTitle>Update Car Side</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Side Name"
                        value={sideName}
                        onChange={(e) => setSideName(e.target.value)}
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdate}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateSide} disabled={loading}>
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CarSidesManager;
