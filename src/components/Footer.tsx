import { Box, Container, Divider, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* DARE to be different message */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center",
          py: 3,
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            backgroundColor: "#6D6D70",
            color: "#ffffff",
            px: 1.5,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {t("auth.dareBadge")}
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            fontSize: "0.875rem",
            color: "#86868b",
            letterSpacing: "-0.01em",
          }}
        >
          {t("auth.dareToBeDifferent")}
        </Typography>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "0.5px solid rgba(0, 0, 0, 0.1)",
          py: { xs: 4, sm: 5 },
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
                alt="mo kumbi"
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
                  letterSpacing: "-0.01em",
                }}
              >
                <Box component="span" sx={{ color: "error.main" }}>
                  mo
                </Box>{" "}
                <Box component="span" sx={{ color: "warning.main" }}>
                  kumbi
                </Box>
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
              © {new Date().getFullYear()} mo kumbi. All rights reserved.
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
    </>
  );
};

export default Footer;
