import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007AFF", // Apple Blue
      light: "#4DA6FF",
      dark: "#0056CC",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#86868B", // Apple Gray
      light: "#A1A1A6",
      dark: "#6D6D70",
      contrastText: "#ffffff",
    },
    success: {
      main: "#34C759", // Apple Green
      light: "#5DD679",
      dark: "#28A745",
      contrastText: "#ffffff",
    },
    error: {
      main: "#FF3B30", // Apple Red
      light: "#FF6961",
      dark: "#D70015",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#FF9500", // Apple Orange
      light: "#FFB340",
      dark: "#CC7700",
      contrastText: "#ffffff",
    },
    info: {
      main: "#007AFF", // Same as primary for consistency
      light: "#4DA6FF",
      dark: "#0056CC",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F2F2F7", // Apple Light Gray
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1D1D1F", // Apple Dark Gray
      secondary: "#86868B", // Apple Medium Gray
    },
    grey: {
      50: "#F2F2F7",
      100: "#E5E5EA",
      200: "#D1D1D6",
      300: "#C7C7CC",
      400: "#AEAEB2",
      500: "#8E8E93",
      600: "#86868B",
      700: "#6D6D70",
      800: "#48484A",
      900: "#1D1D1F",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 400,
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2.25rem",
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.875rem",
      fontWeight: 400,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "-0.01em",
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "-0.01em",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 400,
      textTransform: "none",
      letterSpacing: "-0.01em",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#C7C7CC #F2F2F7",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "transparent",
            width: 8,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 4,
            backgroundColor: "#C7C7CC",
            minHeight: 24,
            border: "2px solid transparent",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
            {
              backgroundColor: "#AEAEB2",
            },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active":
            {
              backgroundColor: "#AEAEB2",
            },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
            {
              backgroundColor: "#AEAEB2",
            },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          padding: "12px 24px",
          fontSize: "0.875rem",
          fontWeight: 400,
          boxShadow: "none",
          transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          letterSpacing: "-0.01em",
          "&:hover": {
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        },
        outlined: {
          borderWidth: "0.5px",
          "&:hover": {
            borderWidth: "0.5px",
            background: "rgba(0, 122, 255, 0.04)",
          },
        },
        text: {
          "&:hover": {
            background: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          background: "#ffffff",
          border: "0.5px solid rgba(0,0,0,0.1)",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        },
        elevation2: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
        elevation3: {
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          background: "#ffffff",
          border: "0.5px solid rgba(0,0,0,0.1)",
          transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 122, 255, 0.5)",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          color: "#1D1D1F",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 400,
          fontSize: "0.75rem",
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "0.5px solid rgba(0,0,0,0.1)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
