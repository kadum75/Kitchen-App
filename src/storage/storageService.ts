/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CleaningLog, TemperatureEntry, ExpiryItem, WasteEntry, TASKS, CorrectiveAction, CookingEntry } from '../types';

const CLEANING_BOX = 'cleaning_logs_box';
const TEMPERATURE_BOX = 'temperature_logs_box';
const COOKING_BOX = 'cooking_logs_box';
const EXPIRY_BOX = 'expiry_items_box';
const WASTE_KEY = 'waste_logs';
const CORRECTIVE_ACTIONS_KEY = 'corrective_actions';

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
    return getExpiryEntries();
  },

  saveExpiryItem(item: ExpiryItem): void {
    saveExpiryEntry(item);
  },

  deleteExpiryItem(id: string): void {
    deleteExpiryEntry(id);
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
  },

  // Corrective Actions
  getCorrectiveActions(): CorrectiveAction[] {
    try {
      const data = localStorage.getItem(CORRECTIVE_ACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing corrective actions:', e);
      return [];
    }
  },

  saveCorrectiveAction(action: CorrectiveAction): void {
    const actions = this.getCorrectiveActions();
    actions.unshift(action);
    localStorage.setItem(CORRECTIVE_ACTIONS_KEY, JSON.stringify(actions));
  },

  // Cooking Logs
  getCookingLogs(): CookingEntry[] {
    try {
      const data = localStorage.getItem(COOKING_BOX);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing cooking logs:', e);
      return [];
    }
  },

  saveCookingEntry(entry: CookingEntry): void {
    const logs = this.getCookingLogs();
    logs.unshift(entry);
    localStorage.setItem(COOKING_BOX, JSON.stringify(logs));
  },

  seedTestData(): void {
    // Check if already seeded (using a dedicated key)
    if (localStorage.getItem('app_seeded_v3')) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 24);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 1. Temperature readings (User requested specific entries)
    const tempEntries: TemperatureEntry[] = [
      { 
        id: 't-user-1', 
        timestamp: new Date('2026-02-28T07:30:00').getTime(), 
        type: 'FRIDGE', 
        value: 3.2, 
        equipmentNumber: 'Fridge 1', 
        location: 'Main Kitchen', 
        item: 'Cooked chicken', 
        staffName: 'AB', 
        action: 'No action needed' 
      },
      { 
        id: 't-user-2', 
        timestamp: new Date('2026-02-28T17:45:00').getTime(), 
        type: 'FRIDGE', 
        value: 6.5, 
        equipmentNumber: 'Fridge 1', 
        location: 'Main Kitchen', 
        item: 'Dairy (milk)', 
        staffName: 'EF', 
        action: 'Door seal checked, rechecked 30 min later: 4.1°C' 
      },
      { 
        id: 't-user-3', 
        timestamp: new Date('2026-02-28T07:30:00').getTime(), 
        type: 'FREEZER', 
        value: -16.8, 
        equipmentNumber: 'Freezer 1', 
        location: 'Walk-in Store', 
        item: 'Frozen prawns', 
        staffName: 'IJ', 
        action: 'Door closed, stock rearranged, recheck 1hr: -19.1°C' 
      },
      { id: 't1', timestamp: now.getTime() - 1000 * 60 * 30, type: 'FRIDGE', value: 3.0, equipmentNumber: 'FRIDGE-01' },
      { id: 't2', timestamp: now.getTime() - 1000 * 60 * 60 * 2, type: 'FREEZER', value: -18.0, equipmentNumber: 'FREEZER-01' },
      { id: 't3', timestamp: now.getTime() - 1000 * 60 * 60 * 5, type: 'HOT_HOLD', value: 68.0, equipmentNumber: 'HH-01' }
    ];
    localStorage.setItem(TEMPERATURE_BOX, JSON.stringify(tempEntries));

    // 2. Cooking Logs (User requested specific entries)
    const cookingEntries: CookingEntry[] = [
      {
        id: 'c-user-1',
        timestamp: '2026-02-28T11:45:00',
        item: 'Chicken curry',
        batch: 'Batch CC-102',
        targetTemp: 75,
        actualTemp: 78.5,
        probe: 'Probe P-01',
        operator: 'KL',
        status: 'Released for service'
      },
      {
        id: 'c-user-2',
        timestamp: '2026-02-28T12:10:00',
        item: 'Beef lasagne',
        batch: 'Batch BL-056',
        targetTemp: 75,
        actualTemp: 71.2,
        probe: 'Probe P-01',
        operator: 'KL',
        status: 'Returned to oven, reheated to 80.4°C'
      }
    ];
    localStorage.setItem(COOKING_BOX, JSON.stringify(cookingEntries));

    // 3. Expiry Items (User requested specific entries)
    const expiryItems: ExpiryItem[] = [
      { id: 'e-user-1', itemName: 'Fresh chicken fillets 5kg', prepDate: '2026-02-27', expDate: '2026-03-01', status: 'ACTIVE' },
      { id: 'e-user-2', itemName: 'Double cream 1L', prepDate: '2026-02-24', expDate: '2026-02-28', status: 'EXPIRES SOON' },
      { id: 'e-user-3', itemName: 'Pesto sauce 500g', prepDate: '2026-02-15', expDate: '2026-02-26', status: 'EXPIRED' },
      { id: 'e1', itemName: 'Whole Milk', prepDate: todayStr, expDate: todayStr, status: 'EXPIRES SOON' },
      { id: 'e2', itemName: 'Cheddar Cheese', prepDate: todayStr, expDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], status: 'ACTIVE' }
    ];
    localStorage.setItem(EXPIRY_BOX, JSON.stringify(expiryItems));

    // 4. Corrective Actions (User requested specific entries)
    const correctiveActions: CorrectiveAction[] = [
      {
        id: 'ca-user-1',
        timestamp: '2026-02-28T17:45:00',
        ccpType: 'FRIDGE',
        temperature: 6.5,
        action: 'Door seal checked, stock moved',
        notes: 'Fridge 1 temp at 6.5°C',
        staffName: 'EF',
        rootCause: 'door left open',
        prevention: 'staff briefing on door procedure'
      },
      {
        id: 'ca-user-2',
        timestamp: '2026-03-01T09:10:00',
        ccpType: 'EXPIRY',
        action: 'Removed and disposed',
        notes: 'Two pesto jars 3 days past use-by',
        staffName: 'Manager',
        rootCause: 'weekly date checks missed',
        prevention: 'add daily expiry check task'
      }
    ];
    localStorage.setItem(CORRECTIVE_ACTIONS_KEY, JSON.stringify(correctiveActions));

    // 5. Cleaning tasks (spread over last 7 days)
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const tasks: Record<string, boolean> = {};
      TASKS.forEach(task => {
        tasks[task] = Math.random() > 0.3;
      });
      localStorage.setItem(`${CLEANING_BOX}_${dateStr}`, JSON.stringify({ date: dateStr, tasks }));
    }

    // 6. Waste log entries
    const wasteEntries: WasteEntry[] = [
      { id: 'w-user-1', timestamp: '2026-02-26T10:00:00', item: 'Pesto sauce 500g', quantity: '1 unit', reason: 'EXPIRED', notes: 'Discarded from Fridge 2' },
      { id: 'w1', timestamp: now.toISOString(), item: 'Spoiled Milk 500ml', quantity: '1 unit', reason: 'SPOILAGE', notes: 'Smell test failed' }
    ];
    localStorage.setItem(WASTE_KEY, JSON.stringify(wasteEntries));

    // Mark as seeded
    localStorage.setItem('app_seeded_v3', 'true');
  }
};

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

export const getExpiryEntries = (): ExpiryItem[] => {
  try {
    const data = localStorage.getItem(EXPIRY_BOX);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error parsing expiry items:', e);
    return [];
  }
};

export const saveExpiryEntry = (entry: ExpiryItem): void => {
  const items = getExpiryEntries();
  items.push(entry);
  localStorage.setItem(EXPIRY_BOX, JSON.stringify(items));
};

export const deleteExpiryEntry = (id: string): void => {
  const items = getExpiryEntries().filter(i => i.id !== id);
  localStorage.setItem(EXPIRY_BOX, JSON.stringify(items));
};
