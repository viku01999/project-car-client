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
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

interface FileData {
  _id: string;
  filename: string;
  mimetype: string;
  filePath: string;
  category: string;
  pathType: string;
  timestamp: string;
}

const dropdownOptions = ["logo", "model", "side", "other"];

const FileUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState("");
  const [category, setCategory] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);

  // Hosted file input
  const [hostedFilename, setHostedFilename] = useState("");
  const [hostedMimetype, setHostedMimetype] = useState("");
  const [hostedFilePath, setHostedFilePath] = useState("");
  const [hostedCategory, setHostedCategory] = useState("");
  const [hostedLoading, setHostedLoading] = useState(false);

  // -------------------------------
  // FETCH FILES FUNCTION (used everywhere)
  // -------------------------------
  const fetchFiles = async () => {
    try {
      const res = await api.get("/api/v1/file-details");
      if (res.data.success) setUploadedFiles(res.data.data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    fetchFiles(); // fetch initial table
  }, []);

  // -------------------------------
  // UPLOAD FILE
  // -------------------------------
  const handleUpload = async () => {
    if (!file || !folder || !category)
      return alert("Please fill all fields");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await api.post(
        `/api/v1/upload?folder=${folder}&category=${category}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        await fetchFiles(); // refresh table
        setFile(null);
        setFolder("");
        setCategory("");
      } else alert(res.data.message || "Upload failed");
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // ADD HOSTED FILE
  // -------------------------------
  const handleAddHostedFile = async () => {
    if (!hostedFilename || !hostedMimetype || !hostedFilePath || !hostedCategory)
      return alert("Please fill all fields");

    setHostedLoading(true);
    try {
      const res = await api.post("/api/v1/file-details", {
        filename: hostedFilename,
        mimetype: hostedMimetype,
        filePath: hostedFilePath,
        category: hostedCategory,
      });

      if (res.data.success) {
        await fetchFiles(); // refresh table
        setHostedFilename("");
        setHostedMimetype("");
        setHostedFilePath("");
        setHostedCategory("");
      } else alert(res.data.message || "Failed to add hosted file");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add hosted file");
    } finally {
      setHostedLoading(false);
    }
  };

  // -------------------------------
  // RENDER COMPONENT
  // -------------------------------
  return (
    <Box>
      <Typography variant="h5" mb={2}>
        File Upload
      </Typography>

      {/* Upload Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Folder Dropdown */}
          <TextField
            select
            label="Folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            sx={{ flex: "1 1 150px" }}
          >
            {dropdownOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>

          {/* Category Dropdown */}
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ flex: "1 1 150px" }}
          >
            {dropdownOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>

          {/* File picker */}
          <Box
            onClick={() => document.getElementById("fileInput")?.click()}
            sx={{
              flex: "2 1 200px",
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 1,
              px: 1,
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            {file ? file.name : "Choose file"}
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            sx={{ flex: "0 0 auto", height: 40 }}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </Box>
      </Paper>

      {/* Hosted File Form */}
      <Typography variant="h6" mb={1}>
        Add Hosted File URL
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Filename"
            value={hostedFilename}
            onChange={(e) => setHostedFilename(e.target.value)}
            sx={{ flex: "1 1 150px" }}
          />

          <TextField
            label="MIME Type"
            value={hostedMimetype}
            onChange={(e) => setHostedMimetype(e.target.value)}
            sx={{ flex: "1 1 150px" }}
          />

          <TextField
            label="File URL"
            value={hostedFilePath}
            onChange={(e) => setHostedFilePath(e.target.value)}
            sx={{ flex: "2 1 250px" }}
          />

          {/* Hosted Category Dropdown */}
          <TextField
            select
            label="Category"
            value={hostedCategory}
            onChange={(e) => setHostedCategory(e.target.value)}
            sx={{ flex: "1 1 150px" }}
          >
            {dropdownOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            onClick={handleAddHostedFile}
            disabled={hostedLoading}
            sx={{ flex: "0 0 auto", height: 40 }}
          >
            {hostedLoading ? "Adding..." : "Add"}
          </Button>
        </Box>
      </Paper>

      {/* Uploaded Files Table */}
      {uploadedFiles.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Filename</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>MIME Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>File Path</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Path Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Preview</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uploadedFiles.map((f) => (
                <TableRow key={f._id}>
                  <TableCell>{f._id}</TableCell>
                  <TableCell>{f.filename}</TableCell>
                  <TableCell>{f.mimetype}</TableCell>
                  <TableCell>{f.filePath}</TableCell>
                  <TableCell>{f.category}</TableCell>
                  <TableCell>{f.pathType}</TableCell>
                  <TableCell>{new Date(f.timestamp).toLocaleString()}</TableCell>

                  <TableCell>
                    {f.mimetype?.startsWith("image/") ? (
                      <img
                        src={f.filePath}
                        alt={f.filename}
                        style={{ maxWidth: 100, maxHeight: 80 }}
                      />
                    ) : (
                      <a
                        href={f.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    )}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FileUploadPage;
