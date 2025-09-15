import { Box, Container, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        py: 3,
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          © {new Date().getFullYear()} Aftermath Technologies. All rights
          reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
