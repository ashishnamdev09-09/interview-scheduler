import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./utils/theme";
import { Layout } from "./components/Layout";
import { Users } from "./pages/Users";
import { Interviews } from "./pages/Interviews";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/users" element={<Users />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/" element={<Navigate to="/interviews" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
