/**
 * Timezone Helper Utilities
 * All date operations use German timezone (Europe/Berlin - CET/CEST)
 */

/**
 * Get current date/time in German timezone
 * @returns {Date} Current date/time
 */
function getGermanNow() {
  return new Date();
}

/**
 * Get today's date string (YYYY-MM-DD) in German timezone
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getGermanTodayString() {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }); // en-CA gives YYYY-MM-DD
}

/**
 * Get today's date at midnight UTC (represents today in German timezone)
 * @returns {Date} Today at 00:00:00 UTC (represents German timezone date)
 */
function getGermanToday() {
  const todayStr = getGermanTodayString();
  const [year, month, day] = todayStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get yesterday's date at midnight UTC (represents yesterday in German timezone)
 * @returns {Date} Yesterday at 00:00:00 UTC
 */
function getGermanYesterday() {
  const today = getGermanToday();
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return yesterday;
}

/**
 * Normalize a date string to midnight UTC
 * Dates are stored in UTC but represent dates in German timezone context
 * @param {string|Date} dateInput - Date string (YYYY-MM-DD) or Date object
 * @returns {Date} Date normalized to midnight UTC
 */
function normalizeDateToGerman(dateInput) {
  if (!dateInput) return null;
  
  // If it's a Date object, extract the date part in German timezone
  if (dateInput instanceof Date) {
    const dateStr = dateInput.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }
  
  // If it's a string like "YYYY-MM-DD", create date at midnight UTC
  const dateStr = dateInput.split('T')[0]; // Get just the date part
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Check if a date is before today in German timezone
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is before today
 */
function isBeforeToday(date) {
  const today = getGermanToday();
  const normalizedDate = normalizeDateToGerman(date);
  return normalizedDate < today;
}

/**
 * Check if a date is today or in the future in German timezone
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today or future
 */
function isTodayOrFuture(date) {
  return !isBeforeToday(date);
}

/**
 * Get date string (YYYY-MM-DD) in German timezone from a Date object
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getGermanDateString(date) {
  if (!date) return null;
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

module.exports = {
  getGermanNow,
  getGermanToday,
  getGermanTodayString,
  getGermanYesterday,
  normalizeDateToGerman,
  isBeforeToday,
  isTodayOrFuture,
  getGermanDateString
};
