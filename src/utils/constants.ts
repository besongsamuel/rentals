export const USER_TYPES = {
  DRIVER: "driver",
  OWNER: "owner",
} as const;

export const PROPERTY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
} as const;

export const APP_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
} as const;

export const FORM_VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_PHONE_LENGTH: 20,
} as const;


