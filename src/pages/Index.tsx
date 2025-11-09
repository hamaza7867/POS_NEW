import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesRegister } from '@/components/pos/SalesRegister';
import { InventoryManagement } from '@/components/pos/InventoryManagement';
import { SettingsTab } from '@/components/pos/SettingsTab';
import { TransactionHistory } from '@/components/pos/TransactionHistory';
import { loadProducts, saveProducts, loadSettings, saveSettings, loadTransactions } from '@/utils/storage';
import { Product, Settings, Transaction } from '@/types/pos';
import { ShoppingBag, Package, Settings as SettingsIcon, History } from 'lucide-react';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    setProducts(loadProducts());
    setTransactions(loadTransactions());
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      setTransactions(loadTransactions());
    }
  }, [activeTab]);

  const handleAddProduct = (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    saveProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  };

  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleImportData = (importedProducts: Product[], importedSettings: Settings) => {
    setProducts(importedProducts);
    setSettings(importedSettings);
    saveProducts(importedProducts);
    saveSettings(importedSettings);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">{settings.shopName} - POS System</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <SalesRegister products={products} settings={settings} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryManagement
              products={products}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <TransactionHistory transactions={transactions} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab
              settings={settings}
              products={products}
              onUpdateSettings={handleUpdateSettings}
              onImportData={handleImportData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
