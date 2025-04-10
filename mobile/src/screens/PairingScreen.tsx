import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
// Placeholder para QR code scanner
// Em projeto real, usar react-native-camera ou expo-camera
// Aqui, simula leitura do QR code

interface Props {
  onPaired: () => void;
}

export default function PairingScreen({ onPaired }: Props) {
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    // Simula leitura do QR code e armazenamento do token
    // Em produção, usar scanner real e extrair token + URL
    import('../storage/tokenStorage').then(({ saveToken }) => {
      saveToken('http://localhost:3001', 'TOKEN_EXEMPLO');
      setScanned(true);
      onPaired();
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vincular com o Desktop</Text>
      {!scanned ? (
        <Button title="Simular leitura QR code" onPress={handleScan} />
      ) : (
        <Text>Dispositivo vinculado!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
});