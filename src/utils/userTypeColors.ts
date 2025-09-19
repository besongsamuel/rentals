// User Type Color Constants
export const USER_TYPE_COLORS = {
  owner: {
    main: "rgb(255, 59, 48)", // Red for car owners
    light: "rgba(255, 59, 48, 0.1)",
    dark: "rgba(255, 59, 48, 0.8)",
    contrastText: "#ffffff",
  },
  driver: {
    main: "rgb(255, 149, 0)", // Orange for drivers
    light: "rgba(255, 149, 0, 0.1)",
    dark: "rgba(255, 149, 0, 0.8)",
    contrastText: "#ffffff",
  },
} as const;

// Utility function to get user type colors
export const getUserTypeColors = (userType: "owner" | "driver") => {
  return USER_TYPE_COLORS[userType];
};

// Utility function to get user type background color
export const getUserTypeBackgroundColor = (userType: "owner" | "driver") => {
  return USER_TYPE_COLORS[userType].light;
};

// Utility function to get user type text color
export const getUserTypeTextColor = (userType: "owner" | "driver") => {
  return USER_TYPE_COLORS[userType].main;
};

// Utility function to get user type border color
export const getUserTypeBorderColor = (userType: "owner" | "driver") => {
  return USER_TYPE_COLORS[userType].main;
};
