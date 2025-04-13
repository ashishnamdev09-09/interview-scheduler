import React, { useEffect, useState, forwardRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  PaperProps,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { VideoCall as VideoCallIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Interview } from "../types";
import { interviewService, googleMeetService } from "../services/api";
import PageTransition from "../components/PageTransition";
import AnimatedCard from "../components/AnimatedCard";
import { useNavigate } from "react-router-dom";
import { AddIcon } from "../components/icons/AddIcon";

// Create an animated Paper component for the Dialog
const AnimatedPaper = forwardRef<HTMLDivElement, PaperProps>((props, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Paper {...props} />
    </motion.div>
  );
});

export const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [authUrl, setAuthUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledTime: "",
  });
  const navigate = useNavigate();

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getAll();
      setInterviews(response.data);
      setError(null);
    } catch (error) {
      console.error("Error loading interviews:", error);
      setError("Failed to load interviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      await googleMeetService.checkAuthStatus();
      setOpenAuthDialog(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          const data =
            typeof error.response.data === "string"
              ? JSON.parse(error.response.data)
              : error.response.data;

          if (data && data.authUrl) {
            setAuthUrl(data.authUrl);
            setOpenAuthDialog(true);
          } else {
            console.error("Auth URL not found in response:", data);
          }
        } catch (e) {
          console.error("Error parsing auth URL:", e);
        }
      }
    }
  };

  useEffect(() => {
    loadInterviews();
    checkAuthStatus();
  }, []);

  const handleOpenDialog = () => {
    // Set default scheduled time to 1 hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const formattedDate = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM

    setFormData({
      title: "Technical Interview",
      description: "Interview session with a random pair of users",
      scheduledTime: formattedDate,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleScheduleRandomPair = async () => {
    setScheduling(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await interviewService.scheduleRandomPair(
        formData.title,
        formData.description,
        formData.scheduledTime
      );
      console.log("Schedule response:", response);
      setSuccess("Interview scheduled successfully!");
      handleCloseDialog();
      loadInterviews(); // Refresh the list
    } catch (error: any) {
      console.error("Error scheduling random pair:", error);
      if (error.response?.status === 401) {
        checkAuthStatus();
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to schedule interview. Please try again."
        );
      }
    } finally {
      setScheduling(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleAuthClick = () => {
    window.open(authUrl, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "#6366f1";
      case "COMPLETED":
        return "#10b981";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#6366f1";
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "title", headerName: "Title", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    {
      field: "scheduledTime",
      headerName: "Date & Time",
      width: 200,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleString();
      },
    },
    {
      field: "interviewer",
      headerName: "Interviewer",
      width: 200,
      valueGetter: (params) => params.row.interviewer?.username || "N/A",
    },
    {
      field: "interviewee",
      headerName: "Candidate",
      width: 200,
      valueGetter: (params) => params.row.interviewee?.username || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            background: `${getStatusColor(params.value)}20`,
            color: getStatusColor(params.value),
            border: `1px solid ${getStatusColor(params.value)}40`,
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Join",
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Join Meeting">
          <IconButton
            size="small"
            sx={{
              color: "primary.main",
              "&:hover": {
                background: "rgba(99, 102, 241, 0.1)",
              },
            }}
          >
            <VideoCallIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <PageTransition>
      <Box sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 4,
            }}
          >
            Interviews
          </Typography>

          <Box
            sx={{
              height: 600,
              width: "100%",
              "& .MuiDataGrid-root": {
                border: "none",
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
              },
              "& .MuiDataGrid-cell": {
                borderColor: "rgba(255, 255, 255, 0.1)",
              },
              "& .MuiDataGrid-columnHeaders": {
                background: "rgba(99, 102, 241, 0.1)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              },
              "& .MuiDataGrid-row:hover": {
                background: "rgba(99, 102, 241, 0.05)",
              },
            }}
          >
            <DataGrid
              rows={interviews}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[10]}
              disableRowSelectionOnClick
              loading={loading}
            />
          </Box>
        </Paper>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          PaperComponent={AnimatedPaper}
        >
          <DialogTitle>Schedule Random Interview</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Scheduled Time"
              type="datetime-local"
              fullWidth
              value={formData.scheduledTime}
              onChange={(e) =>
                setFormData({ ...formData, scheduledTime: e.target.value })
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleScheduleRandomPair}
              variant="contained"
              disabled={scheduling}
            >
              {scheduling ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openAuthDialog}
          onClose={() => setOpenAuthDialog(false)}
          PaperComponent={AnimatedPaper}
        >
          <DialogTitle>Google Calendar Authorization Required</DialogTitle>
          <DialogContent>
            <Typography>
              To schedule interviews with Google Meet links, you need to
              authorize the application to access your Google Calendar.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAuthDialog(false)}>Cancel</Button>
            <Button onClick={handleAuthClick} variant="contained">
              Authorize
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!error || !!success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={error ? "error" : "success"}
            sx={{ width: "100%" }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Box>
    </PageTransition>
  );
};
