import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReceiptData } from '../types/receipt';

interface ReceiptEditorProps {
  receiptData: ReceiptData;
  onUpdateData: (data: ReceiptData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ReceiptEditor: React.FC<ReceiptEditorProps> = ({
  receiptData,
  onUpdateData,
  onSave,
  onCancel
}) => {
  // Update receipt data
  const updateReceiptData = (field: keyof ReceiptData, value: any) => {
    onUpdateData({
      ...receiptData,
      [field]: value
    });
  };

  // Update item in receipt
  const updateItem = (itemId: number, field: string, value: any) => {
    const updatedItems = receiptData.items.map(item => 
      item.id === itemId 
        ? { ...item, [field]: field === 'price' ? parseFloat(value) || 0 : value }
        : item
    );
    onUpdateData({ ...receiptData, items: updatedItems });
  };

  // Remove item from receipt
  const removeItem = (itemId: number) => {
    const updatedItems = receiptData.items.filter(item => item.id !== itemId);
    onUpdateData({ ...receiptData, items: updatedItems });
  };

  // Add new item
  const addItem = () => {
    const newItem = {
      id: Date.now() + Math.random(),
      name: 'New Item',
      price: 0
    };
    onUpdateData({
      ...receiptData,
      items: [...receiptData.items, newItem]
    });
  };

  // Calculate total from items
  const calculateTotal = () => {
    return receiptData.items.reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <View style={styles.editContainer}>
      <Text style={styles.sectionTitle}>✏️ Edit Receipt Data</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Store Name:</Text>
        <TextInput
          style={styles.input}
          value={receiptData.store}
          onChangeText={(text) => updateReceiptData('store', text)}
          placeholder="Store name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date:</Text>
        <TextInput
          style={styles.input}
          value={receiptData.date}
          onChangeText={(text) => updateReceiptData('date', text)}
          placeholder="Receipt date"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Items:</Text>
        {receiptData.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              value={item.name}
              onChangeText={(text) => updateItem(item.id, 'name', text)}
              placeholder="Item name"
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 10 }]}
              value={item.price.toString()}
              onChangeText={(text) => updateItem(item.id, 'price', text)}
              placeholder="Price"
              keyboardType="decimal-pad"
            />
            <TouchableOpacity 
              onPress={() => removeItem(item.id)}
              style={styles.removeButton}
            >
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity onPress={addItem} style={styles.addItemButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addItemText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          💰 Calculated Total: ${calculateTotal().toFixed(2)}
        </Text>
        {receiptData.total && (
          <Text style={styles.extractedTotal}>
            🤖 Extracted Total: ${receiptData.total.toFixed(2)}
          </Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Receipt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={20} color="white" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addItemButton: {
    backgroundColor: '#17a2b8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  addItemText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  totalContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 10,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  extractedTotal: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    flex: 0.48,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    flex: 0.48,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
});