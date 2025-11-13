// components/ProtectedOutlet.tsx
import {
    Box,
    Button,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";



const menu = [
    { text: "File Upload", to: "/app/upload" },
    { text: "Car Company", to: "/app/car-company" },
    { text: "Car Model", to: "/app/car-model" },
    { text: "Car Sides", to: "/app/car-sides" },
    { text: "Car Features", to: "/app/car-features" },
    { text: "Car Services", to: "/app/car-services" },
    { text: "Car Preview", to: "/app/car-preview" }
];



const ProtectedOutlet = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("x-api-key");
        navigate("/", { replace: true });
    };

    return (
        <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: 240,
                        boxSizing: "border-box",
                        bgcolor: "background.paper",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    },
                }}
            >
                <Box>
                    <Box sx={{ p: 2, fontWeight: "bold", textAlign: "center" }}>My Dashboard</Box>
                    <List>
                        {menu.map((item) => (
                            <ListItemButton
                                key={item.text}
                                component={NavLink}
                                to={item.to}
                                sx={{
                                    "&.active": {
                                        bgcolor: "primary.main",
                                    },
                                }}
                            >
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>

                <Box sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    overflow: "auto",
                    color: "white",
                    bgcolor: "background.default",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default ProtectedOutlet;
