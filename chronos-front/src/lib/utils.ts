import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short", 
    day: "numeric"
  });
};

export const formatDateLong = (dateString: string) => {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    year: "numeric"
  });
};

export const formatTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false
  });
};

export const formatDuration = (durationSeconds: number) => {
  const hours = durationSeconds / 3600;
  return `${hours.toFixed(1)}h`;
};
