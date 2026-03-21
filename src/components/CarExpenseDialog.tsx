import { Close } from "@mui/icons-material";
import {
  Button,
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
import { CarExpenseType } from "../types";

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
  carId: string;
  onSaved: () => void;
}

const CarExpenseDialog: React.FC<CarExpenseDialogProps> = ({
  open,
  onClose,
  carId,
  onSaved,
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

  const resetForm = useCallback(() => {
    setAmount("");
    setCurrency("XAF");
    setExpenseDate("");
    setExpenseType("car_registration");
    setNotes("");
    setFormError(null);
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setExpenseDate(`${y}-${m}-${day}`);
    }
  }, [open, resetForm]);

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

    setSubmitting(true);
    try {
      await carExpenseService.insertCarExpense({
        car_id: carId,
        amount: parsed,
        currency,
        expense_date: expenseDate,
        expense_type: expenseType,
        notes: notes.trim() || null,
      });
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      setFormError(t("carExpense.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
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
          {t("carExpense.dialogTitle")}
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
          {formError && (
            <Typography color="error" variant="body2">
              {formError}
            </Typography>
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
          {submitting ? t("carExpense.saving") : t("carExpense.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarExpenseDialog;
