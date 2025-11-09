import { Product, Settings, DEFAULT_SETTINGS, Transaction } from '@/types/pos';

const PRODUCTS_KEY = 'pos_products';
const SETTINGS_KEY = 'pos_settings';
const TRANSACTIONS_KEY = 'pos_transactions';

export const loadProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const loadSettings = (): Settings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const generateSKU = (): string => {
  return `item-${Date.now()}`;
};

export const exportToJSON = (): string => {
  const data = {
    products: loadProducts(),
    settings: loadSettings(),
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const exportToCSV = (products: Product[]): string => {
  const headers = ['Name', 'Price', 'SKU', 'Category'];
  const rows = products.map(p => [
    p.name,
    p.price.toString(),
    p.sku,
    p.category
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

export const importFromJSON = (jsonString: string): { products: Product[]; settings: Settings } => {
  const data = JSON.parse(jsonString);
  return {
    products: data.products || [],
    settings: data.settings || DEFAULT_SETTINGS
  };
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = loadTransactions();
  transactions.unshift(transaction);
  if (transactions.length > 100) {
    transactions.pop();
  }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const playSound = (type: 'success' | 'error' | 'beep') => {
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  if (type === 'success') {
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  } else if (type === 'beep') {
    oscillator.frequency.value = 600;
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  }
};
