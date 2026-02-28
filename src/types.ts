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
  type: 'FRIDGE' | 'FREEZER' | 'HOT_HOLD';
  value: number;
  equipmentNumber: string;
  location?: string;
  item?: string;
  staffName?: string;
  action?: string;
}

export type ExpiryStatus = 'ACTIVE' | 'EXPIRES SOON' | 'EXPIRED';

export interface ExpiryItem {
  id: string;
  itemName: string;
  prepDate: string; // yyyy-MM-dd
  expDate: string; // yyyy-MM-dd
  status: ExpiryStatus;
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

export type WasteReason = 'SPOILAGE' | 'OVER-PREP' | 'CUSTOMER RETURN' | 'DAMAGED' | 'EXPIRED';

export interface WasteEntry {
  id: string;
  timestamp: string;
  item: string;
  quantity: string;
  reason: WasteReason;
  notes?: string;
}

export interface CorrectiveAction {
  id: string;
  timestamp: string;
  ccpType: 'FRIDGE' | 'FREEZER' | 'HOT_HOLD' | 'EXPIRY';
  temperature?: number;
  action: string;
  notes: string;
  staffName: string;
  rootCause?: string;
  prevention?: string;
}

export interface CookingEntry {
  id: string;
  timestamp: string;
  item: string;
  batch: string;
  targetTemp: number;
  actualTemp: number;
  probe: string;
  operator: string;
  status: string;
}
