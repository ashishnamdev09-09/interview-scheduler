import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { VideoCall as VideoCallIcon } from "@mui/icons-material";
import { Interview } from "../types";
import { interviewService, googleMeetService } from "../services/api";

export const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
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

  const loadInterviews = async () => {
    setLoading(true);
    try {
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
          const data = JSON.parse(error.response.data);
          setAuthUrl(data.authUrl);
          setOpenAuthDialog(true);
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
        return "primary";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "interviewer",
      headerName: "Interviewer",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value.username}</Typography>
          <Typography variant="caption" color="textSecondary">
            {params.value.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "interviewee",
      headerName: "Candidate",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value.username}</Typography>
          <Typography variant="caption" color="textSecondary">
            {params.value.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "dateTime",
      headerName: "Date & Time",
      width: 200,
      valueFormatter: ({ value }) => new Date(value as string).toLocaleString(),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value as string)}
          size="small"
        />
      ),
    },
    {
      field: "googleMeetLink",
      headerName: "Meet Link",
      width: 200,
      renderCell: (params) =>
        params.value ? (
          <Button
            variant="outlined"
            size="small"
            startIcon={<VideoCallIcon />}
            href={params.value as string}
            target="_blank"
          >
            Join Meeting
          </Button>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No link available
          </Typography>
        ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Interviews</Typography>
        <Button
          variant="contained"
          onClick={handleOpenDialog}
          disabled={scheduling}
        >
          Schedule Random Pair
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={interviews}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[10]}
                autoHeight
              />
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Schedule Random Pair Interview</DialogTitle>
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
            label="Date & Time"
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

      <Dialog open={openAuthDialog} onClose={() => setOpenAuthDialog(false)}>
        <DialogTitle>Google Calendar Authorization Required</DialogTitle>
        <DialogContent>
          <Typography>
            This application needs permission to access your Google Calendar to
            schedule interviews and create Google Meet links.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Please click the button below to authorize the application. You will
            be redirected to Google's consent screen.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuthDialog(false)}>Cancel</Button>
          <Button onClick={handleAuthClick} variant="contained" color="primary">
            Authorize Google Calendar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {error ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        ) : (
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            {success}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};
