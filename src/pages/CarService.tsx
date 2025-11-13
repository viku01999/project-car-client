import React, { useEffect, useState } from "react";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    TextField,
    Button,
    CircularProgress,
    Box,
    Typography,
    Avatar,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import api from "../api/axiosConfig";

interface CarModel {
    _id: string;
    modelName: string;
    modelPicture: string;
}

interface CarSide {
    _id: string;
    sideName: string;
}

interface Feature {
    _id: string;
    featureName: string;
}

interface CarServiceData {
    _id: string;
    serviceName: string;
    serviceOffer: string[];
    description: string;
    listPrice: number;
    offerPrice: number;
    duration: string;
    carModel: string;
    tagType: string;
    timestamp: string;
}

const CarService: React.FC = () => {
    const [carModels, setCarModels] = useState<CarModel[]>([]);
    const [carSides, setCarSides] = useState<CarSide[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);

    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedSide, setSelectedSide] = useState<string>("");
    const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);

    const [serviceName, setServiceName] = useState("");
    const [description, setDescription] = useState("");
    const [listPrice, setListPrice] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [duration, setDuration] = useState("");

    const [loadingModels, setLoadingModels] = useState(true);
    const [loadingSides, setLoadingSides] = useState(false);
    const [loadingFeatures, setLoadingFeatures] = useState(false);

    const [viewModel, setViewModel] = useState<string>("");
    const [services, setServices] = useState<CarServiceData[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Load car models
    useEffect(() => {
        api.get("/api/v1/car-models").then((res) => {
            setCarModels(res.data.result || []);
            setLoadingModels(false);
        });
    }, []);

    // Load car sides when a model is selected
    useEffect(() => {
        if (!selectedModel) return;
        setLoadingSides(true);
        api.get("/api/v1/car-sides").then((res) => {
            setCarSides(res.data.data || []);
            setLoadingSides(false);
        });
    }, [selectedModel]);

    // Load features when a side is selected
    useEffect(() => {
        if (!selectedSide) return;
        setLoadingFeatures(true);
        api
            .get(`/api/v1/features/by-id?carSideId=${selectedSide}`)
            .then((res) => {
                setFeatures(res.data.data || []);
                setLoadingFeatures(false);
            });
    }, [selectedSide]);

    const handleSubmit = async () => {
        if (!selectedModel || !selectedSide || selectedFeatureIds.length === 0) {
            alert("Please select model, side, and features");
            return;
        }

        try {
            const selectedSideObj = carSides.find((side) => side._id === selectedSide);

            await api.post(`/api/v1/car-services?carModelId=${selectedModel}`, {
                serviceName,
                serviceOffer: selectedFeatureIds.map(
                    (id) => features.find((f) => f._id === id)?.featureName
                ),
                description,
                listPrice: Number(listPrice),
                offerPrice: Number(offerPrice),
                duration,
                carModel: selectedModel,
                tagType: selectedSideObj?.sideName || "",
            });

            alert("Service added successfully");

            // Reset form
            setSelectedModel("");
            setSelectedSide("");
            setSelectedFeatureIds([]);
            setServiceName("");
            setDescription("");
            setListPrice("");
            setOfferPrice("");
            setDuration("");

            // Refresh table if viewing this model
            if (viewModel === selectedModel) {
                fetchServices(viewModel);
            }
        } catch (err) {
            console.error(err);
            alert("Error adding service");
        }
    };

    // Fetch services for selected model
    const fetchServices = async (modelId: string) => {
        setLoadingServices(true);
        try {
            const res = await api.get(`/api/v1/car-services?carModel=${modelId}`);
            setServices(res.data.result || []);
        } catch (err) {
            console.error(err);
            alert("Error fetching services");
        }
        setLoadingServices(false);
    };

    // Delete a service
    const handleDeleteService = async (serviceId: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            await api.delete(`/api/v1/car-services?serviceId=${serviceId}`);
            alert("Service deleted successfully");
            fetchServices(viewModel);
        } catch (err) {
            console.error(err);
            alert("Failed to delete service");
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            {/* --- Add Service Form --- */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6">Add New Service</Typography>

                <FormControl sx={{ width: "100%" }}>
                    <InputLabel>Car Model</InputLabel>
                    {loadingModels ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Select
                            value={selectedModel}
                            onChange={(e: SelectChangeEvent) => setSelectedModel(e.target.value)}
                            label="Car Model"
                            renderValue={(id) => {
                                const model = carModels.find((m) => m._id === id);
                                if (!model) return "";
                                return (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Avatar src={model.modelPicture} variant="square" sx={{ width: 24, height: 24 }} />
                                        <Typography variant="body2">{model.modelName}</Typography>
                                    </Box>
                                );
                            }}
                        >
                            {carModels.map((model) => (
                                <MenuItem key={model._id} value={model._id}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Avatar src={model.modelPicture} variant="square" sx={{ width: 24, height: 24 }} />
                                        <Typography variant="body2">{model.modelName}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </FormControl>

                <FormControl sx={{ width: 200 }}>
                    <InputLabel>Car Side</InputLabel>
                    {loadingSides ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Select
                            value={selectedSide}
                            onChange={(e: SelectChangeEvent) => setSelectedSide(e.target.value)}
                            label="Car Side"
                        >
                            {carSides.map((side) => (
                                <MenuItem key={side._id} value={side._id}>
                                    {side.sideName}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </FormControl>

                <FormControl sx={{ width: "100%" }}>
                    <InputLabel>Services / Features</InputLabel>
                    {loadingFeatures ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Select
                            multiple
                            value={selectedFeatureIds}
                            onChange={(e) => setSelectedFeatureIds(e.target.value as string[])}
                            renderValue={(selected) =>
                                (selected as string[])
                                    .map((id) => features.find((f) => f._id === id)?.featureName)
                                    .join(", ")
                            }
                        >
                            {features.map((feature) => (
                                <MenuItem key={feature._id} value={feature._id}>
                                    <Checkbox checked={selectedFeatureIds.includes(feature._id)} />
                                    <ListItemText primary={feature.featureName} />
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </FormControl>

                <TextField
                    label="Service Name"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        label="List Price"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        type="number"
                        sx={{ flex: 1 }}
                    />
                    <TextField
                        label="Offer Price"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        type="number"
                        sx={{ flex: 1 }}
                    />
                    <TextField
                        label="Duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 90 minutes"
                        sx={{ flex: 1 }}
                    />
                </Box>

                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Add Service
                </Button>
            </Box>

            {/* --- View Services Table --- */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6">View Services by Car Model</Typography>

                <FormControl sx={{ width: 300 }}>
                    <InputLabel>Select Car Model</InputLabel>
                    <Select
                        value={viewModel}
                        onChange={(e: SelectChangeEvent) => {
                            setViewModel(e.target.value);
                            fetchServices(e.target.value);
                        }}
                        label="Select Car Model"
                    >
                        {carModels.map((model) => (
                            <MenuItem key={model._id} value={model._id}>
                                {model.modelName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {loadingServices ? (
                    <CircularProgress />
                ) : (
                    viewModel && (
                        <Paper>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Service Name</TableCell>
                                        <TableCell>Features</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>List Price</TableCell>
                                        <TableCell>Offer Price</TableCell>
                                        <TableCell>Duration</TableCell>
                                        <TableCell>Tag Type</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service._id}>
                                            <TableCell>{service.serviceName}</TableCell>
                                            <TableCell>{service.serviceOffer.join(", ")}</TableCell>
                                            <TableCell>{service.description}</TableCell>
                                            <TableCell>{service.listPrice}</TableCell>
                                            <TableCell>{service.offerPrice}</TableCell>
                                            <TableCell>{service.duration}</TableCell>
                                            <TableCell>{service.tagType}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteService(service._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    )
                )}
            </Box>
        </Box>
    );
};

export default CarService;
