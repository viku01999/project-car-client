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
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Avatar,
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

const CarPreview: React.FC = () => {
    const [companies, setCompanies] = useState<CarCompany[]>([]);
    const [models, setModels] = useState<CarModel[]>([]);
    const [services, setServices] = useState<CarService[]>([]);

    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");

    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);

    // Fetch all car companies
    useEffect(() => {
        api.get("/api/v1/car-companies")
            .then((res) => {
                setCompanies(res.data.result || []);
                setLoadingCompanies(false);
            })
            .catch(() => setLoadingCompanies(false));
    }, []);

    // Fetch models for the selected company
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

    // Fetch services for the selected model
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

            {/* Services Table */}
            {selectedModel && (
                <>
                    <Typography variant="h6">Services</Typography>
                    {loadingServices ? (
                        <CircularProgress />
                    ) : services.length === 0 ? (
                        <Typography>No services found for this model</Typography>
                    ) : (
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}
                </>
            )}
        </Box>
    );
};

export default CarPreview;