import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SkeletonLoader from "./components/SkeletonLoader";
import { UserProvider, useUserContext } from "./contexts/UserContext";
import CarDetailManagement from "./pages/CarDetailManagement";
import CarForm from "./pages/CarForm";
import CarReports from "./pages/CarReports";
import Dashboard from "./pages/Dashboard";
import LoginForm from "./pages/LoginForm";
import ProfileCompletion from "./pages/ProfileCompletion";
import SignUpForm from "./pages/SignUpForm";
import theme from "./theme";

function AppContent() {
  const { user, profile, loading, profileLoading } = useUserContext();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Show loading while checking authentication state
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <SkeletonLoader variant="form" />
        </Box>
      </ThemeProvider>
    );
  }

  // User is authenticated
  if (user) {
    // Show loading while checking profile
    if (profileLoading) {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Header />
            <Box sx={{ flexGrow: 1, bgcolor: "background.default" }}>
              <SkeletonLoader variant="dashboard" />
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      );
    }

    // User is authenticated but doesn't have a profile in the profiles table
    // This means they need to complete their profile
    if (!profile) {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Header />
            <Box sx={{ flexGrow: 1, bgcolor: "background.default" }}>
              <ProfileCompletion />
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      );
    }

    // User is authenticated and has a complete profile, show dashboard with routing
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cars/new" element={<CarForm />} />
                <Route path="/cars/:carId" element={<CarDetailManagement />} />
                <Route path="/cars/:carId/edit" element={<CarForm />} />
                <Route path="/cars/:carId/reports" element={<CarReports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    );
  }

  // User is not authenticated, show login/signup page
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {isLoginMode ? (
          <LoginForm onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <SignUpForm onToggleMode={() => setIsLoginMode(true)} />
        )}
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
