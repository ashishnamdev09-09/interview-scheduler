import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Users } from "./pages/Users";
import { Interviews } from "./pages/Interviews";
import { ScheduleMeeting } from "./pages/ScheduleMeeting";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: "100vh", position: "relative" }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="users" element={<Users />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="schedule" element={<ScheduleMeeting />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
