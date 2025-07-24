import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { Header } from '../../components/Header';
import { ScanButton } from '../../components/ScanButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ReceiptImage } from '../../components/ReceiptImage';
import { ReceiptEditor } from '../../components/ReceiptEditor';
import { SavedReceipts } from '../../components/SavedReceipts';
import { runOCR } from '../../services/ocrService';
import { parseReceiptText } from '../../services/receiptParser';
import { saveReceipt, loadSavedReceipts } from '../../services/storageService';
import { ReceiptData } from '../../types/receipt';

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedReceipts, setSavedReceipts] = useState<ReceiptData[]>([]);
  const [editMode, setEditMode] = useState(false);

  // Load saved receipts when app starts
  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const receipts = await loadSavedReceipts();
    setSavedReceipts(receipts);
  };

  // Select image from camera or gallery
  const selectImage = () => {
    Alert.alert(
      'Select Receipt Image',
      'Choose how you want to capture the receipt',
      [
        { text: 'Take Photo', onPress: openCamera },
        { text: 'Choose from Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      processReceipt(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need gallery permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      processReceipt(result.assets[0].uri);
    }
  };

  // Process receipt image
  const processReceipt = async (uri: string) => {
    setLoading(true);
    try {
      const result = await runOCR(uri);
      const parsedData = parseReceiptText(result.text);
      setReceiptData(parsedData);
      setEditMode(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to process receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save receipt handler
  const handleSaveReceipt = async () => {
    if (!receiptData) return;
    
    try {
      await saveReceipt(receiptData);
      await loadReceipts(); // Reload saved receipts
      Alert.alert('Success', 'Receipt saved successfully!');
      setEditMode(false);
      setImageUri(null);
      setReceiptData(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save receipt');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditMode(false);
    setImageUri(null);
    setReceiptData(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Header />
      
      <ScanButton onPress={selectImage} />

      {loading && <LoadingIndicator />}

      {imageUri && <ReceiptImage uri={imageUri} />}

      {receiptData && editMode && (
        <ReceiptEditor
          receiptData={receiptData}
          onUpdateData={setReceiptData}
          onSave={handleSaveReceipt}
          onCancel={handleCancel}
        />
      )}

      {savedReceipts.length > 0 && (
        <SavedReceipts receipts={savedReceipts} onRefresh={loadReceipts}  />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});