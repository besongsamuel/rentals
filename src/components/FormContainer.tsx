import { Container, Paper } from "@mui/material";
import React from "react";

interface FormContainerProps {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  maxWidth = "sm",
}) => {
  return (
    <Container component="main" maxWidth={maxWidth}>
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};

export default FormContainer;


