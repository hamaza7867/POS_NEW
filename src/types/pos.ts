export interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface Settings {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  receiptFooter: string;
  taxRate: number;
  salesLayout: 'grid' | 'list';
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  shopName: 'My Shop',
  shopAddress: '123 Main Street',
  shopPhone: '+92 300 1234567',
  receiptFooter: 'Thank you for your business!',
  taxRate: 10,
  salesLayout: 'grid',
  soundEnabled: true
};
