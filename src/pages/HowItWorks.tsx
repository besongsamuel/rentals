import {
  DirectionsCar,
  ExpandMore,
  Person,
  QuestionAnswer,
  TrendingUp,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const [expandedDriver, setExpandedDriver] = useState<string | false>(false);
  const [expandedOwner, setExpandedOwner] = useState<string | false>(false);

  const handleDriverChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedDriver(isExpanded ? panel : false);
    };

  const handleOwnerChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedOwner(isExpanded ? panel : false);
    };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "transparent", py: 6 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 400,
              mb: 3,
              fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
              color: "#1D1D1F",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {t("howItWorks.title")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: "#86868B",
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
              letterSpacing: "-0.01em",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            {t("howItWorks.subtitle")}
          </Typography>
        </Box>

        {/* Quick Overview Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #007AFF 0%, #0056CC 100%)",
                color: "white",
                borderRadius: 3,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(0, 122, 255, 0.3)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Person sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {t("howItWorks.forDrivers")}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  {t("howItWorks.driverOverview")}
                </Typography>
                <Chip
                  label={t("howItWorks.weeklyReports")}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #34C759 0%, #28A745 100%)",
                color: "white",
                borderRadius: 3,
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(52, 199, 89, 0.3)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <DirectionsCar sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {t("howItWorks.forOwners")}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  {t("howItWorks.ownerOverview")}
                </Typography>
                <Chip
                  label={t("howItWorks.fleetManagement")}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Driver FAQ Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Person sx={{ fontSize: 32, color: "#007AFF", mr: 2 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              {t("howItWorks.driverFAQs")}
            </Typography>
          </Box>

          <Accordion
            expanded={expandedDriver === "driver1"}
            onChange={handleDriverChange("driver1")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.driverQ1")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.driverA1")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedDriver === "driver2"}
            onChange={handleDriverChange("driver2")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.driverQ2")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.driverA2")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedDriver === "driver3"}
            onChange={handleDriverChange("driver3")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.driverQ3")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.driverA3")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedDriver === "driver4"}
            onChange={handleDriverChange("driver4")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.driverQ4")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.driverA4")}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Owner FAQ Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <DirectionsCar sx={{ fontSize: 32, color: "#34C759", mr: 2 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              {t("howItWorks.ownerFAQs")}
            </Typography>
          </Box>

          <Accordion
            expanded={expandedOwner === "owner1"}
            onChange={handleOwnerChange("owner1")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.ownerQ1")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.ownerA1")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedOwner === "owner2"}
            onChange={handleOwnerChange("owner2")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.ownerQ2")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.ownerA2")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedOwner === "owner3"}
            onChange={handleOwnerChange("owner3")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.ownerQ3")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.ownerA3")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedOwner === "owner4"}
            onChange={handleOwnerChange("owner4")}
            sx={{
              mb: 2,
              borderRadius: 2,
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                "&.Mui-expanded": {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t("howItWorks.ownerQ4")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {t("howItWorks.ownerA4")}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Transparency & Trust Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <TrendingUp sx={{ fontSize: 32, color: "#FF9500", mr: 2 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              {t("howItWorks.transparencyTitle")}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1D1D1F" }}
                  >
                    {t("howItWorks.honestyTitle")}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {t("howItWorks.honestyDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1D1D1F" }}
                  >
                    {t("howItWorks.verificationTitle")}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {t("howItWorks.verificationDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Statistics Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <QuestionAnswer sx={{ fontSize: 32, color: "#AF52DE", mr: 2 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
              }}
            >
              {t("howItWorks.statisticsTitle")}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1D1D1F" }}
                  >
                    {t("howItWorks.ownerStatsTitle")}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {t("howItWorks.ownerStatsDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1D1D1F" }}
                  >
                    {t("howItWorks.driverStatsTitle")}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {t("howItWorks.driverStatsDescription")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
