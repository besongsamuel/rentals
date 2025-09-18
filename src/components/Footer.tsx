import { Box, Container, Divider, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "0.5px solid rgba(0, 0, 0, 0.1)",
        py: { xs: 4, sm: 5 },
        mt: 6,
        maxWidth: "1200px",
        mx: "auto",
        width: "100%",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Logo and Brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              component="img"
              src="/app_logo_small.png"
              alt="ko kumba"
              sx={{
                height: "24px",
                width: "auto",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              ko kumba
            </Typography>
          </Box>

          <Divider
            sx={{
              width: "100%",
              maxWidth: 200,
              borderColor: "rgba(0, 0, 0, 0.1)",
            }}
          />

          {/* Copyright */}
          <Typography
            variant="body2"
            align="center"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontWeight: 400,
              color: "#86868B",
              letterSpacing: "-0.01em",
            }}
          >
            © {new Date().getFullYear()} ko kumba. All rights reserved.
          </Typography>

          {/* Tagline */}
          <Typography
            variant="body2"
            align="center"
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              fontWeight: 400,
              color: "#86868B",
              letterSpacing: "-0.01em",
              opacity: 0.8,
            }}
          >
            Empowering car owners and drivers to maximize their earnings
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
