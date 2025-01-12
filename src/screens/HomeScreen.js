import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [m3uLinks, setM3ULinks] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadM3ULinks();
    }, [])
  );

  const loadM3ULinks = async () => {
    try {
      const links = await AsyncStorage.getItem('m3u_links');
      if (links) {
        setM3ULinks(JSON.parse(links));
      }
    } catch (error) {
      Alert.alert('Hata', 'M3U linkleri yüklenirken bir hata oluştu.');
    }
  };

  const deleteM3ULink = async (link) => {
    try {
      const updatedLinks = m3uLinks.filter(l => l !== link);
      await AsyncStorage.setItem('m3u_links', JSON.stringify(updatedLinks));
      setM3ULinks(updatedLinks);
      Alert.alert('Başarılı', 'M3U linki silindi.');
    } catch (error) {
      Alert.alert('Hata', 'M3U linki silinirken bir hata oluştu.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.linkItem}>
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => navigation.navigate('Categories', { m3uLink: item })}
      >
        <Text style={styles.linkText} numberOfLines={1}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteM3ULink(item)}
      >
        <Icon name="delete" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={m3uLinks}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz M3U linki eklenmemiş.</Text>
        }
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddM3U')}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  linkItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  linkButton: {
    flex: 1,
    marginRight: 10,
  },
  linkText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen; 