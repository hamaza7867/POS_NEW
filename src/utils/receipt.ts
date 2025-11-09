import { CartItem, Settings } from '@/types/pos';

export const generateReceiptHTML = (
  cart: CartItem[],
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
  settings: Settings
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          max-width: 280px;
          margin: 0 auto;
          padding: 10px;
          font-size: 12px;
          background: white;
        }
        .center { text-align: center; margin: 5px 0; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .item-row { 
          display: flex; 
          justify-content: space-between; 
          margin: 3px 0;
          gap: 5px;
        }
        .item-name { flex: 1; word-break: break-word; }
        .item-price { white-space: nowrap; }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          margin: 5px 0; 
        }
        .total-bold { font-weight: bold; font-size: 14px; }
        @media print {
          body { padding: 5px; }
          @page { margin: 0; size: 80mm auto; }
        }
      </style>
    </head>
    <body>
      <div class="center bold" style="font-size: 16px;">${settings.shopName}</div>
      <div class="center">${settings.shopAddress}</div>
      <div class="center">${settings.shopPhone}</div>
      <div class="line"></div>
      <div class="center">${new Date().toLocaleString('en-PK', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })}</div>
      <div class="line"></div>
      ${cart.map(item => `
        <div class="item-row">
          <span class="item-name">${item.name} x${item.quantity}</span>
          <span class="item-price">PKR ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
      <div class="line"></div>
      <div class="total-row">
        <span>Subtotal:</span>
        <span>PKR ${subtotal.toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
        <div class="total-row">
          <span>Discount:</span>
          <span>-PKR ${discount.toFixed(2)}</span>
        </div>
      ` : ''}
      <div class="total-row">
        <span>Tax (${settings.taxRate}%):</span>
        <span>PKR ${tax.toFixed(2)}</span>
      </div>
      <div class="line"></div>
      <div class="total-row total-bold">
        <span>TOTAL:</span>
        <span>PKR ${total.toFixed(2)}</span>
      </div>
      <div class="line"></div>
      <div class="center">${settings.receiptFooter}</div>
      <div class="center" style="margin-top: 10px;">www.cyphex.agency</div>
    </body>
    </html>
  `;
};

export const printReceipt = (receiptHTML: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    if (!printWindow) {
      resolve(false);
      return;
    }

    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        
        const checkClosed = setInterval(() => {
          if (printWindow.closed) {
            clearInterval(checkClosed);
            resolve(true);
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkClosed);
          if (!printWindow.closed) {
            printWindow.close();
          }
          resolve(true);
        }, 30000);
      }, 250);
    };
  });
};

export const shareReceiptViaWhatsApp = (
  cart: CartItem[],
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
  settings: Settings,
  phoneNumber?: string
) => {
  const message = `*${settings.shopName}*
${settings.shopAddress}
${settings.shopPhone}

_${new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}_

${cart.map(item => `${item.name} x${item.quantity} - PKR ${(item.price * item.quantity).toFixed(2)}`).join('\n')}

───────────────
Subtotal: PKR ${subtotal.toFixed(2)}
${discount > 0 ? `Discount: -PKR ${discount.toFixed(2)}\n` : ''}Tax (${settings.taxRate}%): PKR ${tax.toFixed(2)}
───────────────
*TOTAL: PKR ${total.toFixed(2)}*

${settings.receiptFooter}`;

  const encodedMessage = encodeURIComponent(message);
  const url = phoneNumber 
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
  
  window.open(url, '_blank');
};

export const openReceiptView = (receiptHTML: string) => {
  const receiptWindow = window.open('', '_blank', 'width=400,height=700');
  if (receiptWindow) {
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  }
};
