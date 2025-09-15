import { Alert, Box, Divider, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface EmailVerificationMessageProps {
  email: string;
}

const EmailVerificationMessage: React.FC<EmailVerificationMessageProps> = ({
  email,
}) => {
  const { t } = useTranslation();

  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <Box>
        <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1 }}>
          {t("auth.signupSuccess")}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>{t("auth.nextSteps")}:</strong>
        </Typography>

        <Box component="ol" sx={{ pl: 2, m: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            {t("auth.checkEmail", { email })}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            {t("auth.clickVerificationLink")}
          </Typography>
          <Typography component="li" variant="body2">
            {t("auth.completeProfileAfterVerification")}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          {t("auth.emailNotReceived")}
        </Typography>
      </Box>
    </Alert>
  );
};

export default EmailVerificationMessage;
