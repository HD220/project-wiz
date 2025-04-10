import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import PairingScreen from './src/screens/PairingScreen';
import StatusScreen from './src/screens/StatusScreen';

export default function App() {
  const [paired, setPaired] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {paired ? (
        <StatusScreen />
      ) : (
        <PairingScreen onPaired={() => setPaired(true)} />
      )}
    </View>
  );
}