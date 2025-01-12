import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const PlayerScreen = ({ route, navigation }) => {
  const { streamUrl, title } = route.params;
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const setupOrientation = async () => {
      // Android için sadece otomatik döndürme, iOS için tüm yönler
      if (Platform.OS === 'android') {
        await ScreenOrientation.unlockAsync();
      } else {
        await ScreenOrientation.unlockAsync();
      }
    };

    setupOrientation();
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      const isLandscape = window.width > window.height;
      setIsFullscreen(isLandscape);
      StatusBar.setHidden(isLandscape);
    });

    // İlk yüklemede başlığı ve kontrolleri gizle
    showControlsTemporarily();

    return () => {
      subscription?.remove();
      StatusBar.setHidden(false);
      // Uygulama kapanırken dikey moda geri dön
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  const toggleFullscreen = async () => {
    // Sadece iOS için tam ekran kontrolü
    if (Platform.OS === 'ios') {
      try {
        if (isFullscreen) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
          setIsFullscreen(false);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          setIsFullscreen(true);
        }
      } catch (error) {
        console.log('Ekran yönü değiştirme hatası:', error);
      }
    }
  };

  const togglePlayPause = () => {
    setPaused(!paused);
    showControlsTemporarily();
  };

  const toggleMute = async () => {
    if (videoRef.current) {
      if (isMuted) {
        await videoRef.current.setVolumeAsync(1.0);
        setVolume(1.0);
      } else {
        await videoRef.current.setVolumeAsync(0);
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
    showControlsTemporarily();
  };

  const adjustVolume = async (direction) => {
    let newVolume = volume + (direction * 0.1);
    newVolume = Math.max(0, Math.min(1, newVolume));
    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(newVolume);
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    setShowHeader(true);
    setTimeout(() => {
      setShowControls(false);
      setShowHeader(false);
    }, 3000);
  };

  const toggleControls = () => {
    const newState = !showControls;
    setShowControls(newState);
    setShowHeader(newState);
    if (newState) {
      showControlsTemporarily();
    }
  };

  const onLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const onLoad = () => {
    setIsLoading(false);
    showControlsTemporarily();
  };

  const onError = (error) => {
    setIsLoading(false);
    setError(error);
    console.error('Video playback error:', error);
    Alert.alert(
      'Oynatma Hatası',
      'Video oynatılırken bir hata oluştu. Lütfen tekrar deneyin.',
      [
        { text: 'Geri Dön', onPress: () => navigation.goBack() },
        { text: 'Tekrar Dene', onPress: () => {
          setError(null);
          setIsLoading(true);
        }}
      ]
    );
  };

  const getVideoStyle = () => {
    const { width, height } = dimensions;
    const isLandscape = width > height;
    const screenAspectRatio = width / height;
    const videoAspectRatio = 16 / 9;
    
    if (isLandscape) {
      return {
        width: width,
        height: height,
        backgroundColor: '#000',
      };
    }
    
    const videoHeight = (width * 9) / 16;
    return {
      width: width,
      height: videoHeight,
      backgroundColor: '#000',
      position: 'absolute',
      top: '50%',
      transform: [{ translateY: -videoHeight / 2 }],
    };
  };

  return (
    <View style={[
      styles.container,
      isFullscreen && styles.fullscreenContainer
    ]}>
      <View style={[styles.videoContainer]}>
        <TouchableOpacity 
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}
          onPress={toggleControls}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            source={{ uri: streamUrl }}
            style={[styles.video, getVideoStyle()]}
            resizeMode="contain"
            shouldPlay={!paused}
            isLooping={true}
            onLoadStart={onLoadStart}
            onLoad={onLoad}
            onError={onError}
            useNativeControls={false}
            volume={volume}
          />
        </TouchableOpacity>
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#fff" />
            <Text style={styles.errorText}>Oynatma hatası</Text>
          </View>
        )}
        
        {showControls && !error && (
          <View style={styles.controls}>
            <View style={styles.controlsRow}>
              <View style={styles.leftControls}>
                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                  <MaterialIcons 
                    name={paused ? 'play-arrow' : 'pause'} 
                    size={40} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.volumeControls}>
                <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                  <MaterialIcons 
                    name={isMuted ? 'volume-off' : 'volume-up'} 
                    size={30} 
                    color="#fff" 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => adjustVolume(-1)} style={styles.controlButton}>
                  <MaterialIcons name="remove" size={30} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => adjustVolume(1)} style={styles.controlButton}>
                  <MaterialIcons name="add" size={30} color="#fff" />
                </TouchableOpacity>
              </View>

              {Platform.OS === 'ios' && (
                <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
                  <MaterialIcons 
                    name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} 
                    size={32} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              )}
            </View>
            {showControls && (
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    backgroundColor: '#000',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
  controlButton: {
    padding: 10,
    zIndex: 2,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  errorText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default PlayerScreen;