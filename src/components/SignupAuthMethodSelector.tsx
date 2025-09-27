import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import OTPVerification from "./OTPVerification";
import PhoneInput from "./PhoneInput";

interface SignupAuthMethodSelectorProps {
  onEmailSignup: (email: string, password: string) => Promise<void>;
  onPhoneSignup: (phone: string) => Promise<void>;
  onVerifyPhoneOTP: (phone: string, otp: string) => Promise<void>;
  onResendPhoneOTP: (phone: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

type AuthMethod = "email" | "phone";
type AuthStep = "method" | "email" | "phone" | "otp";

const SignupAuthMethodSelector: React.FC<SignupAuthMethodSelectorProps> = ({
  onEmailSignup,
  onPhoneSignup,
  onVerifyPhoneOTP,
  onResendPhoneOTP,
  loading = false,
  error,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [authStep, setAuthStep] = useState<AuthStep>("method");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuthMethod(event.target.value as AuthMethod);
    setAuthError("");
  };

  const handleContinue = () => {
    setAuthError("");
    if (authMethod === "email") {
      setAuthStep("email");
    } else {
      setAuthStep("phone");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setAuthError(t("auth.fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      setAuthError(t("errors.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setAuthError(t("errors.passwordTooShort"));
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      await onEmailSignup(email, password);
    } catch (error: any) {
      setAuthError(error.message || t("auth.signupError"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setAuthError(t("auth.enterPhoneNumber"));
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      await onPhoneSignup(phone);
      setAuthStep("otp");
    } catch (error: any) {
      setAuthError(error.message || t("auth.phoneSignupError"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await onVerifyPhoneOTP(phone, otp);
    } catch (error: any) {
      setAuthError(error.message || t("auth.otpVerificationError"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await onResendPhoneOTP(phone);
    } catch (error: any) {
      setAuthError(error.message || t("auth.resendError"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBack = () => {
    if (authStep === "otp") {
      setAuthStep("phone");
    } else if (authStep === "email" || authStep === "phone") {
      setAuthStep("method");
    }
    setAuthError("");
  };

  const currentError = error || authError;

  if (authStep === "otp") {
    return (
      <OTPVerification
        phoneNumber={phone}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        onBack={handleBack}
        loading={authLoading}
        error={currentError}
      />
    );
  }

  return (
    <Card
      elevation={3}
      sx={{
        maxWidth: 500,
        width: "100%",
        mx: "auto",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {authStep === "method" && (
          <>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#1D1D1F",
                mb: 2,
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              {t("auth.chooseSignupMethod")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, textAlign: "center" }}
            >
              {t("auth.selectSignupMethodDescription")}
            </Typography>

            <FormControl component="fieldset" sx={{ width: "100%", mb: 4 }}>
              <RadioGroup
                value={authMethod}
                onChange={handleMethodChange}
                sx={{ gap: 2 }}
              >
                <FormControlLabel
                  value="email"
                  control={<Radio sx={{ color: "#007AFF" }} />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("auth.emailPassword")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("auth.emailPasswordSignupDescription")}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: 2,
                    p: 2,
                    m: 0,
                    "&:hover": {
                      backgroundColor: "rgba(0, 122, 255, 0.04)",
                    },
                  }}
                />
                <FormControlLabel
                  value="phone"
                  control={<Radio sx={{ color: "#007AFF" }} />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t("auth.phoneOTP")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("auth.phoneOTPSignupDescription")}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    borderRadius: 2,
                    p: 2,
                    m: 0,
                    "&:hover": {
                      backgroundColor: "rgba(0, 122, 255, 0.04)",
                    },
                  }}
                />
              </RadioGroup>
            </FormControl>

            {currentError && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    backgroundColor: "rgba(211, 47, 47, 0.1)",
                    padding: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(211, 47, 47, 0.2)",
                    textAlign: "center",
                  }}
                >
                  {currentError}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleContinue}
              sx={{
                bgcolor: "#007AFF",
                color: "white",
                fontWeight: 600,
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
                "&:hover": {
                  bgcolor: "#0056CC",
                  boxShadow: "0 6px 16px rgba(0, 122, 255, 0.4)",
                },
              }}
            >
              {t("auth.continue")}
            </Button>
          </>
        )}

        {authStep === "email" && (
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#1D1D1F",
                mb: 2,
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              {t("auth.emailSignup")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, textAlign: "center" }}
            >
              {t("auth.enterEmailPasswordSignup")}
            </Typography>

            <Box component="form" onSubmit={handleEmailSubmit}>
              {currentError && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                      padding: 2,
                      borderRadius: 2,
                      border: "1px solid rgba(211, 47, 47, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    {currentError}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <input
                  type="email"
                  placeholder={t("auth.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "1px solid rgba(0, 0, 0, 0.23)",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s ease-in-out",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007AFF";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0, 0, 0, 0.23)";
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <input
                  type="password"
                  placeholder={t("auth.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "1px solid rgba(0, 0, 0, 0.23)",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s ease-in-out",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007AFF";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0, 0, 0, 0.23)";
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <input
                  type="password"
                  placeholder={t("auth.confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "1px solid rgba(0, 0, 0, 0.23)",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s ease-in-out",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007AFF";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0, 0, 0, 0.23)";
                  }}
                />
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={authLoading}
                sx={{
                  bgcolor: "#007AFF",
                  color: "white",
                  fontWeight: 600,
                  py: 2,
                  mb: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
                  "&:hover": {
                    bgcolor: "#0056CC",
                    boxShadow: "0 6px 16px rgba(0, 122, 255, 0.4)",
                  },
                  "&:disabled": {
                    bgcolor: "rgba(0, 0, 0, 0.12)",
                    color: "rgba(0, 0, 0, 0.26)",
                  },
                }}
              >
                {authLoading ? t("auth.signingUp") : t("auth.signUp")}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="text"
                  onClick={handleBack}
                  disabled={authLoading}
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  {t("auth.back")}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {authStep === "phone" && (
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#1D1D1F",
                mb: 2,
                textAlign: "center",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              {t("auth.phoneSignup")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, textAlign: "center" }}
            >
              {t("auth.enterPhoneNumberSignup")}
            </Typography>

            <Box component="form" onSubmit={handlePhoneSubmit}>
              {currentError && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                      padding: 2,
                      borderRadius: 2,
                      border: "1px solid rgba(211, 47, 47, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    {currentError}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 4 }}>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  label={t("auth.phoneNumber")}
                  placeholder={t("auth.enterPhoneNumber")}
                  error={!!currentError}
                  disabled={authLoading}
                />
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={authLoading || !phone.trim()}
                sx={{
                  bgcolor: "#007AFF",
                  color: "white",
                  fontWeight: 600,
                  py: 2,
                  mb: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
                  "&:hover": {
                    bgcolor: "#0056CC",
                    boxShadow: "0 6px 16px rgba(0, 122, 255, 0.4)",
                  },
                  "&:disabled": {
                    bgcolor: "rgba(0, 0, 0, 0.12)",
                    color: "rgba(0, 0, 0, 0.26)",
                  },
                }}
              >
                {authLoading ? t("auth.sendingOTP") : t("auth.sendOTP")}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="text"
                  onClick={handleBack}
                  disabled={authLoading}
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  {t("auth.back")}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SignupAuthMethodSelector;
