export interface ReceiptItem {
  id: number;
  name: string;
  price: number;
}

export interface ReceiptData {
  id: number;
  store: string;
  date: string;
  total: number | null;
  items: ReceiptItem[];
  timestamp: string;
}

export interface OCRResult {
  text: string;
}