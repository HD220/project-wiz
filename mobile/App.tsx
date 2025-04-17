import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import PairingScreen from './src/screens/PairingScreen';
import StatusScreen from './src/screens/StatusScreen';
import { configureCertificatePinning } from './src/utils/security/CertificatePinning';
import { TokenService } from './src/utils/security/SecureStorage';

export default function App() {
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    // Inicializa as configurações de segurança
    configureCertificatePinning();
    
    // Limpa tokens antigos ao iniciar o app
    TokenService.clearTokens().catch(console.error);
  }, []);

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