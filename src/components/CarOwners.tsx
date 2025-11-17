import { Add, ExpandMore, PersonRemove } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { carOwnerService } from "../services/carOwnerService";
import { carService } from "../services/carService";
import { Car, CarOwnerWithProfile, Profile } from "../types";
import CarOwnerForm from "./CarOwnerForm";

interface CarOwnersProps {
  currentUser: Profile;
  carId: string;
}

const CarOwners: React.FC<CarOwnersProps> = ({ currentUser, carId }) => {
  const { t } = useTranslation();
  const [car, setCar] = useState<Car | null>(null);
  const [carOwners, setCarOwners] = useState<CarOwnerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
  const [removingOwnerId, setRemovingOwnerId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const isMainOwner = car?.owner_id === currentUser.id;

  const loadData = useCallback(async () => {
    if (!carId) return;

    setLoading(true);
    try {
      const [carData, ownersData] = await Promise.all([
        carService.getCarById(carId),
        carOwnerService.getCarOwnersByCar(carId),
      ]);

      setCar(carData);
      setCarOwners(ownersData || []);
    } catch (error) {
      console.error("Error loading car owners data:", error);
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCarOwner = async (carOwnerData: any) => {
    try {
      await carOwnerService.addCarOwner(carOwnerData);
      setShowAddOwnerDialog(false);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error adding car owner:", error);
      alert(error instanceof Error ? error.message : "Failed to add car owner");
    }
  };

  const handleRemoveCarOwner = async (carOwnerId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this car owner? This action cannot be undone."
      )
    ) {
      return;
    }

    setRemovingOwnerId(carOwnerId);
    try {
      await carOwnerService.removeCarOwner(carOwnerId);
      loadData(); // Refresh the data
    } catch (error) {
      console.error("Error removing car owner:", error);
      alert(
        error instanceof Error ? error.message : "Failed to remove car owner"
      );
    } finally {
      setRemovingOwnerId(null);
    }
  };

  const handleAddOwnerDialogClose = () => {
    setShowAddOwnerDialog(false);
  };

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!car) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Car not found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card elevation={2}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Typography variant="h6">{t("carManagement.carOwners")}</Typography>
            <IconButton
              size="small"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            >
              <ExpandMore />
            </IconButton>
          </Box>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              {isMainOwner && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddOwnerDialog(true);
                    }}
                  >
                    {t("carManagement.addOwner")}
                  </Button>
                </Box>
              )}

              {/* Car Owners */}
              {carOwners.length > 0 ? (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    {t("carManagement.carOwners")}
                  </Typography>
                  <Grid container spacing={2}>
                    {carOwners.map((carOwner) => (
                      <Grid size={12} key={carOwner.id}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography variant="body2">
                                {carOwner.profiles?.full_name ||
                                  carOwner.profiles?.email}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {t("carManagement.carOwner")}
                              </Typography>
                            </Box>
                          </Box>
                          {isMainOwner &&
                            carOwner.owner_id !== currentUser.id && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleRemoveCarOwner(carOwner.id)
                                }
                                disabled={removingOwnerId === carOwner.id}
                              >
                                {removingOwnerId === carOwner.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <PersonRemove />
                                )}
                              </IconButton>
                            )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("carManagement.noCarOwners")}
                </Typography>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Add Car Owner Dialog */}
      <Dialog
        open={showAddOwnerDialog}
        onClose={handleAddOwnerDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("carManagement.addOwner")}</DialogTitle>
        <DialogContent>
          <CarOwnerForm
            carId={carId}
            onSubmit={handleAddCarOwner}
            onCancel={handleAddOwnerDialogClose}
            existingOwners={carOwners.map((owner) => owner.owner_id)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CarOwners;
