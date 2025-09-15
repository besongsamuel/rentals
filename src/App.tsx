import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SkeletonLoader from "./components/SkeletonLoader";
import { UserProvider, useUserContext } from "./contexts/UserContext";
import CarDetailManagement from "./pages/CarDetailManagement";
import CarForm from "./pages/CarForm";
import Dashboard from "./pages/Dashboard";
import LoginForm from "./pages/LoginForm";
import ProfileCompletion from "./pages/ProfileCompletion";
import SignUpForm from "./pages/SignUpForm";
import theme from "./theme";

function AuthRoutes() {
  const location = useLocation();
  const isSignupMode = location.state?.mode === "signup";

  return isSignupMode ? <SignUpForm /> : <LoginForm />;
}

function AppContent() {
  const { user, profile, loading, profileLoading } = useUserContext();

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {user ? (
          // User is authenticated
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
                {/* Show loading while checking profile */}
                {profileLoading ? (
                  <Route
                    path="*"
                    element={<SkeletonLoader variant="dashboard" />}
                  />
                ) : profile ? (
                  // User is authenticated and has a complete profile
                  <>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cars/new" element={<CarForm />} />
                    <Route
                      path="/cars/:carId"
                      element={<CarDetailManagement />}
                    />
                    <Route path="/cars/:carId/edit" element={<CarForm />} />
                    <Route
                      path="/login"
                      element={<Navigate to="/" replace />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
                ) : (
                  // User is authenticated but doesn't have a profile
                  <Route path="*" element={<ProfileCompletion />} />
                )}
              </Routes>
            </Box>
            <Footer />
          </Box>
        ) : (
          // User is not authenticated, show login/signup pages
          <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Routes>
              <Route path="/login" element={<AuthRoutes />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
        )}
      </Router>
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
