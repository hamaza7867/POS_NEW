import { Transaction } from '@/types/pos';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Receipt } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
      </div>

      <ScrollArea className="h-[400px]">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="p-4 bg-secondary/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleString('en-PK', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    PKR {transaction.total.toFixed(2)}
                  </div>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  {transaction.items.map((item, idx) => (
                    <div key={idx}>
                      {item.name} x{item.quantity}
                    </div>
                  ))}
                </div>
                {transaction.discount > 0 && (
                  <div className="text-xs text-success mt-2">
                    Discount: PKR {transaction.discount.toFixed(2)}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
