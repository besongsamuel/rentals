/**
 * Example usage of the image extraction service
 * This file demonstrates how to use extractCarData and extractDriversLicenseData
 */

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  CarData,
  DriversLicenseData,
  extractCarData,
  extractDriversLicenseData,
} from "./imageExtraction";

export const CarImageExtractionExample: React.FC = () => {
  const [carData, setCarData] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCarImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await extractCarData(file);
      setCarData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to extract car data"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Car Image Extraction Example
      </Typography>

      <input
        accept="image/*"
        type="file"
        onChange={handleCarImageUpload}
        style={{ display: "none" }}
        id="car-image-upload"
      />
      <label htmlFor="car-image-upload">
        <Button variant="contained" component="span" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Upload Car Image"}
        </Button>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {carData && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Extracted Car Data:</Typography>
          <Typography>Make: {carData.make || "Not found"}</Typography>
          <Typography>Model: {carData.model || "Not found"}</Typography>
          <Typography>
            License Plate: {carData.license_plate || "Not found"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const DriversLicenseExtractionExample: React.FC = () => {
  const [licenseData, setLicenseData] = useState<DriversLicenseData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLicenseImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await extractDriversLicenseData(file);
      setLicenseData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to extract license data"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Driver's License Extraction Example
      </Typography>

      <input
        accept="image/*"
        type="file"
        onChange={handleLicenseImageUpload}
        style={{ display: "none" }}
        id="license-image-upload"
      />
      <label htmlFor="license-image-upload">
        <Button variant="contained" component="span" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Upload License Image"}
        </Button>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {licenseData && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Extracted License Data:</Typography>
          <Typography>
            License Number: {licenseData.license_number || "Not found"}
          </Typography>
          <Typography>
            License Class: {licenseData.license_class || "Not found"}
          </Typography>
          <Typography>
            Issue Date: {licenseData.issue_date || "Not found"}
          </Typography>
          <Typography>
            Expiry Date: {licenseData.expiry_date || "Not found"}
          </Typography>
          <Typography>
            Issuing Authority: {licenseData.issuing_authority || "Not found"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Example of using with FileUpload component integration
export const IntegratedCarFormExample: React.FC = () => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    licensePlate: "",
  });

  const handleImageExtracted = (data: CarData) => {
    setFormData({
      make: data.make || "",
      model: data.model || "",
      licensePlate: data.license_plate || "",
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const data = await extractCarData(file);
      handleImageExtracted(data);
    } catch (err) {
      console.error("Failed to extract car data:", err);
    }
  };

  return (
    <Box>
      {/* Your form fields here */}
      <Typography>Make: {formData.make}</Typography>
      <Typography>Model: {formData.model}</Typography>
      <Typography>License Plate: {formData.licensePlate}</Typography>

      {/* FileUpload component with auto-extraction */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />
    </Box>
  );
};
