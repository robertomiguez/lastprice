import TextRecognition from '@react-native-ml-kit/text-recognition';
import { OCRResult } from '../types/receipt';

export const runOCR = async (imageUri: string): Promise<OCRResult> => {
  if (!imageUri || typeof imageUri !== 'string') {
    throw new Error('Invalid image URI provided');
  }

  try {
    console.log('Running ML Kit OCR on image:', imageUri);
    
    const result = await TextRecognition.recognize(imageUri);
    
    console.log('ML Kit OCR result:', result.text);
    
    return { text: result.text.trim() };
  } catch (err) {
    console.error('ML Kit OCR Error:', err);
    throw new Error(`OCR processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};