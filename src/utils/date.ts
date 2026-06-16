import { format } from 'date-fns'

export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy')
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'EEE, d MMM yyyy · h:mm a')
}

export function nowISO(): string {
  return new Date().toISOString()
}
