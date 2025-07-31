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
import { saveReceipt, loadSavedReceipts } from '../../services/storageService';
import { ReceiptData } from '../../types/receipt';
import { formatForLLM } from '../../utils/receiptUtils';


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
      const result = await runOCR(uri); // result.text is raw OCR output
      const formattedText = formatForLLM(result.text); // Apply preprocessing and line formatting

      // Send to your Cloudflare Worker (or wherever your LLM lives)
      const response = await fetch("https://lastprice-llm.nonelabs.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_KEY_HERE", // optional
        },
        body: JSON.stringify({ prompt: formattedText }),
      });

      const parsedData = await response.json(); // Expected to be [{item: "...", price: 0.99}]

      if (!Array.isArray(parsedData)) {
        Alert.alert('Parsing failed', 'Could not understand the receipt.');
        console.log("Raw output:", parsedData.raw || parsedData);
        return;
      }

      const newReceipt: ReceiptData = {
        id: Date.now(),
        store: '', // Preencha se tiver OCR do nome do local
        date: '',  // Preencha se tiver OCR da data
        items: parsedData.map((item, index) => ({
          id: index + 1,
          name: item.name || '',
          price: typeof item.price === 'number' ? item.price : 0,
        })),
        total: parsedData.reduce((sum, item) => sum + (item.price || 0), 0),
        timestamp: new Date().toISOString(),
      };

      setReceiptData(newReceipt);
      setEditMode(true);
    } catch (error) {
      console.error(error);
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