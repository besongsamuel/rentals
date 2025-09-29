import {
  Edit,
  LocationOn,
  School,
  Work,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DriverDetails } from "../types";

interface DriverDetailProps {
  driverDetails: DriverDetails | null;
}

const DriverDetail: React.FC<DriverDetailProps> = ({ driverDetails }) => {
  const { t } = useTranslation();

  return (
    <Card elevation={1} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
            <School />
          </Avatar>
          <Typography variant="h6">
            {t("dashboard.driverDetails")}
          </Typography>
        </Box>

        <Box sx={{ pl: 7 }}>
          {driverDetails ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Work
                  sx={{
                    mr: 1,
                    fontSize: 16,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.experience")}:{" "}
                  <strong>
                    {driverDetails.years_of_experience || 0}{" "}
                    {t("dashboard.years")}
                  </strong>
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <School
                  sx={{
                    mr: 1,
                    fontSize: 16,
                    color: "text.secondary",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.licenseNumber")}:{" "}
                  <strong>
                    {driverDetails.license_number ||
                      t("dashboard.notProvided")}
                  </strong>
                </Typography>
              </Box>

              {driverDetails.languages &&
                driverDetails.languages.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
                      Languages:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}
                    >
                      {driverDetails.languages.map(
                        (lang, index) => (
                          <Chip
                            key={index}
                            label={lang}
                            size="small"
                            variant="outlined"
                          />
                        )
                      )}
                    </Box>
                  </Box>
                )}

              {driverDetails.city && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocationOn
                    sx={{
                      mr: 1,
                      fontSize: 16,
                      color: "text.secondary",
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Location:{" "}
                    <strong>
                      {driverDetails.city}
                      {driverDetails.state_province
                        ? `, ${driverDetails.state_province}`
                        : ""}
                    </strong>
                  </Typography>
                </Box>
              )}

              {/* Update Button */}
              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  component={Link}
                  to="/profile"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderColor: "#007AFF",
                    color: "#007AFF",
                    "&:hover": {
                      backgroundColor: "rgba(0, 122, 255, 0.05)",
                      borderColor: "#0056CC",
                      color: "#0056CC",
                    },
                  }}
                >
                  {t("dashboard.updateDriverDetails")}
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {t("dashboard.driverDetailsNotCompleted")}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{
                    fontWeight: 500,
                    mb: 1,
                    fontSize: "0.9rem",
                  }}
                >
                  💡 {t("dashboard.driverDetailsTip")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    fontSize: "0.8rem",
                    lineHeight: 1.4,
                  }}
                >
                  {t("dashboard.driverDetailsTipDescription")}
                </Typography>
              </Box>

              <Chip
                label={t("dashboard.completeProfile")}
                color="primary"
                component={Link}
                to="/profile"
                clickable
                sx={{ textDecoration: "none" }}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DriverDetail;

