import { Alert, AlertProps } from "@mui/material";
import React from "react";

interface ErrorAlertProps extends AlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  severity = "error",
  sx = { mb: 2 },
  ...props
}) => {
  if (!message) return null;

  return (
    <Alert severity={severity} sx={sx} {...props}>
      {message}
    </Alert>
  );
};

export default ErrorAlert;


