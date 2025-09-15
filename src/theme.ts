import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32", // Green - main color
      light: "#4caf50",
      dark: "#1b5e20",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#d32f2f", // Red - secondary color
      light: "#f44336",
      dark: "#b71c1c",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f57c00", // Yellow - warning/accent color
      light: "#ff9800",
      dark: "#ef6c00",
      contrastText: "#ffffff",
    },
    success: {
      main: "#2e7d32", // Green for success states
    },
    error: {
      main: "#d32f2f", // Red for error states
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
