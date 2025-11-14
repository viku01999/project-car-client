import React, { useEffect, useState } from "react";
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Typography,
    Paper,
    Avatar,
    Card,
    CardMedia,
    CardContent,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import api from "../api/axiosConfig";

interface CarCompany {
    _id: string;
    companyName: string;
    companyLogo: string;
    companyDescription: string;
}

interface CarModel {
    _id: string;
    modelName: string;
    modelPicture: string;
    modelDescription: string;
}

interface CarService {
    _id: string;
    serviceName: string;
    serviceOffer: string[];
    description: string;
    listPrice: number;
    offerPrice: number;
    duration: string;
    tagType: string;
}

interface CarSide {
    _id: string;
    sideName: string;
    fileUrl: string;
    description: string;
}

const CarPreview: React.FC = () => {
    const [companies, setCompanies] = useState<CarCompany[]>([]);
    const [models, setModels] = useState<CarModel[]>([]);
    const [services, setServices] = useState<CarService[]>([]);
    const [sides, setSides] = useState<CarSide[]>([]);

    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");

    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);
    const [loadingSides, setLoadingSides] = useState(true);

    // Fetch all car companies
    useEffect(() => {
        api.get("/api/v1/car-companies")
            .then((res) => {
                setCompanies(res.data.result || []);
                setLoadingCompanies(false);
            })
            .catch(() => setLoadingCompanies(false));
    }, []);

    // Fetch models for selected company
    useEffect(() => {
        if (!selectedCompany) return;
        setLoadingModels(true);
        api.get(`/api/v1/car-models?companyId=${selectedCompany}`)
            .then((res) => {
                setModels(res.data.result || []);
                setLoadingModels(false);
            })
            .catch(() => setLoadingModels(false));
    }, [selectedCompany]);

    // Fetch services for selected model
    useEffect(() => {
        if (!selectedModel) return;
        setLoadingServices(true);
        api.get(`/api/v1/car-services?carModel=${selectedModel}`)
            .then((res) => {
                setServices(res.data.result || []);
                setLoadingServices(false);
            })
            .catch(() => setLoadingServices(false));
    }, [selectedModel]);

    // Fetch all sides
    useEffect(() => {
        api.get("/api/v1/car-sides")
            .then((res) => {
                setSides(res.data.data || []);
                setLoadingSides(false);
            })
            .catch(() => setLoadingSides(false));
    }, []);

    // Helper: get side image by tagType
    const getSideImage = (tagType: string) => {
        const side = sides.find((s) => s.sideName.toLowerCase() === tagType.toLowerCase());
        return side?.fileUrl || "";
    };

    const currentModel = models.find((m) => m._id === selectedModel);

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <Typography variant="h5">Car Preview</Typography>

            {/* Company dropdown */}
            <FormControl sx={{ width: 300 }}>
                <InputLabel>Car Company</InputLabel>
                {loadingCompanies ? (
                    <CircularProgress size={24} />
                ) : (
                    <Select
                        value={selectedCompany}
                        onChange={(e: SelectChangeEvent) => {
                            setSelectedCompany(e.target.value);
                            setSelectedModel("");
                            setServices([]);
                        }}
                        label="Car Company"
                    >
                        {companies.map((company) => (
                            <MenuItem key={company._id} value={company._id}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Avatar src={company.companyLogo} variant="square" sx={{ width: 24, height: 24 }} />
                                    {company.companyName}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                )}
            </FormControl>

            {/* Model dropdown */}
            {selectedCompany && (
                <FormControl sx={{ width: 300 }}>
                    <InputLabel>Car Model</InputLabel>
                    {loadingModels ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Select
                            value={selectedModel}
                            onChange={(e: SelectChangeEvent) => setSelectedModel(e.target.value)}
                            label="Car Model"
                        >
                            {models.map((model) => (
                                <MenuItem key={model._id} value={model._id}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Avatar src={model.modelPicture} variant="square" sx={{ width: 24, height: 24 }} />
                                        {model.modelName}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </FormControl>
            )}

            {/* Model preview */}
            {currentModel && (
                <Card sx={{ display: "flex", gap: 2, p: 2 }}>
                    <CardMedia
                        component="img"
                        sx={{ width: 200 }}
                        image={currentModel.modelPicture}
                        alt={currentModel.modelName}
                    />
                    <CardContent>
                        <Typography variant="h6">{currentModel.modelName}</Typography>
                        <Typography color="gray">{currentModel.modelDescription}</Typography>
                    </CardContent>
                </Card>
            )}

            {/* Services & Side Preview */}
            {selectedModel && (
                <>
                    <Typography variant="h6">Services & Side Preview</Typography>
                    {loadingServices || loadingSides ? (
                        <CircularProgress />
                    ) : services.length === 0 ? (
                        <Typography>No services found for this model</Typography>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {services.map((service) => (
                                <Paper sx={{ p: 2 }} key={service._id}>
                                    <Typography variant="subtitle1">{service.serviceName}</Typography>
                                    <Typography variant="body2" color="gray">
                                        {service.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        Offers: {service.serviceOffer.join(", ")}
                                    </Typography>
                                    <Typography variant="body2">
                                        Price: {service.listPrice} | Offer: {service.offerPrice}
                                    </Typography>
                                    <Typography variant="body2">Duration: {service.duration}</Typography>
                                    <Typography variant="body2">Tag Type: {service.tagType}</Typography>

                                    {/* Side Image */}
                                    {getSideImage(service.tagType) && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption">Side Preview:</Typography>
                                            <img
                                                src={getSideImage(service.tagType)}
                                                alt={service.tagType}
                                                style={{ width: "100%", marginTop: 4 }}
                                            />
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default CarPreview;
