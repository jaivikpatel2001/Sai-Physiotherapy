/**
 * Generate a Patient ID in format: SAI-YYYY-XXXX
 * The counter portion is zero-padded to 4 digits.
 * The actual uniqueness is enforced via DB check in the backend.
 */
export const generatePatientIdPrefix = (): string => {
  const year = new Date().getFullYear();
  return `SAI-${year}-`;
};

/**
 * Generate an Appointment ID in format: APT-YYYY-XXXXX
 */
export const generateAppointmentIdPrefix = (): string => {
  const year = new Date().getFullYear();
  return `APT-${year}-`;
};

/**
 * Generate an Invoice Number prefix in format: INV-YYYY-XXXXX
 */
export const generateInvoicePrefix = (): string => {
  const year = new Date().getFullYear();
  return `INV-${year}-`;
};

/**
 * Pad a number with leading zeros.
 * @example padNumber(42, 5) → "00042"
 */
export const padNumber = (num: number, digits: number): string => {
  return String(num).padStart(digits, '0');
};

/**
 * Generate a slug from a string.
 * @example generateSlug("Back Pain Treatment") → "back-pain-treatment"
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate a random OTP of given length.
 */
export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Generate a token number for appointment queue (1-999).
 */
export const generateTokenNumber = (): number => {
  return Math.floor(Math.random() * 999) + 1;
};
