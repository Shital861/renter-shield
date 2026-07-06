import { Incident, Voucher, IncidentLog } from './types';

const STORAGE_KEYS = {
  INCIDENTS: 'rentershield_incidents',
  VOUCHER: 'rentershield_voucher',
  RENTER_ID: 'rentershield_renter_id',
  SESSION_ID: 'rentershield_session_id',
  INCIDENT_LOG: 'rentershield_incident_log',
};

// Existing functions for UI backward compatibility
export const getIncidents = (): Incident[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
  return data ? JSON.parse(data) : [];
};

export const saveIncidents = (incidents: Incident[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
};

export const getActiveVoucher = (): Voucher | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.VOUCHER);
  return data ? JSON.parse(data) : null;
};

export const saveActiveVoucher = (voucher: Voucher): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.VOUCHER, JSON.stringify(voucher));
};

export const clearAllStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.clear();
};

// New storage functions requested by the user
export const getRenterId = (): string => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(STORAGE_KEYS.RENTER_ID);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(STORAGE_KEYS.RENTER_ID, id);
  }
  return id;
};

export const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
};

export const setSessionId = (id: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
};

export const clearSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
};

export const saveIncidentLog = (log: IncidentLog): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INCIDENT_LOG, JSON.stringify(log));
};

export const getIncidentLog = (): IncidentLog | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.INCIDENT_LOG);
  return data ? JSON.parse(data) : null;
};

// Helper UUID generator
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
