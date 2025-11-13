// pages/LoginPage.tsx
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [apiKey, setApiKey] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from || "/app/upload";

    const handleLogin = () => {
        const key = apiKey.trim();

        if (!key) {
            alert("Please enter your x-api-key");
            return;
        }

        localStorage.setItem("x-api-key", key);

        navigate(from, { replace: true });
    };

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
            }}
        >
            <Paper sx={{ p: 4, width: 320, bgcolor: "background.paper" }}>
                <Typography variant="h6" gutterBottom>
                    Login
                </Typography>
                <TextField
                    fullWidth
                    label="x-api-key"
                    variant="outlined"
                    size="small"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                >
                    Submit
                </Button>
            </Paper>
        </Box>
    );
};

export default LoginPage;
