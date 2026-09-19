export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatHoursLeft(hours) {
  if (hours == null) return '';
  if (hours <= 0) return 'Expired';
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins}m left`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m left` : `${h}h left`;
}

export function formatKg(kg) {
  if (kg == null || isNaN(kg)) return '0 kg';
  const num = parseFloat(kg);
  return `${num.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg`;
}

export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}

export function formatKgToMeals(kg) {
  if (!kg) return 0;
  return Math.round(kg * 2.5);
}

export function formatCO2Saved(kg) {
  if (!kg) return '0 kg';
  return `${(kg * 2.5).toFixed(1)} kg`;
}
