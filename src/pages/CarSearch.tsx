import { Info, Search as SearchIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CarCard from "../components/CarCard";
import { useUserContext } from "../contexts/UserContext";
import { supabase } from "../lib/supabase";
import { assignmentRequestService } from "../services/assignmentRequestService";
import { carImageStorageService } from "../services/carImageStorageService";
import { Car } from "../types";

const CarSearch: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useUserContext();

  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [carImageUrls, setCarImageUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canSendRequests, setCanSendRequests] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [requestedCarIds, setRequestedCarIds] = useState<Set<string>>(
    new Set()
  );

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState<string>("all");

  // Check if driver can send requests and fetch pending requests
  useEffect(() => {
    const checkEligibilityAndRequests = async () => {
      if (!profile?.id) {
        setCheckingEligibility(false);
        return;
      }

      try {
        // Check if driver can send requests
        const canSend = await assignmentRequestService.canDriverSendRequest(
          profile.id
        );
        setCanSendRequests(canSend);

        // Fetch pending requests to know which cars already have requests
        if (canSend) {
          const { data: requests } =
            await assignmentRequestService.getDriverRequests(profile.id);

          // Extract car IDs from pending requests
          const pendingCarIds = new Set(
            requests
              .filter((req: any) => req.status === "pending")
              .map((req: any) => req.car_id)
          );
          setRequestedCarIds(pendingCarIds);
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setCanSendRequests(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkEligibilityAndRequests();
  }, [profile?.id]);

  // Fetch available cars and their images
  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        setLoading(true);
        setError("");

        const { data, error: fetchError } = await supabase
          .from("cars")
          .select("*")
          .eq("is_available", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setCars(data || []);
        setFilteredCars(data || []);

        // Fetch all car images for the retrieved cars from storage
        if (data && data.length > 0) {
          const carIds = data.map((car) => car.id);
          const imageUrls = await carImageStorageService.getCarImageUrlsForCars(
            carIds
          );
          setCarImageUrls(imageUrls);
        }
      } catch (err) {
        console.error("Error fetching available cars:", err);
        setError(t("cars.search.errorFetchingCars"));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCars();
  }, [t]);

  // Apply filters
  useEffect(() => {
    let filtered = [...cars];

    // Search by make/model
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          `${car.make} ${car.model}`.toLowerCase().includes(query)
      );
    }

    // Filter by transmission type
    if (transmissionFilter !== "all") {
      filtered = filtered.filter(
        (car) => car.transmission_type === transmissionFilter
      );
    }

    setFilteredCars(filtered);
  }, [searchQuery, transmissionFilter, cars]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#1D1D1F",
            mb: 1,
            fontSize: { xs: "1.75rem", sm: "2rem" },
          }}
        >
          {t("cars.search.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("cars.search.subtitle")}
        </Typography>
      </Box>

      {/* Driver Eligibility Message */}
      {!checkingEligibility && !canSendRequests && (
        <Alert
          severity="info"
          icon={<Info />}
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => navigate("/profile")}
              sx={{ textTransform: "none" }}
            >
              {t("driveRequests.completeProfile")}
            </Button>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {t("driveRequests.profileIncompleteTitle")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {t("driveRequests.profileIncompleteMessage")}
          </Typography>
        </Alert>
      )}

      {/* Filters */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Search by Name */}
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <TextField
              fullWidth
              placeholder={t("cars.search.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          {/* Transmission Type Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>{t("cars.search.transmissionFilter")}</InputLabel>
              <Select
                value={transmissionFilter}
                onChange={(e) => setTransmissionFilter(e.target.value)}
                label={t("cars.search.transmissionFilter")}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="all">
                  {t("cars.search.allTransmissions")}
                </MenuItem>
                <MenuItem value="manual">
                  {t("cars.transmissionType.manual")}
                </MenuItem>
                <MenuItem value="automatic">
                  {t("cars.transmissionType.automatic")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results Count */}
      {!loading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {filteredCars.length === 0
              ? t("cars.search.noResults")
              : t("cars.search.resultsCount", { count: filteredCars.length })}
          </Typography>
        </Box>
      )}

      {/* Cars Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {loading ? (
          // Skeleton Loading
          Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))
        ) : filteredCars.length === 0 ? (
          // Empty State
          <Grid size={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: 64,
                  color: "text.disabled",
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("cars.search.emptyState")}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {t("cars.search.emptyStateSubtitle")}
              </Typography>
            </Box>
          </Grid>
        ) : (
          // Car Cards
          filteredCars.map((car) => {
            // Get the primary image or first image for this car
            const carImageUrl = carImageUrls[car.id]?.[0] || null;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={car.id}>
                <CarCard
                  car={car}
                  carImageUrl={carImageUrl}
                  canSendRequest={canSendRequests}
                  hasExistingRequest={requestedCarIds.has(car.id)}
                />
              </Grid>
            );
          })
        )}
      </Grid>
    </Container>
  );
};

export default CarSearch;
