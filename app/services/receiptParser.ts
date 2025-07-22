import { ReceiptData, ReceiptItem } from '../types/receipt';

export const parseReceiptText = (text: string): ReceiptData => {
  const lines = text.split('\n').filter(line => line.trim());
  
  const items: ReceiptItem[] = [];
  let total: number | null = null;
  let date: string | null = null;
  let store: string | null = null;
  
  // Find store name (usually first line)
  store = lines[0] || 'Unknown Store';
  
  // Find date
  const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}/;
  const dateLine = lines.find(line => dateRegex.test(line));
  date = dateLine || new Date().toLocaleDateString();
  
  // Find total
  const totalLine = lines.find(line => 
    line.toUpperCase().includes('TOTAL') && 
    /\d+\.\d{2}/.test(line)
  );
  if (totalLine) {
    const totalMatch = totalLine.match(/\d+\.\d{2}/);
    total = totalMatch ? parseFloat(totalMatch[0]) : null;
  }
  
  // Find items (lines with prices)
  const priceRegex = /\d+\.\d{2}/;
  lines.forEach(line => {
    if (priceRegex.test(line) && !line.toUpperCase().includes('TOTAL')) {
      const priceMatch = line.match(/\d+\.\d{2}/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
      const itemName = line.replace(priceMatch![0], '').trim();
      
      if (itemName && itemName.length > 2) {
        items.push({
          id: Date.now() + Math.random(),
          name: itemName,
          price: price
        });
      }
    }
  });
  
  return {
    id: Date.now(),
    store: store,
    date: date,
    total: total,
    items: items,
    timestamp: new Date().toISOString()
  };
};