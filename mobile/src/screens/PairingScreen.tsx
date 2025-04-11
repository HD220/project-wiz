import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

// Placeholder para QR code scanner
// Em projeto real, usar react-native-camera ou expo-camera
// Aqui, simula leitura do QR code

interface Props {
  onPaired: () => void;
}

export default function PairingScreen({ onPaired }: Props) {
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    try {
      const storage = await import('../storage/tokenStorage');
      await storage.saveToken('http://localhost:3001', 'TOKEN_EXEMPLO');
      setScanned(true);
      onPaired();
    } catch (err) {
      console.error('Error during pairing:', err);
      setError('Failed to save credentials. Please try again.');
      Alert.alert('Error', 'Failed to save credentials. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vincular com o Desktop</Text>
      {!scanned ? (
        <Button title="Simular leitura QR code" onPress={handleScan} />
      ) : (
        <Text>Dispositivo vinculado!</Text>
      )}
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
});