// lib/utils/date-formatter.ts
import { format, parseISO, isValid } from 'date-fns';

export const formatKoreanDate = (dateString: string | Date, formatString: string = 'yyyy-MM-dd'): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    
    return format(date, formatString);
  } catch {
    return 'Invalid Date';
  }
};

export const formatKoreanDateTime = (dateString: string | Date): string => {
  return formatKoreanDate(dateString, 'yyyy-MM-dd HH:mm:ss');
};

export const formatKoreanTime = (dateString: string | Date): string => {
  return formatKoreanDate(dateString, 'HH:mm:ss');
};