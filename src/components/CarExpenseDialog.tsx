import { Close } from "@mui/icons-material";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { carExpenseService } from "../services/carExpenseService";
import { Car, CarExpense, CarExpenseType } from "../types";

const EXPENSE_GROUPS: {
  labelKey: string;
  types: readonly CarExpenseType[];
}[] = [
  {
    labelKey: "carExpense.groups.legal",
    types: [
      "car_registration",
      "insurance",
      "road_tax",
      "technical_inspection",
    ],
  },
  {
    labelKey: "carExpense.groups.repairs",
    types: [
      "major_repair",
      "tires",
      "battery",
      "brakes",
      "glass_repair",
      "bodywork",
    ],
  },
  {
    labelKey: "carExpense.groups.services",
    types: ["towing", "roadside_assistance", "cleaning_detailing"],
  },
  {
    labelKey: "carExpense.groups.equipment",
    types: ["equipment_accessories", "software_telematics"],
  },
  {
    labelKey: "carExpense.groups.financial",
    types: ["financing_lease", "fines_violations"],
  },
  {
    labelKey: "carExpense.groups.other",
    types: ["other"],
  },
];

const CURRENCY_OPTIONS = ["XAF", "EUR", "USD"] as const;

export interface CarExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Single car (e.g. car detail page) */
  carId?: string;
  /** One or more cars (e.g. driver dashboard); picker shown when more than one */
  cars?: Car[];
  /** When set, dialog updates this expense (draft or submitted, per RLS). */
  editingExpense?: CarExpense | null;
}

const CarExpenseDialog: React.FC<CarExpenseDialogProps> = ({
  open,
  onClose,
  carId,
  cars,
  onSaved,
  editingExpense,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<string>("XAF");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseType, setExpenseType] = useState<CarExpenseType>(
    "car_registration"
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState("");

  const isEdit = Boolean(editingExpense?.id);
  const showCarPicker =
    Boolean(cars && cars.length > 1) && !isEdit;
  const effectiveCarId =
    editingExpense?.car_id ??
    carId ??
    (cars?.length === 1 ? cars[0].id : selectedCarId);

  const resetForm = useCallback(() => {
    setAmount("");
    setCurrency("XAF");
    setExpenseDate("");
    setExpenseType("car_registration");
    setNotes("");
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    if (editingExpense) {
      setAmount(String(editingExpense.amount));
      setCurrency(editingExpense.currency || "XAF");
      setExpenseDate(editingExpense.expense_date);
      setExpenseType(editingExpense.expense_type);
      setNotes(editingExpense.notes ?? "");
      setSelectedCarId(editingExpense.car_id);
      setFormError(null);
      return;
    }

    resetForm();
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setExpenseDate(`${y}-${m}-${day}`);
    if (carId) {
      setSelectedCarId(carId);
    } else if (cars && cars.length > 0) {
      setSelectedCarId(cars[0].id);
    } else {
      setSelectedCarId("");
    }
  }, [open, resetForm, carId, cars, editingExpense]);

  const handleTypeChange = (e: SelectChangeEvent<CarExpenseType>) => {
    setExpenseType(e.target.value as CarExpenseType);
    setFormError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    const parsed = parseFloat(amount.replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0) {
      setFormError(t("carExpense.validationAmount"));
      return;
    }
    if (!expenseDate) {
      setFormError(t("carExpense.validationDate"));
      return;
    }
    if (expenseType === "other" && !notes.trim()) {
      setFormError(t("carExpense.notesRequiredOther"));
      return;
    }
    if (!effectiveCarId) {
      setFormError(t("carExpense.validationCar"));
      return;
    }

    setSubmitting(true);
    try {
      if (editingExpense) {
        await carExpenseService.updateCarExpense(editingExpense.id, {
          amount: parsed,
          currency,
          expense_date: expenseDate,
          expense_type: expenseType,
          notes: notes.trim() || null,
        });
      } else {
        await carExpenseService.insertCarExpense({
          car_id: effectiveCarId,
          amount: parsed,
          currency,
          expense_date: expenseDate,
          expense_type: expenseType,
          notes: notes.trim() || null,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setFormError(t("carExpense.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (s: string) => {
    if (s === "submitted") return t("carExpense.statusSubmitted");
    if (s === "approved") return t("carExpense.statusApproved");
    return t("carExpense.statusDraft");
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="car-expense-dialog-title"
    >
      <DialogTitle
        id="car-expense-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        <Typography variant="h6" component="span">
          {isEdit ? t("carExpense.dialogTitleEdit") : t("carExpense.dialogTitle")}
        </Typography>
        <Tooltip title={t("carExpense.close")}>
          <IconButton
            aria-label={t("carExpense.close")}
            onClick={onClose}
            disabled={submitting}
            size="large"
            sx={{ minWidth: 48, minHeight: 48 }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {isEdit && editingExpense && (
            <Chip
              size="small"
              label={statusLabel(editingExpense.status)}
              color={
                editingExpense.status === "approved"
                  ? "success"
                  : editingExpense.status === "submitted"
                    ? "warning"
                    : "default"
              }
              sx={{ alignSelf: "flex-start" }}
            />
          )}
          {formError && (
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
          )}
          {showCarPicker && cars && (
            <FormControl fullWidth required>
              <InputLabel id="car-expense-car-label">
                {t("carExpense.selectCar")}
              </InputLabel>
              <Select
                labelId="car-expense-car-label"
                label={t("carExpense.selectCar")}
                value={selectedCarId}
                onChange={(e) => {
                  setSelectedCarId(e.target.value);
                  setFormError(null);
                }}
              >
                {cars.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {[c.make, c.model, c.year].filter(Boolean).join(" ")}
                    {c.license_plate ? ` · ${c.license_plate}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            label={t("carExpense.amount")}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel id="car-expense-currency-label">
              {t("carExpense.currency")}
            </InputLabel>
            <Select
              labelId="car-expense-currency-label"
              label={t("carExpense.currency")}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t("carExpense.expenseDate")}
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth required>
            <InputLabel id="car-expense-type-label">
              {t("carExpense.expenseType")}
            </InputLabel>
            <Select
              labelId="car-expense-type-label"
              label={t("carExpense.expenseType")}
              value={expenseType}
              onChange={handleTypeChange}
            >
              {EXPENSE_GROUPS.flatMap((group) => [
                <ListSubheader key={group.labelKey}>
                  {t(group.labelKey)}
                </ListSubheader>,
                ...group.types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`carExpense.types.${type}`)}
                  </MenuItem>
                )),
              ])}
            </Select>
          </FormControl>
          <TextField
            label={t("carExpense.notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            required={expenseType === "other"}
            helperText={
              expenseType === "other"
                ? t("carExpense.notesRequiredOther")
                : undefined
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          fullWidth={fullScreen}
          sx={{ minHeight: 44 }}
        >
          {t("carExpense.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          fullWidth={fullScreen}
          sx={{ minHeight: 44 }}
        >
          {submitting
            ? t("carExpense.saving")
            : isEdit
              ? t("carExpense.saveChanges")
              : t("carExpense.saveDraft")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarExpenseDialog;
