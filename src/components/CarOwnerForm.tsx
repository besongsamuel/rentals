import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { profileService } from "../services/profileService";
import { CreateCarOwnerData, Profile } from "../types";

interface CarOwnerFormProps {
  carId: string;
  onSubmit: (data: CreateCarOwnerData) => void;
  onCancel: () => void;
  existingOwners: string[]; // Array of existing owner IDs to exclude from selection
  organizationId?: string; // Organization ID to filter owners by
}

const CarOwnerForm: React.FC<CarOwnerFormProps> = ({
  carId,
  onSubmit,
  onCancel,
  existingOwners,
  organizationId,
}) => {
  const [formData, setFormData] = useState<CreateCarOwnerData>({
    car_id: carId,
    owner_id: "",
  });
  const [owners, setOwners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOwners = async () => {
      setLoading(true);
      try {
        const allOwners = await profileService.getAllOwners(organizationId);
        // Filter out existing car owners (from car_owners table)
        // The main car owner (car.owner_id) is not included in existingOwners, so they can be added
        const availableOwners = allOwners.filter(
          (owner) => !existingOwners.includes(owner.id)
        );
        setOwners(availableOwners);
      } catch (error) {
        console.error("Error loading owners:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOwners();
  }, [existingOwners]);

  const handleInputChange =
    (field: keyof CreateCarOwnerData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSelectChange =
    (field: keyof CreateCarOwnerData) => (event: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.owner_id) {
      alert("Please select an owner");
      return;
    }

    onSubmit(formData);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading available owners...
        </Typography>
      </Box>
    );
  }

  if (owners.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No available owners to add (all owners are already in the car owners
          list).
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Close
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Car Owner
      </Typography>

      <Grid container spacing={2}>
        <Grid size={12}>
          <FormControl fullWidth required>
            <InputLabel>Select Owner</InputLabel>
            <Select
              value={formData.owner_id}
              onChange={handleSelectChange("owner_id")}
              label="Select Owner"
            >
              {owners.map((owner) => (
                <MenuItem key={owner.id} value={owner.id}>
                  {owner.full_name || owner.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add Owner
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarOwnerForm;
