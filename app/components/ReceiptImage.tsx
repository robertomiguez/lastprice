import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface ReceiptImageProps {
  uri: string;
}

export const ReceiptImage: React.FC<ReceiptImageProps> = ({ uri }) => {
  return (
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri }} 
        style={styles.receiptImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 10,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
});