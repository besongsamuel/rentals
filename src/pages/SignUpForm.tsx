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
import { useNavigate } from "react-router-dom";
import EmailVerificationMessage from "../components/EmailVerificationMessage";
import Header from "../components/Header";
import { useUserContext } from "../contexts/UserContext";

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useUserContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("errors.passwordMismatch"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("errors.password"));
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(t("auth.signupSuccess"));
    }

    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          py: 4,
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
          }}
        >
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
            {t("auth.signup")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 3, fontWeight: 500 }}
          >
            {t("auth.signupWelcome")}
          </Typography>

          <Box
            sx={{
              mb: 4,
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              align="left"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              {t("auth.chooseRole")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="left"
              sx={{ mb: 1 }}
            >
              • <strong>{t("auth.driverSignup")}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" align="left">
              • <strong>{t("auth.ownerSignup")}</strong>
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && <EmailVerificationMessage email={email} />}

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={t("errors.password")}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t("auth.confirmPassword")}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? t("common.loading") : t("auth.signUp")}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                {t("auth.hasAccount")}{" "}
                <Button
                  variant="text"
                  onClick={() =>
                    navigate("/login", { state: { mode: "login" } })
                  }
                  sx={{ textTransform: "none" }}
                >
                  {t("auth.signIn")}
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUpForm;
