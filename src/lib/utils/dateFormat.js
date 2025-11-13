/**
 * Format date to Korean timezone (KST - UTC+9)
 * @param {string|Date} dateString - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string in Korean timezone
 */
export function formatKoreanDate(dateString, options = {}) {
  if (!dateString) return '';

  const date = new Date(dateString);

  const defaultOptions = {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options
  };

  return new Intl.DateTimeFormat('ko-KR', defaultOptions).format(date);
}

/**
 * Format date to Korean timezone with custom format
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string like "2025-01-21 15:30:45"
 */
export function formatKoreanDateTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  const year = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric' });
  const month = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit' });
  const day = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', day: '2-digit' });
  const hour = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', hour12: false });
  const minute = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', minute: '2-digit' });
  const second = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', second: '2-digit' });

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * Format date to Korean timezone (short format - without seconds)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string like "2025. 1. 21. 오후 3:30"
 */
export function formatKoreanDateShort(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
