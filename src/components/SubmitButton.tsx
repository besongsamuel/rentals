import { Button, ButtonProps } from "@mui/material";
import React from "react";

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  loadingText = "Loading...",
  children,
  disabled,
  ...props
}) => {
  return (
    <Button
      type="submit"
      variant="contained"
      fullWidth
      disabled={disabled || loading}
      sx={{ mt: 3, mb: 2 }}
      {...props}
    >
      {loading ? loadingText : children}
    </Button>
  );
};

export default SubmitButton;


