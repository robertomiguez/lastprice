import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ReceiptData } from '../types/receipt';
import { deleteReceipt, clearAllReceipts } from '../services/storageService';

interface SavedReceiptsProps {
  receipts: ReceiptData[];
  onRefresh: () => Promise<void>;
}

export const SavedReceipts: React.FC<SavedReceiptsProps> = ({ receipts, onRefresh }) => {
  const handleDeleteReceipt = (receiptId: number, storeName: string) => {
    Alert.alert(
      'Delete Receipt',
      `Are you sure you want to delete the receipt from ${storeName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReceipt(receiptId);
              await onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  const handleClearAllReceipts = () => {
    if (receipts.length === 0) {
      Alert.alert('No Receipts', 'There are no receipts to clear.');
      return;
    }

    Alert.alert(
      'Clear All Receipts',
      `Are you sure you want to delete all ${receipts.length} receipts? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllReceipts();
              await onRefresh();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear all receipts');
            }
          },
        },
      ]
    );
  };

  const renderReceiptCard = (item: ReceiptData) => (
    <View key={item.id} style={styles.receiptCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.receiptStore}>{item.store}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.receiptDate}>{item.date}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReceipt(item.id, item.store)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.receiptTotal}>
        💰 Total: ${item.total ? item.total.toFixed(2) : 'N/A'}
      </Text>
      <Text style={styles.receiptItems}>
        📦 {item.items.length} items
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>📄</Text>
      <Text style={styles.emptyStateTitle}>No Receipts Saved</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your saved receipts will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.savedContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>📋 Saved Receipts</Text>
        {receipts.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAllReceipts}
          >
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {receipts.length === 0 ? (
        renderEmptyState()
      ) : (
        <View>
          {receipts.map(renderReceiptCard)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  savedContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  receiptCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  receiptTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  receiptItems: {
    fontSize: 13,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});