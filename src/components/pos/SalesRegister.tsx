import { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, Settings, Transaction } from '@/types/pos';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Trash2, Search, Tag, Calculator } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { PaymentModal } from './PaymentModal';
import { generateReceiptHTML, printReceipt, shareReceiptViaWhatsApp, openReceiptView } from '@/utils/receipt';
import { saveTransaction, playSound } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

interface SalesRegisterProps {
  products: Product[];
  settings: Settings;
}

export const SalesRegister = ({ products, settings }: SalesRegisterProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showClearModal, setShowClearModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, searchQuery, categoryFilter, sortBy]);

  const addToCart = (product: Product) => {
    if (settings.soundEnabled) playSound('beep');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    if (settings.soundEnabled && delta !== 0) playSound('beep');
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const discountAmount = discountType === 'percent' 
    ? (subtotal * discount) / 100 
    : discount;
  
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = (afterDiscount * settings.taxRate) / 100;
  const total = afterDiscount + tax;

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const confirmClearCart = () => {
    setCart([]);
    setDiscount(0);
    setShowClearModal(false);
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePrint = async () => {
    const receiptHTML = generateReceiptHTML(cart, subtotal, tax, discountAmount, total, settings);
    const success = await printReceipt(receiptHTML);
    
    if (success) {
      if (settings.soundEnabled) playSound('success');
      
      const transaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: [...cart],
        subtotal,
        tax,
        discount: discountAmount,
        total
      };
      
      saveTransaction(transaction);
      
      setCart([]);
      setDiscount(0);
      setShowPaymentModal(false);
      
      toast({
        title: 'Transaction Complete',
        description: `Total: PKR ${total.toFixed(2)}`
      });
    } else {
      toast({
        title: 'Print Failed',
        description: 'Please enable popups or try another method',
        variant: 'destructive'
      });
    }
  };

  const handleShare = (phone?: string) => {
    shareReceiptViaWhatsApp(cart, subtotal, tax, discountAmount, total, settings, phone);
    
    if (settings.soundEnabled) playSound('success');
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmount,
      total
    };
    
    saveTransaction(transaction);
    
    setCart([]);
    setDiscount(0);
    setShowPaymentModal(false);
    
    toast({
      title: 'Transaction Complete',
      description: 'Receipt shared via WhatsApp'
    });
  };

  const handleView = () => {
    const receiptHTML = generateReceiptHTML(cart, subtotal, tax, discountAmount, total, settings);
    openReceiptView(receiptHTML);
    
    if (settings.soundEnabled) playSound('success');
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmount,
      total
    };
    
    saveTransaction(transaction);
    
    setCart([]);
    setDiscount(0);
    setShowPaymentModal(false);
    
    toast({
      title: 'Transaction Complete',
      description: 'Receipt opened in new window'
    });
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && cart.length > 0 && !showPaymentModal) {
        handlePayment();
      }
      if (e.key === 'Escape') {
        if (showPaymentModal) {
          setShowPaymentModal(false);
        } else if (cart.length > 0) {
          setShowClearModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, showPaymentModal]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low-High)</SelectItem>
              <SelectItem value="price-desc">Price (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={settings.salesLayout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'space-y-2'}>
          {filteredAndSortedProducts.map(product => (
            <Card
              key={product.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              onClick={() => addToCart(product)}
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
                {product.category && (
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                    {product.category}
                  </span>
                )}
                <p className="text-lg font-bold text-primary">PKR {product.price.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No products found</p>
          </Card>
        )}
      </div>

      <div className="lg:sticky lg:top-4 h-fit">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingCart className="h-5 w-5" />
            <span>Current Sale</span>
            {cart.length > 0 && (
              <span className="ml-auto text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">PKR {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Discount</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="flex-1"
                />
                <Select value={discountType} onValueChange={(v: 'amount' | 'percent') => setDiscountType(v)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">PKR</SelectItem>
                    <SelectItem value="percent">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDiscountType('amount');
                      setDiscount(amount);
                    }}
                    className="text-xs"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">PKR {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount:</span>
                <span className="font-medium">-PKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Tax ({settings.taxRate}%):</span>
              <span className="font-medium">PKR {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-primary">PKR {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={cart.length === 0}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Complete Payment
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearCart}
              disabled={cart.length === 0}
            >
              Clear Cart
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Press Enter to pay • Esc to clear
          </p>
        </Card>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        title="Clear Cart"
        message="Are you sure you want to clear all items from the cart?"
        onConfirm={confirmClearCart}
        onCancel={() => setShowClearModal(false)}
        confirmText="Clear"
        cancelText="Cancel"
      />

      <PaymentModal
        isOpen={showPaymentModal}
        total={total}
        onPrint={handlePrint}
        onShare={handleShare}
        onView={handleView}
        onCancel={() => setShowPaymentModal(false)}
      />
    </div>
  );
};
