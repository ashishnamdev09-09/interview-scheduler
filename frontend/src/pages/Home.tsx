import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Container,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Users",
      description: "Manage interviewers and candidates",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: "/users",
      color: "#6366f1",
    },
    {
      title: "Interviews",
      description: "View and manage scheduled interviews",
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
      path: "/interviews",
      color: "#ec4899",
    },
    {
      title: "Schedule Meeting",
      description: "Schedule a new interview",
      icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
      path: "/schedule",
      color: "#10b981",
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Welcome to Interview Scheduler
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Streamline your interview process with our modern scheduling
            platform
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <Card
                sx={{
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(item.path)}
                  sx={{ height: "100%" }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      p: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}99 100%)`,
                        mb: 3,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};
