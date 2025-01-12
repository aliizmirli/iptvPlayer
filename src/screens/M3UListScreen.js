import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { createStreamUrl } from '../utils/streamUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const M3UListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [links, setLinks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isStreamCode, setIsStreamCode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const savedLinks = await AsyncStorage.getItem('m3u_links');
      if (savedLinks) {
        setLinks(JSON.parse(savedLinks));
      }
    } catch (error) {
      Alert.alert('Hata', 'Linkler yüklenirken bir hata oluştu.');
    }
  };

  const saveLink = async () => {
    if (!isStreamCode && !newLinkUrl) {
      Alert.alert('Hata', 'Lütfen M3U linkini girin.');
      return;
    }
    
    if (isStreamCode && (!username || !password || !serverUrl)) {
      Alert.alert('Hata', 'Lütfen sunucu adresi, kullanıcı adı ve şifreyi girin.');
      return;
    }

    try {
      const newLink = {
        name: newLinkName || 'Yeni Liste',
        type: isStreamCode ? 'stream' : 'm3u',
        url: isStreamCode ? '' : newLinkUrl,
        username: isStreamCode ? username : '',
        password: isStreamCode ? password : '',
        serverUrl: isStreamCode ? serverUrl : '',
        createdAt: new Date().toISOString()
      };

      const updatedLinks = [...links, newLink];
      await AsyncStorage.setItem('m3u_links', JSON.stringify(updatedLinks));
      setLinks(updatedLinks);
      clearForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Hata', 'Link kaydedilirken bir hata oluştu.');
    }
  };

  const deleteLink = async (index) => {
    try {
      const updatedLinks = links.filter((_, i) => i !== index);
      await AsyncStorage.setItem('m3u_links', JSON.stringify(updatedLinks));
      setLinks(updatedLinks);
    } catch (error) {
      Alert.alert('Hata', 'Link silinirken bir hata oluştu.');
    }
  };

  const clearForm = () => {
    setNewLinkName('');
    setNewLinkUrl('');
    setUsername('');
    setPassword('');
    setServerUrl('');
    setIsStreamCode(false);
  };

  const handleLinkPress = (item) => {
    if (item.type === 'stream') {
      try {
        const streamUrl = createStreamUrl(item.username, item.password, item.serverUrl);
        navigation.navigate('Categories', { m3uLink: streamUrl });
      } catch (error) {
        Alert.alert('Hata', error.message);
      }
    } else {
      navigation.navigate('Categories', { m3uLink: item.url });
    }
  };

  const renderHeader = () => (
    <Animated.View style={[
      styles.header,
      {
        paddingTop: insets.top,
        transform: [{
          translateY: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -50],
            extrapolate: 'clamp'
          })
        }]
      }
    ]}>
      <View style={styles.headerContent}>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons 
            name="live-tv" 
            size={32} 
            color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'} 
            style={styles.headerIcon}
          />
          <View>
            <Text style={styles.headerSubtitle}>Hoş Geldiniz</Text>
            <Text style={styles.headerTitle}>IPTV Listelerim</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons 
            name="playlist-add" 
            size={28} 
            color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.linkItem}
      onPress={() => handleLinkPress(item)}
    >
      <View style={styles.linkContent}>
        <View style={styles.linkIconContainer}>
          <MaterialIcons 
            name={item.type === 'stream' ? 'stream' : 'playlist-play'} 
            size={28} 
            color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'} 
          />
        </View>
        <View style={styles.linkInfo}>
          <Text style={styles.linkName}>{item.name}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            {item.type === 'stream' 
              ? `${item.serverUrl} • ${item.username}` 
              : item.url}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteLink(index)}
        >
          <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      <Animated.FlatList
        data={links}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: 100 } // Header yüksekliği kadar padding
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name="playlist-add" 
              size={64} 
              color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'} 
            />
            <Text style={styles.emptyText}>
              Henüz liste eklenmemiş
            </Text>
            <Text style={styles.emptySubText}>
              M3U veya Stream Code ile yeni liste ekleyebilirsiniz
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          clearForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Liste Ekle</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <MaterialIcons name="label" size={22} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Liste Adı"
                  value={newLinkName}
                  onChangeText={setNewLinkName}
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsStreamCode(!isStreamCode)}
              >
                <MaterialIcons
                  name={isStreamCode ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'}
                />
                <Text style={styles.toggleText}>Stream Code Kullan</Text>
              </TouchableOpacity>

              {isStreamCode ? (
                <>
                  <View style={styles.inputGroup}>
                    <MaterialIcons name="dns" size={22} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Sunucu Adresi"
                      value={serverUrl}
                      onChangeText={setServerUrl}
                      autoCapitalize="none"
                      keyboardType="url"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <MaterialIcons name="person" size={22} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Kullanıcı Adı"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <MaterialIcons name="lock" size={22} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Şifre"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholderTextColor="#999"
                    />
                  </View>
                </>
              ) : (
                <View style={styles.inputGroup}>
                  <MaterialIcons name="link" size={22} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="M3U Link"
                    value={newLinkUrl}
                    onChangeText={setNewLinkUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                    placeholderTextColor="#999"
                  />
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveLink}
              >
                <MaterialIcons name="check" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#f2f2f7' : '#fafafa',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(242, 242, 247, 0.95)' : '#fff',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
    ...Platform.select({
      ios: {
        marginTop: 2,
      },
    }),
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'ios' ? 13 : 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
    letterSpacing: Platform.OS === 'ios' ? -0.2 : 0,
  },
  headerTitle: {
    fontSize: Platform.OS === 'ios' ? 22 : 20,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: '#000',
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 122, 255, 0.1)' : '#f5f5f5',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  listContainer: {
    padding: 16,
  },
  linkItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 122, 255, 0.1)' : '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
    marginRight: 12,
  },
  linkName: {
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    color: '#000',
    marginBottom: 4,
    letterSpacing: Platform.OS === 'ios' ? -0.4 : 0,
  },
  linkUrl: {
    fontSize: Platform.OS === 'ios' ? 15 : 14,
    color: '#666',
    letterSpacing: Platform.OS === 'ios' ? -0.2 : 0,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  emptySubText: {
    fontSize: Platform.OS === 'ios' ? 15 : 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: Platform.OS === 'ios' ? -0.2 : 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  modalTitle: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    color: '#000',
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#f2f2f7' : '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#e5e5ea',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: Platform.OS === 'ios' ? 12 : 10,
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    color: '#000',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#f2f2f7' : '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  toggleText: {
    marginLeft: 12,
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    color: '#000',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 12,
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default M3UListScreen; 