import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { VideoCall as VideoCallIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { User } from "../types";
import {
  userService,
  interviewService,
  googleMeetService,
} from "../services/api";
import PageTransition from "../components/PageTransition";
import { useNavigate } from "react-router-dom";
import { SelectChangeEvent } from "@mui/material/Select";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export const ScheduleMeeting: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
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
    scheduledTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
    interviewerId: "",
    intervieweeId: "",
  });
  const navigate = useNavigate();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Failed to load users. Please try again.");
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
    loadUsers();
    checkAuthStatus();
  }, []);

  const handleOpenDialog = () => {
    // Set default scheduled time to 1 hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const formattedDate = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM

    setFormData({
      title: "Technical Interview",
      description: "Interview session",
      scheduledTime: formattedDate,
      interviewerId: "",
      intervieweeId: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleScheduleMeeting = async () => {
    if (!formData.interviewerId || !formData.intervieweeId) {
      setError("Please select both interviewer and interviewee");
      return;
    }

    if (formData.interviewerId === formData.intervieweeId) {
      setError("Interviewer and interviewee cannot be the same person");
      return;
    }

    setScheduling(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await interviewService.scheduleManual(
        formData.title,
        formData.description,
        formData.scheduledTime,
        parseInt(formData.interviewerId),
        parseInt(formData.intervieweeId)
      );
      console.log("Schedule response:", response);
      setSuccess("Meeting scheduled successfully!");
      handleCloseDialog();
      setTimeout(() => {
        navigate("/interviews");
      }, 2000);
    } catch (error: any) {
      console.error("Error scheduling meeting:", error);
      if (error.response?.status === 401) {
        checkAuthStatus();
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to schedule meeting. Please try again."
        );
      }
    } finally {
      setScheduling(false);
    }
  };

  const handleAuthClick = () => {
    window.open(authUrl, "_blank");
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleScheduleMeeting();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Schedule Interview
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
          >
            Schedule a new interview by filling out the details below
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            maxWidth: 800,
            mx: "auto",
            "& .MuiTextField-root, & .MuiFormControl-root": {
              mb: 3,
              "& .MuiOutlinedInput-root": {
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(99, 102, 241, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6366f1",
                },
              },
            },
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interview Title"
                name="title"
                value={formData.title}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date and Time"
                name="scheduledTime"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={handleTextChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Interviewer</InputLabel>
                <Select
                  name="interviewerId"
                  value={formData.interviewerId}
                  onChange={handleChange}
                  label="Interviewer"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Interviewee</InputLabel>
                <Select
                  name="intervieweeId"
                  value={formData.intervieweeId}
                  onChange={handleChange}
                  label="Interviewee"
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                color: "white",
                px: 4,
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                },
              }}
            >
              Schedule Interview
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};
