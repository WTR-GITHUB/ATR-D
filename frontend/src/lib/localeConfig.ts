// /frontend/src/lib/localeConfig.ts

// Locale configuration for A-DIENYNAS system
// Ensures consistent date/time formatting across server and client
// CHANGE: Created locale configuration to handle server/client locale differences

export const LOCALE_CONFIG = {
  // Primary locale for the application
  primary: 'lt-LT',
  
  // Fallback locale if primary is not available
  fallback: 'en-US',
  
  // Date formatting options
  dateFormat: {
    short: { month: '2-digit', day: '2-digit' } as Intl.DateTimeFormatOptions,
    long: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    } as Intl.DateTimeFormatOptions,
    time: {
      hour: '2-digit',
      minute: '2-digit'
    } as Intl.DateTimeFormatOptions,
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    } as Intl.DateTimeFormatOptions
  },
  
  // Week day names in Lithuanian
  weekDays: {
    short: ['Sek', 'Pir', 'Ant', 'Tre', 'Ket', 'Pen', 'Šeš'],
    long: ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis']
  },
  
  // Month names in Lithuanian
  months: {
    short: ['Sau', 'Vas', 'Kov', 'Bal', 'Geg', 'Bir', 'Lie', 'Rgp', 'Rgs', 'Spa', 'Lap', 'Grd'],
    long: ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis']
  }
} as const;

/**
 * Format date using consistent locale configuration
 */
export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = LOCALE_CONFIG.dateFormat.short): string => {
  try {
    return date.toLocaleDateString('en-US', options);
  } catch {
    // Fallback to fallback locale if primary fails
    return date.toLocaleDateString('en-US', options);
  }
};

/**
 * Format time using consistent locale configuration
 */
export const formatTime = (date: Date, options: Intl.DateTimeFormatOptions = LOCALE_CONFIG.dateFormat.time): string => {
  try {
    return date.toLocaleTimeString('en-US', options);
  } catch {
    return date.toLocaleTimeString('en-US', options);
  }
};

/**
 * Format date and time using consistent locale configuration
 */
export const formatDateTime = (date: Date, options: Intl.DateTimeFormatOptions = LOCALE_CONFIG.dateFormat.datetime): string => {
  try {
    return date.toLocaleString('en-US', options);
  } catch {
    return date.toLocaleString('en-US', options);
  }
};

/**
 * Get week day name in Lithuanian
 */
export const getWeekDayName = (date: Date, short: boolean = false): string => {
  const dayIndex = date.getDay();
  return short ? LOCALE_CONFIG.weekDays.short[dayIndex] : LOCALE_CONFIG.weekDays.long[dayIndex];
};

/**
 * Get month name in Lithuanian
 */
export const getMonthName = (date: Date, short: boolean = false): string => {
  const monthIndex = date.getMonth();
  return short ? LOCALE_CONFIG.months.short[monthIndex] : LOCALE_CONFIG.months.long[monthIndex];
};
