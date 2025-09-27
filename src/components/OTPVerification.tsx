import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface OTPVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerify,
  onResend,
  onBack,
  loading = false,
  error,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Start cooldown timer
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      await onVerify(otpString);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendCooldown(60); // 60 seconds cooldown
    try {
      await onResend();
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

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
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: "#1D1D1F",
              mb: 2,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            {t("auth.verifyPhone")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            {t("auth.otpSentTo")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: "#007AFF",
              fontFamily: "monospace",
            }}
          >
            {phoneNumber}
          </Typography>
        </Box>

        {/* OTP Input */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          {otp.map((digit, index) => (
            <Box
              key={index}
              component="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              ref={(el) => {
                inputRefs.current[index] = el as HTMLInputElement;
              }}
              sx={{
                width: { xs: 40, sm: 50 },
                height: { xs: 50, sm: 60 },
                textAlign: "center",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                fontWeight: 600,
                border: "2px solid",
                borderColor: error ? "#d32f2f" : "rgba(0, 0, 0, 0.23)",
                borderRadius: 2,
                backgroundColor: "#ffffff",
                color: "#1D1D1F",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                "&:focus": {
                  borderColor: error ? "#d32f2f" : "#007AFF",
                  boxShadow: `0 0 0 3px ${
                    error ? "rgba(211, 47, 47, 0.1)" : "rgba(0, 122, 255, 0.1)"
                  }`,
                },
                "&:hover": {
                  borderColor: error ? "#d32f2f" : "rgba(0, 0, 0, 0.87)",
                },
              }}
            />
          ))}
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="body2"
              color="error"
              sx={{
                backgroundColor: "rgba(211, 47, 47, 0.1)",
                padding: 2,
                borderRadius: 2,
                border: "1px solid rgba(211, 47, 47, 0.2)",
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Verify Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleVerify}
          disabled={!isOtpComplete || loading}
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
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              {t("auth.verifying")}
            </Box>
          ) : (
            t("auth.verify")
          )}
        </Button>

        {/* Resend OTP */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("auth.didntReceiveCode")}
          </Typography>
          <Button
            variant="text"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            sx={{
              color: "#007AFF",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 122, 255, 0.04)",
              },
              "&:disabled": {
                color: "rgba(0, 0, 0, 0.26)",
              },
            }}
          >
            {resendLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                {t("auth.sending")}
              </Box>
            ) : resendCooldown > 0 ? (
              `${t("auth.resendIn")} ${resendCooldown}s`
            ) : (
              t("auth.resendCode")
            )}
          </Button>
        </Box>

        {/* Back Button */}
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="text"
            onClick={onBack}
            disabled={loading}
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            {t("auth.backToLogin")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;
