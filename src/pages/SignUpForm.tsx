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
import EmailVerificationMessage from "../components/EmailVerificationMessage";
import { useUserContext } from "../contexts/UserContext";

interface SignUpFormProps {
  onToggleMode: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useUserContext();
  const { t } = useTranslation();

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
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
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
          sx={{ mb: 4 }}
        >
          {t("auth.joinPlatform")}
        </Typography>

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
                onClick={onToggleMode}
                sx={{ textTransform: "none" }}
              >
                {t("auth.signIn")}
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUpForm;
