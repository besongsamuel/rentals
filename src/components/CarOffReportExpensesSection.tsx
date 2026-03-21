import {
  CheckCircle,
  DeleteOutline,
  Edit,
  ReceiptLong,
  Send,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CarExpenseDialog from "./CarExpenseDialog";
import { carExpenseService } from "../services/carExpenseService";
import { Car, CarExpense, Profile } from "../types";
import { formatSqlDateOnlyForDisplay } from "../utils/dateHelpers";

type CarExpenseRow = CarExpense & { carLabel?: string };

function stripCarLabel(row: CarExpenseRow): CarExpense {
  const { carLabel: _carLabel, ...rest } = row;
  return rest as CarExpense;
}

function vehicleLabelForRow(
  row: CarExpenseRow,
  cars: Car[] | undefined
): string | null {
  if (row.carLabel) return row.carLabel;
  if (cars?.length) {
    const c = cars.find((x) => x.id === row.car_id);
    if (c) {
      return (
        [c.make, c.model, c.license_plate].filter(Boolean).join(" · ") || null
      );
    }
  }
  return null;
}

export interface CarOffReportExpensesSectionProps {
  /** Single-car context (owner car page) */
  carId?: string;
  /** Multi-car context (driver dashboard); merged list, car picker in dialog */
  cars?: Car[];
  canAddExpense: boolean;
  /** Main or co-owner: may approve submitted expenses and edit submitted rows */
  canApproveCarExpenses: boolean;
  profile: Profile | null;
  onExpensesChanged?: () => void;
  /** When true, omit outer Grid and section title (e.g. inside a tab) */
  embedded?: boolean;
}

const CarOffReportExpensesSection: React.FC<
  CarOffReportExpensesSectionProps
> = ({
  carId,
  cars,
  canAddExpense,
  canApproveCarExpenses,
  profile,
  onExpensesChanged,
  embedded = false,
}) => {
  const { t, i18n } = useTranslation();
  const [expenses, setExpenses] = useState<CarExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<CarExpense | null>(
    null
  );
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingSubmitRow, setPendingSubmitRow] = useState<CarExpenseRow | null>(
    null
  );

  const uid = profile?.id ?? null;

  const canSubmitExpense = (row: CarExpenseRow) =>
    row.status === "draft" && uid !== null && row.created_by === uid;

  const canEditExpense = (row: CarExpenseRow) => {
    if (!uid) return false;
    if (row.status === "draft" && row.created_by === uid) return true;
    if (row.status === "submitted" && canApproveCarExpenses) return true;
    return false;
  };

  const canApproveExpense = (row: CarExpenseRow) =>
    row.status === "submitted" && canApproveCarExpenses;

  const canDeleteExpense = (row: CarExpenseRow) => {
    if (row.status !== "draft" || !uid) return false;
    if (row.created_by === uid) return true;
    if (canApproveCarExpenses) return true;
    return false;
  };

  const loadExpenses = useCallback(async () => {
    if (cars && cars.length > 0) {
      setLoading(true);
      try {
        const buckets = await Promise.all(
          cars.map(async (c) => {
            const rows = await carExpenseService.getCarExpensesForCar(c.id);
            const label =
              [c.make, c.model, c.license_plate].filter(Boolean).join(" · ") ||
              "";
            return rows.map((r) => ({
              ...r,
              carLabel: label || undefined,
            }));
          })
        );
        const flat = buckets.flat();
        flat.sort((a, b) => {
          const byDate = b.expense_date.localeCompare(a.expense_date);
          if (byDate !== 0) return byDate;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        setExpenses(flat);
      } catch (e) {
        console.error("Error loading car expenses:", e);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (carId) {
      setLoading(true);
      try {
        const rows = await carExpenseService.getCarExpensesForCar(carId);
        const sorted = [...rows].sort((a, b) => {
          const byDate = b.expense_date.localeCompare(a.expense_date);
          if (byDate !== 0) return byDate;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        setExpenses(sorted);
      } catch (e) {
        console.error("Error loading car expenses:", e);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setExpenses([]);
    setLoading(false);
  }, [carId, cars]);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const formatMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat(i18n.language === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: currency || "XAF",
    }).format(amount);

  const handleSaved = () => {
    void loadExpenses();
    onExpensesChanged?.();
    setEditingExpense(null);
  };

  const statusChip = (status: string) => {
    const label =
      status === "submitted"
        ? t("carExpense.statusSubmitted")
        : status === "approved"
          ? t("carExpense.statusApproved")
          : t("carExpense.statusDraft");
    const color =
      status === "approved"
        ? "success"
        : status === "submitted"
          ? "warning"
          : "default";
    return <Chip size="small" label={label} color={color} sx={{ mt: 0.5 }} />;
  };

  const handleConfirmSubmitForApproval = async () => {
    if (!pendingSubmitRow) return;
    const id = pendingSubmitRow.id;
    setActingId(id);
    try {
      await carExpenseService.submitCarExpense(id);
      setPendingSubmitRow(null);
      handleSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await carExpenseService.approveCarExpense(id);
      handleSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setActingId(confirmDeleteId);
    try {
      await carExpenseService.deleteCarExpense(confirmDeleteId);
      setConfirmDeleteId(null);
      handleSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  const cardProps = embedded
    ? ({ variant: "outlined" as const } as const)
    : ({ elevation: 2 } as const);

  const body = (
    <Card {...cardProps}>
      <CardContent>
        {(!embedded || canAddExpense) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mb: 2,
            }}
          >
            {!embedded && (
              <Typography variant="h6" component="h2">
                {t("carExpense.sectionTitle")}
              </Typography>
            )}
            {embedded && canAddExpense && <Box sx={{ flex: 1 }} />}
            {canAddExpense && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ReceiptLong />}
                onClick={() => {
                  setEditingExpense(null);
                  setDialogOpen(true);
                }}
                sx={{
                  minHeight: 44,
                  alignSelf: embedded
                    ? { xs: "stretch", sm: "flex-end" }
                    : { xs: "stretch", sm: "auto" },
                  ml: embedded ? { sm: "auto" } : 0,
                }}
              >
                {t("carExpense.addButton")}
              </Button>
            )}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("carExpense.workflowHint")}
        </Typography>

        {loading && (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={72}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
        )}

        {!loading && expenses.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {t("carExpense.listEmpty")}
          </Typography>
        )}

        {!loading && expenses.length > 0 && (
          <Stack divider={<Divider flexItem />} spacing={0}>
            {expenses.map((row) => (
              <Box
                key={row.id}
                sx={{
                  py: 2,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1.5, sm: 2 },
                  alignItems: { xs: "stretch", sm: "flex-start" },
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {formatSqlDateOnlyForDisplay(
                      row.expense_date,
                      i18n.language
                    )}
                  </Typography>
                  {row.carLabel && (cars?.length ?? 0) > 1 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.25 }}
                    >
                      {row.carLabel}
                    </Typography>
                  )}
                  {statusChip(row.status)}
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {t(`carExpense.types.${row.expense_type}`)}
                  </Typography>
                  {row.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {row.notes}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: 1,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="error.main"
                    sx={{
                      textAlign: { xs: "left", sm: "right" },
                      minWidth: { sm: 100 },
                    }}
                  >
                    {formatMoney(Number(row.amount), row.currency)}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      justifyContent: { xs: "flex-start", sm: "flex-end" },
                    }}
                  >
                    {canEditExpense(row) && (
                      <Tooltip title={t("carExpense.editTooltip")}>
                        <span>
                          <IconButton
                            aria-label={t("carExpense.editTooltip")}
                            size="large"
                            sx={{ minWidth: 48, minHeight: 48 }}
                            onClick={() => {
                              setEditingExpense(stripCarLabel(row));
                              setDialogOpen(true);
                            }}
                            disabled={actingId === row.id}
                          >
                            <Edit />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {canSubmitExpense(row) && (
                      <Tooltip title={t("carExpense.submitForApprovalTooltip")}>
                        <span>
                          <IconButton
                            aria-label={t("carExpense.submitForApprovalTooltip")}
                            size="large"
                            sx={{ minWidth: 48, minHeight: 48 }}
                            onClick={() => setPendingSubmitRow(row)}
                            disabled={actingId === row.id}
                            color="primary"
                          >
                            <Send />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {canApproveExpense(row) && (
                      <Tooltip title={t("carExpense.approveTooltip")}>
                        <span>
                          <IconButton
                            aria-label={t("carExpense.approveTooltip")}
                            size="large"
                            sx={{
                              minWidth: 48,
                              minHeight: 48,
                              color: "#2e7d32",
                            }}
                            onClick={() => void handleApprove(row.id)}
                            disabled={actingId === row.id}
                          >
                            <CheckCircle />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {canDeleteExpense(row) && (
                      <Tooltip title={t("carExpense.deleteTooltip")}>
                        <span>
                          <IconButton
                            aria-label={t("carExpense.deleteTooltip")}
                            size="large"
                            sx={{ minWidth: 48, minHeight: 48 }}
                            onClick={() => setConfirmDeleteId(row.id)}
                            disabled={actingId === row.id}
                            color="error"
                          >
                            <DeleteOutline />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const dialog =
    cars && cars.length > 0 ? (
      <CarExpenseDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingExpense(null);
        }}
        cars={cars}
        editingExpense={editingExpense}
        onSaved={handleSaved}
      />
    ) : carId ? (
      <CarExpenseDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingExpense(null);
        }}
        carId={carId}
        editingExpense={editingExpense}
        onSaved={handleSaved}
      />
    ) : null;

  const pendingVehicleLabel =
    pendingSubmitRow !== null
      ? vehicleLabelForRow(pendingSubmitRow, cars)
      : null;

  const submitConfirmDialog = pendingSubmitRow ? (
    <Dialog
      open
      onClose={() => !actingId && setPendingSubmitRow(null)}
      aria-labelledby="car-expense-submit-confirm-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="car-expense-submit-confirm-title">
        {t("carExpense.submitConfirmTitle")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {t("carExpense.submitConfirmDescription")}
        </DialogContentText>
        <Stack spacing={1.25} sx={{ mt: 1 }}>
          {pendingVehicleLabel ? (
            <Typography variant="body2" component="div">
              <Box component="span" sx={{ fontWeight: 600 }}>
                {t("carExpense.submitSummaryVehicle")}
              </Box>{" "}
              {pendingVehicleLabel}
            </Typography>
          ) : null}
          <Typography variant="body2" component="div">
            <Box component="span" sx={{ fontWeight: 600 }}>
              {t("carExpense.submitSummaryDate")}
            </Box>{" "}
            {formatSqlDateOnlyForDisplay(
              pendingSubmitRow.expense_date,
              i18n.language
            )}
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="span" sx={{ fontWeight: 600 }}>
              {t("carExpense.submitSummaryType")}
            </Box>{" "}
            {t(`carExpense.types.${pendingSubmitRow.expense_type}`)}
          </Typography>
          <Typography variant="body2" component="div">
            <Box component="span" sx={{ fontWeight: 600 }}>
              {t("carExpense.submitSummaryAmount")}
            </Box>{" "}
            {formatMoney(
              Number(pendingSubmitRow.amount),
              pendingSubmitRow.currency
            )}
          </Typography>
          {pendingSubmitRow.notes?.trim() ? (
            <Typography variant="body2" component="div">
              <Box component="span" sx={{ fontWeight: 600 }}>
                {t("carExpense.submitSummaryNotes")}
              </Box>{" "}
              {pendingSubmitRow.notes}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
        <Button
          onClick={() => setPendingSubmitRow(null)}
          disabled={Boolean(actingId)}
          sx={{ minHeight: 44 }}
        >
          {t("carExpense.cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleConfirmSubmitForApproval()}
          disabled={Boolean(actingId)}
          sx={{ minHeight: 44 }}
        >
          {actingId === pendingSubmitRow.id
            ? t("carExpense.saving")
            : t("carExpense.submitConfirmAction")}
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;

  const deleteDialog = (
    <Dialog
      open={Boolean(confirmDeleteId)}
      onClose={() => !actingId && setConfirmDeleteId(null)}
      aria-labelledby="car-expense-delete-title"
    >
      <DialogTitle id="car-expense-delete-title">
        {t("carExpense.deleteConfirmTitle")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("carExpense.deleteConfirmBody")}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => setConfirmDeleteId(null)}
          disabled={Boolean(actingId)}
        >
          {t("carExpense.cancel")}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => void handleConfirmDelete()}
          disabled={Boolean(actingId)}
        >
          {t("carExpense.deleteConfirmAction")}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (embedded) {
    return (
      <>
        {body}
        {dialog}
        {submitConfirmDialog}
        {deleteDialog}
      </>
    );
  }

  return (
    <Grid size={12}>
      {body}
      {dialog}
      {submitConfirmDialog}
      {deleteDialog}
    </Grid>
  );
};

export default CarOffReportExpensesSection;
