/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CleaningLog, TemperatureEntry, ExpiryItem } from '../types';

const CLEANING_BOX = 'cleaning_logs_box';
const TEMPERATURE_BOX = 'temperature_logs_box';
const EXPIRY_BOX = 'expiry_items_box';

export const storageService = {
  // Cleaning Logs
  getCleaningLog(date: string): CleaningLog {
    const data = localStorage.getItem(`${CLEANING_BOX}_${date}`);
    return data ? JSON.parse(data) : { date, tasks: {} };
  },

  saveCleaningLog(log: CleaningLog): void {
    localStorage.setItem(`${CLEANING_BOX}_${log.date}`, JSON.stringify(log));
  },

  getAllCleaningLogs(): CleaningLog[] {
    const logs: CleaningLog[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CLEANING_BOX)) {
        logs.push(JSON.parse(localStorage.getItem(key)!));
      }
    }
    return logs.sort((a, b) => b.date.localeCompare(a.date));
  },

  // Temperature Logs
  getTemperatureLogs(): TemperatureEntry[] {
    const data = localStorage.getItem(TEMPERATURE_BOX);
    return data ? JSON.parse(data) : [];
  },

  saveTemperatureEntry(entry: TemperatureEntry): void {
    const logs = this.getTemperatureLogs();
    logs.unshift(entry);
    localStorage.setItem(TEMPERATURE_BOX, JSON.stringify(logs.slice(0, 100))); // Keep last 100
  },

  // Expiry Items
  getExpiryItems(): ExpiryItem[] {
    const data = localStorage.getItem(EXPIRY_BOX);
    return data ? JSON.parse(data) : [];
  },

  saveExpiryItem(item: ExpiryItem): void {
    const items = this.getExpiryItems();
    items.push(item);
    localStorage.setItem(EXPIRY_BOX, JSON.stringify(items));
  },

  deleteExpiryItem(id: string): void {
    const items = this.getExpiryItems().filter(i => i.id !== id);
    localStorage.setItem(EXPIRY_BOX, JSON.stringify(items));
  }
};
