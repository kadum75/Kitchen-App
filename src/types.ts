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

export const TASKS = [
  'Food prep surfaces sanitized',
  'Floors cleaned',
  'Waste removed',
  'Fridges cleaned',
  'Equipment cleaned',
  'Hand wash stations stocked',
  'Thermometers checked'
];

export type WasteReason = 'expired' | 'spoiled' | 'overproduced' | 'contaminated' | 'other';

export interface WasteEntry {
  id: string;
  timestamp: string;
  item: string;
  quantity: string;
  reason: WasteReason;
  notes?: string;
}
