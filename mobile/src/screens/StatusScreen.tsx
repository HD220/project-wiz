import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getToken } from '../storage/tokenStorage';
import axios from 'axios';

export default function StatusScreen() {
  const [status, setStatus] = useState<string | null>(null);

  const fetchStatus = async () => {
    const creds = await getToken();
    if (!creds) {
      setStatus('Não vinculado');
      return;
    }
    try {
      const response = await axios.get(`${creds.url}/status`, {
        headers: { Authorization: `Bearer ${creds.token}` },
      });
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
      setStatus('Erro ao conectar');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status do Bot</Text>
      <Text>{status ?? 'Carregando...'}</Text>
      <Button title="Atualizar" onPress={fetchStatus} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
});