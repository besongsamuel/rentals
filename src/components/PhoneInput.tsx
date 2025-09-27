import { Box, Typography } from "@mui/material";
import React from "react";
import { PhoneInput as ReactPhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label = "Phone Number",
  error = false,
  helperText,
  disabled = false,
  required = false,
  placeholder = "Enter phone number",
}) => {
  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: error ? "#d32f2f" : "rgba(0, 0, 0, 0.6)",
            fontWeight: 500,
          }}
        >
          {label} {required && "*"}
        </Typography>
      )}
      <ReactPhoneInput
        value={value}
        onChange={onChange}
        defaultCountry="cm"
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
        }}
        inputStyle={{
          width: "100%",
          padding: "16px",
          border: `1px solid ${error ? "#d32f2f" : "rgba(0, 0, 0, 0.23)"}`,
          borderRadius: "8px",
          fontSize: "16px",
          outline: "none",
          transition: "border-color 0.2s ease-in-out",
          backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
        }}
        countrySelectorStyleProps={{
          buttonStyle: {
            border: `1px solid ${error ? "#d32f2f" : "rgba(0, 0, 0, 0.23)"}`,
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
            backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
          },
        }}
      />
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            color: error ? "#d32f2f" : "rgba(0, 0, 0, 0.6)",
            fontSize: "0.75rem",
            mt: 1,
            display: "block",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default PhoneInput;
