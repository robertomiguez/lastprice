import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReceiptData } from '../types/receipt';

const STORAGE_KEY = 'saved_receipts';

export const saveReceipt = async (receiptData: ReceiptData): Promise<void> => {
  try {
    const existingReceipts = await loadSavedReceipts();
    const updatedReceipts = [receiptData, ...existingReceipts];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReceipts));
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw new Error('Failed to save receipt');
  }
};

export const loadSavedReceipts = async (): Promise<ReceiptData[]> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading receipts:', error);
    return [];
  }
};

export const deleteReceipt = async (receiptId: number): Promise<void> => {
  try {
    const existingReceipts = await loadSavedReceipts();
    const updatedReceipts = existingReceipts.filter(receipt => receipt.id !== receiptId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReceipts));
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw new Error('Failed to delete receipt');
  }
};

export const clearAllReceipts = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all receipts:', error);
    throw new Error('Failed to clear all receipts');
  }
};