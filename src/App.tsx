import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedOutlet from "./components/ProtectedOutlet";
import FileUploadPage from "./pages/FileUploadPage";
import LoginPage from "./pages/LoginPage";
import AddCarCompany from "./pages/AddCarCompany";
import CarModelManager from "./pages/CarModelManager";
import CarSidesManager from "./pages/CarSidesManager";
import CarFeatures from "./pages/CarFeatures";
import CarService from "./pages/CarService";
import CarPreview from "./pages/CarPreview";



const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    primary: { main: "#3b82f6" },
  },
});

const AppRoutes = () => {
  const isAuthenticated = () => !!localStorage.getItem("x-api-key");
  const location = useLocation();

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate to="/app/upload" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/app"
        element={
          isAuthenticated() ? (
            <ProtectedOutlet />
          ) : (
            // 👇 Pass current location in state to know where user came from
            <Navigate to="/" replace state={{ from: location.pathname }} />
          )
        }
      >
        <Route index element={<Navigate to="upload" replace />} />
        <Route path="upload" element={<FileUploadPage />} />
        <Route path="car-company" element={<AddCarCompany />} />
        <Route path="car-model" element={<CarModelManager />} />
        <Route path="car-sides" element={<CarSidesManager />} />
        <Route path="car-features" element={<CarFeatures />} />
        <Route path="car-services" element={<CarService />} />
        <Route path="car-preview" element={<CarPreview />} />
      </Route>

      {/* Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
