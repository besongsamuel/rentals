import { Box, Container, Divider, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(226, 232, 240, 0.3)",
        boxShadow:
          "0 -1px 3px rgba(0, 0, 0, 0.05), 0 -1px 2px rgba(0, 0, 0, 0.1)",
        py: { xs: 4, sm: 5 },
        mt: 6,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(46, 125, 50, 0.3) 50%, transparent 100%)",
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Logo and Brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1,
            }}
          >
            <Box
              component="img"
              src="/app_logo_small.png"
              alt="ko kumba Logo"
              sx={{
                height: "32px",
                width: "auto",
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                background: "linear-gradient(135deg, #2e7d32 0%, #d32f2f 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ko kumba
            </Typography>
          </Box>

          <Divider
            sx={{
              width: "100%",
              maxWidth: 200,
              borderColor: "rgba(226, 232, 240, 0.5)",
            }}
          />

          {/* Copyright */}
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            © {new Date().getFullYear()} ko kumba. All rights
            reserved.
          </Typography>

          {/* Tagline */}
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              fontWeight: 400,
              opacity: 0.6,
              fontStyle: "italic",
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
