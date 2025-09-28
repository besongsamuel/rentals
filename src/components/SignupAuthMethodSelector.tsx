import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
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
  onGoogleSignup: () => Promise<void>;
  onFacebookSignup: () => Promise<void>;
  onMagicLinkSignup: (email: string) => Promise<void>;
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
  onGoogleSignup,
  onFacebookSignup,
  onMagicLinkSignup,
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkMessage, setMagicLinkMessage] = useState("");
  const [magicLinkDialogOpen, setMagicLinkDialogOpen] = useState(false);

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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setAuthError("");
    try {
      await onGoogleSignup();
    } catch (error: any) {
      setAuthError(error.message || t("auth.googleSignupError"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setFacebookLoading(true);
    setAuthError("");
    try {
      await onFacebookSignup();
    } catch (error: any) {
      setAuthError(error.message || t("auth.facebookSignupError"));
    } finally {
      setFacebookLoading(false);
    }
  };

  const handleMagicLinkSignup = async () => {
    if (!magicLinkEmail.trim()) {
      setAuthError(t("auth.enterEmailForMagicLink"));
      return;
    }

    setMagicLinkLoading(true);
    setAuthError("");
    setMagicLinkMessage("");
    try {
      await onMagicLinkSignup(magicLinkEmail);
      setMagicLinkMessage(t("auth.magicLinkSent"));
    } catch (error: any) {
      setAuthError(error.message || t("auth.magicLinkError"));
    } finally {
      setMagicLinkLoading(false);
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
                mb: 4,
                "&:hover": {
                  bgcolor: "#0056CC",
                  boxShadow: "0 6px 16px rgba(0, 122, 255, 0.4)",
                },
              }}
            >
              {t("auth.continue")}
            </Button>

            {/* Social Authentication Options */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  color: "#86868b",
                  mb: 3,
                  fontSize: "0.875rem",
                  fontWeight: 400,
                }}
              >
                {t("auth.orContinueWith")}
              </Typography>

              {/* Google Signup Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleSignup}
                disabled={
                  googleLoading ||
                  loading ||
                  facebookLoading ||
                  magicLinkLoading
                }
                startIcon={<GoogleIcon />}
                sx={{
                  py: 2,
                  mb: 2,
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  borderColor: "#dadce0",
                  color: "#3c4043",
                  borderRadius: 2,
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                    borderColor: "#dadce0",
                    boxShadow:
                      "0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)",
                  },
                  "&:disabled": {
                    backgroundColor: "#f8f9fa",
                    borderColor: "#dadce0",
                    color: "#9aa0a6",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#4285f4",
                  },
                }}
              >
                {googleLoading
                  ? t("common.loading")
                  : t("auth.continueWithGoogle")}
              </Button>

              {/* Facebook Signup Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleFacebookSignup}
                disabled={
                  facebookLoading ||
                  loading ||
                  googleLoading ||
                  magicLinkLoading
                }
                startIcon={<FacebookIcon />}
                sx={{
                  py: 2,
                  mb: 2,
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  borderColor: "#1877f2",
                  color: "#1877f2",
                  borderRadius: 2,
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#f0f2f5",
                    borderColor: "#1877f2",
                    boxShadow:
                      "0 1px 2px 0 rgba(24,119,242,.3), 0 1px 3px 1px rgba(24,119,242,.15)",
                  },
                  "&:disabled": {
                    backgroundColor: "#f8f9fa",
                    borderColor: "#dadce0",
                    color: "#9aa0a6",
                  },
                }}
              >
                {facebookLoading
                  ? t("common.loading")
                  : t("auth.continueWithFacebook")}
              </Button>

              {/* Magic Link Signup Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setMagicLinkEmail("");
                  setMagicLinkMessage("");
                  setAuthError("");
                  setMagicLinkDialogOpen(true);
                }}
                disabled={
                  magicLinkLoading ||
                  loading ||
                  googleLoading ||
                  facebookLoading
                }
                startIcon={<EmailIcon />}
                sx={{
                  py: 2,
                  mb: 2,
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  borderColor: "#007AFF",
                  color: "#007AFF",
                  borderRadius: 2,
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    backgroundColor: "rgba(0, 122, 255, 0.05)",
                    borderColor: "#007AFF",
                    boxShadow:
                      "0 1px 2px 0 rgba(0,122,255,.3), 0 1px 3px 1px rgba(0,122,255,.15)",
                  },
                  "&:disabled": {
                    backgroundColor: "#f8f9fa",
                    borderColor: "#dadce0",
                    color: "#9aa0a6",
                  },
                }}
              >
                {t("auth.continueWithMagicLink")}
              </Button>

              {/* Magic Link Success Message */}
              {magicLinkMessage && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: "rgba(52, 199, 89, 0.1)",
                      padding: 2,
                      borderRadius: 2,
                      border: "1px solid rgba(52, 199, 89, 0.2)",
                      textAlign: "center",
                      color: "#34c759",
                    }}
                  >
                    {magicLinkMessage}
                  </Typography>
                </Box>
              )}
            </Box>

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

        {/* Magic Link Dialog */}
        <Dialog
          open={magicLinkDialogOpen}
          onClose={() => setMagicLinkDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#1D1D1F",
              pb: 1,
            }}
          >
            {t("auth.continueWithMagicLink")}
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 2 }}>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: "#86868b",
                mb: 3,
                fontSize: "0.875rem",
              }}
            >
              {t("auth.enterEmailForMagicLink")}
            </Typography>

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

            <TextField
              fullWidth
              type="email"
              placeholder={t("auth.email")}
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#007AFF",
                    borderWidth: "2px",
                  },
                },
              }}
            />

            {magicLinkMessage && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    backgroundColor: "rgba(52, 199, 89, 0.1)",
                    padding: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(52, 199, 89, 0.2)",
                    textAlign: "center",
                    color: "#34c759",
                  }}
                >
                  {magicLinkMessage}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setMagicLinkDialogOpen(false);
                setMagicLinkEmail("");
                setMagicLinkMessage("");
                setAuthError("");
              }}
              disabled={magicLinkLoading}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                borderColor: "#86868b",
                color: "#86868b",
                "&:hover": {
                  backgroundColor: "rgba(134, 134, 139, 0.05)",
                  borderColor: "#6d6d70",
                  color: "#6d6d70",
                },
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleMagicLinkSignup}
              disabled={magicLinkLoading || !magicLinkEmail.trim()}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "#007AFF",
                boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
                "&:hover": {
                  backgroundColor: "#0056CC",
                  boxShadow: "0 6px 16px rgba(0, 122, 255, 0.4)",
                },
                "&:disabled": {
                  bgcolor: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              {magicLinkLoading
                ? t("auth.sendingMagicLink")
                : t("auth.sendMagicLink")}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SignupAuthMethodSelector;
