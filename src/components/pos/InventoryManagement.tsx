import { useState } from 'react';
import { Product } from '@/types/pos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { generateSKU } from '@/utils/storage';

interface InventoryManagementProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const InventoryManagement = ({ products, onAddProduct, onDeleteProduct }: InventoryManagementProps) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sku: '',
    category: ''
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      sku: formData.sku || generateSKU(),
      category: formData.category
    };

    onAddProduct(newProduct);
    setFormData({ name: '', price: '', sku: '', category: '' });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, productId: id });
  };

  const confirmDelete = () => {
    if (deleteModal.productId) {
      onDeleteProduct(deleteModal.productId);
    }
    setDeleteModal({ isOpen: false, productId: null });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (PKR) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (optional)</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Add Product
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold">Name</th>
                <th className="text-left py-3 px-2 font-semibold">Price</th>
                <th className="text-left py-3 px-2 font-semibold">SKU</th>
                <th className="text-left py-3 px-2 font-semibold">Category</th>
                <th className="text-left py-3 px-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No products added yet
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-2">{product.name}</td>
                    <td className="py-3 px-2">PKR {product.price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="py-3 px-2">
                      {product.category && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary">
                          {product.category}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, productId: null })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};
