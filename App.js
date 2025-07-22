import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './app/(public)/navigation/BottomTabs';

export default function App() {
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
}
