import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Share2, Eye, Smartphone, X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  onPrint: () => void;
  onShare: (phone?: string) => void;
  onView: () => void;
  onCancel: () => void;
}

export const PaymentModal = ({
  isOpen,
  total,
  onPrint,
  onShare,
  onView,
  onCancel
}: PaymentModalProps) => {
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  if (!isOpen) return null;

  const handleShareClick = () => {
    if (showPhoneInput && whatsappPhone) {
      onShare(whatsappPhone);
      setShowPhoneInput(false);
      setWhatsappPhone('');
    } else {
      setShowPhoneInput(true);
    }
  };

  const quickShareWithoutPhone = () => {
    onShare();
    setShowPhoneInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-md p-6 space-y-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Payment Complete</h3>
          <div className="text-3xl font-bold text-primary">
            PKR {total.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Choose receipt delivery method</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={onPrint}
            size="lg"
            className="w-full justify-start gap-3 h-auto py-4"
          >
            <Printer className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Print Receipt</div>
              <div className="text-xs opacity-80">Thermal printer or PDF</div>
            </div>
          </Button>

          {!showPhoneInput ? (
            <Button
              onClick={handleShareClick}
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3 h-auto py-4"
            >
              <Share2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Share via WhatsApp</div>
                <div className="text-xs opacity-70">Send to customer phone</div>
              </div>
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Customer WhatsApp Number (optional)
              </Label>
              <Input
                id="whatsapp-phone"
                type="tel"
                placeholder="+92 300 1234567"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="text-base"
              />
              <div className="flex gap-2">
                <Button onClick={handleShareClick} size="sm" className="flex-1">
                  Send to Number
                </Button>
                <Button onClick={quickShareWithoutPhone} variant="outline" size="sm" className="flex-1">
                  Share Link Only
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={onView}
            variant="outline"
            size="lg"
            className="w-full justify-start gap-3 h-auto py-4"
          >
            <Eye className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">View Receipt</div>
              <div className="text-xs opacity-70">Open in new window</div>
            </div>
          </Button>
        </div>

        <Button variant="secondary" onClick={onCancel} className="w-full">
          Close
        </Button>
      </Card>
    </div>
  );
};
