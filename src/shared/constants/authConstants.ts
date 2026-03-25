export const AUTH_CONSTANTS = {
  COOKIE: {
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, 
    NAME: "token",
    PATH: "/",
  },
  TOKEN_EXPIRY: {
    OTP: 5 * 60 * 1000,
    RESET_PASSWORD: 15 * 60 * 1000,
  },
};
