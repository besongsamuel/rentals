import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import HowItWorksCards from "../components/HowItWorksCards";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useUserContext } from "../contexts/UserContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useUserContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        {/* How It Works Cards */}
        <HowItWorksCards />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: { xs: 3, sm: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              position: "relative",
            }}
          >
            {/* Language Switcher */}
            <Box
              sx={{
                position: "absolute",
                top: { xs: 16, sm: 20 },
                right: { xs: 16, sm: 20 },
              }}
            >
              <LanguageSwitcher />
            </Box>
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Box
                component="img"
                src="/app_logo.png"
                alt="Aftermath Car Management Logo"
                sx={{
                  height: "64px",
                  width: "auto",
                  display: "block",
                }}
              />
            </Box>

            <Typography
              component="h1"
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 1,
              }}
            >
              {t("auth.login")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 2, fontWeight: 500 }}
            >
              {t("auth.welcomeMessage")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              {t("auth.welcomeSubtitle")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              {t("auth.signIn")} to your account
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t("auth.email")}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("auth.password")}
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
                disabled={loading}
              >
                {loading ? t("common.loading") : t("auth.signIn")}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2">
                  {t("auth.noAccount")}{" "}
                  <Button
                    variant="text"
                    onClick={() =>
                      navigate("/login", { state: { mode: "signup" } })
                    }
                    sx={{ textTransform: "none" }}
                  >
                    {t("auth.signUp")}
                  </Button>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginForm;
