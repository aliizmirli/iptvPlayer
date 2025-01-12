import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddM3UScreen = ({ navigation }) => {
  const [m3uLink, setM3ULink] = useState('');

  const validateAndSaveM3ULink = async () => {
    if (!m3uLink) {
      Alert.alert('Hata', 'Lütfen bir M3U linki girin.');
      return;
    }

    try {
      // M3U linkini doğrula
      const response = await fetch(m3uLink);
      const content = await response.text();
      
      if (!content.includes('#EXTM3U')) {
        Alert.alert('Hata', 'Geçersiz M3U linki.');
        return;
      }

      // Mevcut linkleri al
      const existingLinks = await AsyncStorage.getItem('m3u_links');
      const links = existingLinks ? JSON.parse(existingLinks) : [];
      
      // Yeni linki ekle
      if (!links.includes(m3uLink)) {
        links.push(m3uLink);
        await AsyncStorage.setItem('m3u_links', JSON.stringify(links));
        Alert.alert(
          'Başarılı',
          'M3U linki başarıyla eklendi!',
          [
            {
              text: 'Tamam',
              onPress: () => {
                setM3ULink('');
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Uyarı', 'Bu M3U linki zaten eklenmiş.');
      }
    } catch (error) {
      console.error('Link ekleme hatası:', error);
      Alert.alert('Hata', 'Link eklenirken bir hata oluştu. Lütfen linki kontrol edin.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="M3U Linki Girin"
        value={m3uLink}
        onChangeText={setM3ULink}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.button} onPress={validateAndSaveM3ULink}>
        <Text style={styles.buttonText}>Ekle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddM3UScreen; 