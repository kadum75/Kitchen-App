/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CleaningLog, TemperatureEntry, ExpiryItem, WasteEntry } from '../types';

const CLEANING_BOX = 'cleaning_logs_box';
const TEMPERATURE_BOX = 'temperature_logs_box';
const EXPIRY_BOX = 'expiry_items_box';

export const storageService = {
  // Cleaning Logs
  getCleaningLog(date: string): CleaningLog {
    try {
      const data = localStorage.getItem(`${CLEANING_BOX}_${date}`);
      return data ? JSON.parse(data) : { date, tasks: {} };
    } catch (e) {
      console.error('Error parsing cleaning log:', e);
      return { date, tasks: {} };
    }
  },

  saveCleaningLog(log: CleaningLog): void {
    localStorage.setItem(`${CLEANING_BOX}_${log.date}`, JSON.stringify(log));
  },

  getAllCleaningLogs(): CleaningLog[] {
    try {
      const logs: CleaningLog[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CLEANING_BOX)) {
          const item = localStorage.getItem(key);
          if (item) logs.push(JSON.parse(item));
        }
      }
      return logs.sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      console.error('Error parsing all cleaning logs:', e);
      return [];
    }
  },

  // Temperature Logs
  getTemperatureLogs(): TemperatureEntry[] {
    try {
      const data = localStorage.getItem(TEMPERATURE_BOX);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing temperature logs:', e);
      return [];
    }
  },

  saveTemperatureEntry(entry: TemperatureEntry): void {
    const logs = this.getTemperatureLogs();
    logs.unshift(entry);
    logs.splice(50); // Limit to last 50 entries
    localStorage.setItem(TEMPERATURE_BOX, JSON.stringify(logs));
  },

  // Expiry Items
  getExpiryItems(): ExpiryItem[] {
    try {
      const data = localStorage.getItem(EXPIRY_BOX);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing expiry items:', e);
      return [];
    }
  },

  saveExpiryItem(item: ExpiryItem): void {
    const items = this.getExpiryItems();
    items.push(item);
    localStorage.setItem(EXPIRY_BOX, JSON.stringify(items));
  },

  deleteExpiryItem(id: string): void {
    const items = this.getExpiryItems().filter(i => i.id !== id);
    localStorage.setItem(EXPIRY_BOX, JSON.stringify(items));
  },

  // Waste Logs
  getWasteEntries(): WasteEntry[] {
    return getWasteLogs();
  },

  saveWasteEntry(entry: WasteEntry): void {
    saveWasteEntry(entry);
  },

  deleteWasteEntry(id: string): void {
    deleteWasteEntry(id);
  }
};

const WASTE_KEY = 'waste_logs';

export const getWasteLogs = (): WasteEntry[] => {
  const data = localStorage.getItem(WASTE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveWasteEntry = (entry: WasteEntry): void => {
  const logs = getWasteLogs();
  logs.unshift(entry);
  localStorage.setItem(WASTE_KEY, JSON.stringify(logs));
};

export const deleteWasteEntry = (id: string): void => {
  const logs = getWasteLogs().filter(e => e.id !== id);
  localStorage.setItem(WASTE_KEY, JSON.stringify(logs));
};
