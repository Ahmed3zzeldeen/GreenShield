// const BASE_URL = 'http://localhost:3000'; 
const BASE_URL = 'https://greenshield.up.railway.app'; 

const AUTH_URL = `${BASE_URL}/api/auth`;

export const API_URLS = {
  LOGIN: `${AUTH_URL}/login`,
  REGISTER: `${AUTH_URL}/signup`,
  VERIFY_OTP: `${AUTH_URL}/confirm-email`,
  FORGOT_PASSWORD: `${AUTH_URL}/forgot-password`,
  RESET_PASSWORD: `${AUTH_URL}/reset-password`,
  CHANGE_PASSWORD: `${AUTH_URL}/change-password`,
  RESEND_OTP: `${AUTH_URL}/resend-verification`,
  REFRESH_TOKEN: `${AUTH_URL}/refresh-token`,
  PROFILE: `${BASE_URL}/api/profile`,
  SCANS: `${BASE_URL}/api/scans`,
  UPLOAD_SCAN: `${BASE_URL}/api/predictions/create-scan`,
};