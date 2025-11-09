import { useState, useRef } from 'react';
import { Settings } from '@/types/pos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { exportToJSON, exportToCSV, importFromJSON } from '@/utils/storage';
import { Product } from '@/types/pos';
import { toast } from '@/hooks/use-toast';

interface SettingsTabProps {
  settings: Settings;
  products: Product[];
  onUpdateSettings: (settings: Settings) => void;
  onImportData: (products: Product[], settings: Settings) => void;
}

export const SettingsTab = ({ settings, products, onUpdateSettings, onImportData }: SettingsTabProps) => {
  const [formData, setFormData] = useState(settings);
  const [importModal, setImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<{ products: Product[]; settings: Settings } | null>(null);

  const handleSave = () => {
    onUpdateSettings(formData);
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.'
    });
  };

  const handleExportJSON = () => {
    const jsonData = exportToJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvData = exportToCSV(products);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = importFromJSON(jsonString);
        setPendingImport(data);
        setImportModal(true);
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'Invalid backup file format.',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (pendingImport) {
      onImportData(pendingImport.products, pendingImport.settings);
      setFormData(pendingImport.settings);
      toast({
        title: 'Import Successful',
        description: 'Your data has been restored from backup.'
      });
    }
    setImportModal(false);
    setPendingImport(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Receipt Settings</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopPhone">Shop Phone</Label>
              <Input
                id="shopPhone"
                value={formData.shopPhone}
                onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopAddress">Shop Address</Label>
            <Input
              id="shopAddress"
              value={formData.shopAddress}
              onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiptFooter">Receipt Footer Note</Label>
            <Input
              id="receiptFooter"
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">POS Settings</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesLayout">Sales Layout</Label>
              <Select
                value={formData.salesLayout}
                onValueChange={(value: 'grid' | 'list') => setFormData({ ...formData, salesLayout: value })}
              >
                <SelectTrigger id="salesLayout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="soundEnabled"
              checked={formData.soundEnabled}
              onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="soundEnabled" className="cursor-pointer">
              Enable sound effects
            </Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        <div className="space-y-3">
          <Button onClick={handleExportJSON} variant="outline" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Export Backup (JSON)
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Export Report (CSV)
          </Button>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Backup (JSON)
            </Button>
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} size="lg" className="w-full">
        Save Settings
      </Button>

      <ConfirmModal
        isOpen={importModal}
        title="Import Data"
        message="This will replace all current products and settings with the backup data. Are you sure?"
        onConfirm={confirmImport}
        onCancel={() => {
          setImportModal(false);
          setPendingImport(null);
        }}
        confirmText="Import"
        cancelText="Cancel"
      />
    </div>
  );
};
