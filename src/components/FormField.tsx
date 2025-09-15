import { TextField, TextFieldProps } from "@mui/material";
import React from "react";

interface FormFieldProps extends Omit<TextFieldProps, "fullWidth"> {
  fullWidth?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  fullWidth = true,
  margin = "normal",
  ...props
}) => {
  return <TextField fullWidth={fullWidth} margin={margin} {...props} />;
};

export default FormField;


