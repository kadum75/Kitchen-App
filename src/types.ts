/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CleaningLog {
  date: string; // yyyy-MM-dd
  tasks: Record<string, boolean>;
}

export interface TemperatureEntry {
  id: string;
  timestamp: number;
  type: 'FRIDGE' | 'FREEZER';
  value: number;
}

export interface ExpiryItem {
  id: string;
  name: string;
  prepDate: string; // yyyy-MM-dd
  expiryDate: string; // yyyy-MM-dd
  shelfLife: number;
}
