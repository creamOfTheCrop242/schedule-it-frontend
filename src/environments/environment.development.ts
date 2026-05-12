export const environment = {
  production: false,
  baseUrl: 'http://localhost:3000',
  /** Must match backend `DEV_ONBOARDING_RESET_SECRET` in `.env` for the reset button to work. */
  devOnboardingResetSecret: 'local-dev-onboarding-reset',
};
