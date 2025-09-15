import { Add, Close, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  CreateIncomeSourceData,
  incomeSourceService,
} from "../services/incomeSourceService";
import { IncomeSource, WeeklyReport } from "../types";
import IncomeSourceForm from "./IncomeSourceForm";

interface IncomeSourceModalProps {
  open: boolean;
  onClose: () => void;
  weeklyReport: WeeklyReport | null;
  userType?: string;
}

const IncomeSourceModal: React.FC<IncomeSourceModalProps> = ({
  open,
  onClose,
  weeklyReport,
  userType,
}) => {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);

  const loadIncomeSources = async () => {
    if (!weeklyReport) return;

    setLoading(true);
    try {
      const sources = await incomeSourceService.getIncomeSourcesByReport(
        weeklyReport.id
      );
      setIncomeSources(sources);
    } catch (error) {
      console.error("Error loading income sources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && weeklyReport) {
      loadIncomeSources();
    }
  }, [open, weeklyReport]);

  const handleAddIncomeSource = async (data: CreateIncomeSourceData) => {
    try {
      await incomeSourceService.createIncomeSource(data);
      setShowAddForm(false);
      loadIncomeSources();
    } catch (error) {
      console.error("Error adding income source:", error);
      alert("Failed to add income source");
    }
  };

  const handleDeleteIncomeSource = async (sourceId: string) => {
    if (!window.confirm("Are you sure you want to delete this income source?"))
      return;

    try {
      await incomeSourceService.deleteIncomeSource(sourceId);
      loadIncomeSources();
    } catch (error) {
      console.error("Error deleting income source:", error);
      alert("Failed to delete income source");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalIncome = () => {
    return incomeSources.reduce((total, source) => total + source.amount, 0);
  };

  const getRentalsTotal = () => {
    return incomeSources
      .filter((source) => source.source_type === "rentals")
      .reduce((total, source) => total + source.amount, 0);
  };

  const getRideShareTotal = () => {
    return incomeSources
      .filter((source) => source.source_type === "ride_share")
      .reduce((total, source) => total + source.amount, 0);
  };

  if (!weeklyReport) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            Income Sources - Week of {formatDate(weeklyReport.week_start_date)}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(getTotalIncome())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Income
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(getRentalsTotal())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rentals
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h6" color="info.main">
                    {formatCurrency(getRideShareTotal())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ride Share
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Add Income Source Button */}
          {userType === "driver" && (
            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddForm(true)}
                disabled={weeklyReport.status !== "draft"}
              >
                Add Income Source
              </Button>
            </Grid>
          )}

          {/* Add Income Source Form */}
          {showAddForm && (
            <Grid size={12}>
              <Paper sx={{ p: 2 }}>
                <IncomeSourceForm
                  onSubmit={handleAddIncomeSource}
                  onCancel={() => setShowAddForm(false)}
                  weeklyReportId={weeklyReport.id}
                />
              </Paper>
            </Grid>
          )}

          {/* Income Sources Table */}
          <Grid size={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Created</TableCell>
                    {userType === "driver" &&
                      weeklyReport.status === "draft" && (
                        <TableCell align="center">Actions</TableCell>
                      )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incomeSources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No income sources added yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomeSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              textTransform: "capitalize",
                              fontWeight:
                                source.source_type === "rentals"
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {source.source_type.replace("_", " ")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(source.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {source.notes || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(source.created_at)}
                          </Typography>
                        </TableCell>
                        {userType === "driver" &&
                          weeklyReport.status === "draft" && (
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "center",
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingSource(source)}
                                  color="primary"
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteIncomeSource(source.id)
                                  }
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </TableCell>
                          )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncomeSourceModal;
