import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, Image, TextInput, Keyboard, TouchableWithoutFeedback, Platform, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

export const SubCategoryScreen = ({ route }) => {
  const { items, categoryName, logoUrl } = route.params;
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contentItem}
      onPress={() => navigation.navigate('Player', { 
        streamUrl: item.url, 
        title: item.title 
      })}
    >
      <View style={styles.contentItemInner}>
        {item.logoUrl ? (
          <Image
            source={{ uri: item.logoUrl }}
            style={styles.contentLogo}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.contentLogo, styles.placeholderLogo]}>
            <MaterialIcons name="play-arrow" size={20} color="#007AFF" />
          </View>
        )}
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle} numberOfLines={1}>{item.title}</Text>
          {item.groupTitle && (
            <Text style={styles.contentSubtitle} numberOfLines={1}>{item.groupTitle}</Text>
          )}
        </View>
        <View style={styles.playButton}>
          <MaterialIcons name="play-circle-fill" size={32} color="#007AFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.subCategoryScreen}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        contentContainerStyle={styles.contentList}
      />
    </View>
  );
};

const CategoryTab = ({ category, items, navigation }) => {
  const [displayedItems, setDisplayedItems] = useState([]);

  useEffect(() => {
    organizeItems();
  }, [items]);

  const organizeItems = () => {
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.subCategory]) {
        acc[item.subCategory] = [];
      }
      acc[item.subCategory].push(item);
      return acc;
    }, {});

    setDisplayedItems(Object.entries(groupedItems));
  };

  const getLogoUrl = (categoryName, items) => {
    const groupItems = items.filter(item => item.groupTitle === categoryName);
    const itemWithLogo = groupItems.find(item => item.logoUrl);
    if (itemWithLogo) {
      return itemWithLogo.logoUrl;
    }
    const logo = groupItems.find(item => 
      item.url && 
      (item.url.toLowerCase().endsWith('.png') || 
       item.url.toLowerCase().endsWith('.jpg') || 
       item.url.toLowerCase().endsWith('.jpeg'))
    );
    return logo ? logo.url : null;
  };

  const renderCategory = ({ item }) => {
    const [categoryName, categoryItems] = item;
    const logoUrl = getLogoUrl(categoryName, items);

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate('SubCategory', {
          items: categoryItems,
          categoryName: categoryName,
          logoUrl: logoUrl
        })}
      >
        <View style={styles.categoryContent}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.categoryLogo}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.categoryLogo, styles.placeholderLogo]}>
              <MaterialIcons 
                name={category === 'tv' ? 'tv' : category === 'movies' ? 'movie' : 'video-library'} 
                size={28} 
                color="#007AFF" 
              />
            </View>
          )}
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            <Text style={styles.categoryCount}>{categoryItems.length} içerik</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#007AFF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="inbox" size={48} color="#999" />
        <Text style={styles.emptyText}>Bu kategoride içerik bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedItems}
        renderItem={renderCategory}
        keyExtractor={(item) => item[0]}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );
};

const SearchBar = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="İçerik Ara..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity 
            onPress={() => handleSearch('')}
            style={styles.clearButton}
          >
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const SearchResults = ({ results, navigation, onClose }) => {
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        navigation.navigate('Player', {
          streamUrl: item.url,
          title: item.title
        });
        onClose();
      }}
    >
      <View style={styles.searchResultContent}>
        {item.logoUrl ? (
          <Image
            source={{ uri: item.logoUrl }}
            style={styles.searchResultLogo}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.searchResultLogo, styles.placeholderLogo]}>
            <MaterialIcons 
              name={
                item.mainCategory === 'tv' ? 'tv' :
                item.mainCategory === 'movies' ? 'movie' : 'video-library'
              }
              size={20}
              color="#007AFF"
            />
          </View>
        )}
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.searchResultCategory} numberOfLines={1}>
            {item.groupTitle} • {
              item.mainCategory === 'tv' ? 'TV' :
              item.mainCategory === 'movies' ? 'Film' : 'Dizi'
            }
          </Text>
        </View>
        <MaterialIcons name="play-circle-outline" size={24} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={results}
      renderItem={renderSearchItem}
      keyExtractor={(item, index) => `search-${item.title}-${index}`}
      contentContainerStyle={styles.searchResultsList}
    />
  );
};

const CategoriesScreen = ({ route, navigation }) => {
  const { m3uLink } = route.params;
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    tv: [],
    movies: [],
    series: []
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    parseM3UContent();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => navigation.navigate('M3UList')}
        >
          <MaterialIcons name="playlist-add" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
      headerTitle: route.params?.listName || 'Kategoriler'
    });
  }, [navigation]);

  const parseM3UContent = async () => {
    try {
      setLoading(true);
      console.log('Fetching M3U content from:', m3uLink);
      
      const response = await fetch(m3uLink, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 10000, // 10 saniye timeout
      }).catch(error => {
        console.error('Fetch error:', error);
        throw new Error('Network request failed: ' + error.message);
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text().catch(error => {
        console.error('Text parse error:', error);
        throw new Error('Content parsing failed: ' + error.message);
      });

      if (!data || data.trim().length === 0) {
        throw new Error('Empty content received');
      }

      console.log('Content received, length:', data.length);
      
      const lines = data.split('\n');
      let currentItem = null;
      const parsedContent = {
        tv: {},
        movies: {},
        series: {}
      };
      let hasDiziOrFilm = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
          const groupMatch = line.match(/group-title="([^"]*)"/);
          const titleMatch = line.match(/,(.*)$/);
          const logoMatch = line.match(/tvg-logo="([^"]*)"/);
          
          if (titleMatch) {
            currentItem = {
              title: titleMatch[1].trim(),
              groupTitle: groupMatch ? groupMatch[1] : 'Diğer',
              logoUrl: logoMatch ? logoMatch[1] : null
            };
          }
        } else if (line.startsWith('http') && currentItem) {
          const url = line;
          const isVideoFile = url.toLowerCase().endsWith('.mkv');
          let category;

          // DIZI veya FILM içeren grup başlıklarını kontrol et
          const groupTitle = currentItem.groupTitle.toUpperCase();
          if ((groupTitle.includes('DIZI') || groupTitle.includes('SERIES')) && isVideoFile) {
            category = 'series';
            hasDiziOrFilm = true;
          } else if ((groupTitle.includes('FILM') || groupTitle.includes('MOVIE')) && isVideoFile) {
            category = 'movies';
            hasDiziOrFilm = true;
          } else {
            category = 'tv';
          }

          if (!parsedContent[category][currentItem.groupTitle]) {
            parsedContent[category][currentItem.groupTitle] = [];
          }

          parsedContent[category][currentItem.groupTitle].push({
            title: currentItem.title,
            url: url,
            logoUrl: currentItem.logoUrl,
            groupTitle: currentItem.groupTitle,
            mainCategory: category
          });

          currentItem = null;
        }
      }

      // Eğer DIZI veya FILM kategorisi yoksa, tüm içeriği TV kategorisinde birleştir
      if (!hasDiziOrFilm) {
        const allContent = [];
        Object.values(parsedContent.tv).forEach(items => {
          allContent.push(...items);
        });

        // Tüm içeriği alfabetik sırala
        allContent.sort((a, b) => a.title.localeCompare(b.title));

        parsedContent.tv = { 'Tüm Kanallar': allContent };
        parsedContent.movies = {};
        parsedContent.series = {};
      }

      // Alt kategorileri düzenlenmiş içeriği state'e aktar
      const organizedContent = {
        tv: [],
        movies: [],
        series: []
      };

      // Her ana kategori için alt kategorileri düzenle
      Object.keys(parsedContent).forEach(mainCategory => {
        Object.entries(parsedContent[mainCategory]).forEach(([subCategory, items]) => {
          items.forEach(item => {
            organizedContent[mainCategory].push({
              ...item,
              subCategory
            });
          });
        });
      });

      console.log('Organized content:', {
        tv: organizedContent.tv.length,
        movies: organizedContent.movies.length,
        series: organizedContent.series.length
      });

      setContent(organizedContent);
      setLoading(false);
    } catch (error) {
      console.error('M3U parsing error:', error);
      Alert.alert(
        'Hata',
        `İçerik yüklenirken bir hata oluştu:\n${error.message}\n\nLütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`,
        [
          { 
            text: 'Tekrar Dene',
            onPress: () => parseM3UContent()
          },
          {
            text: 'Geri Dön',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setIsSearching(!!text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const searchText = text.toLowerCase();
    const results = [];

    // Tüm kategorilerde arama yap
    ['tv', 'movies', 'series'].forEach(category => {
      content[category].forEach(item => {
        if (
          item.title.toLowerCase().includes(searchText) ||
          item.groupTitle.toLowerCase().includes(searchText)
        ) {
          results.push(item);
        }
      });
    });

    setSearchResults(results);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>İçerik yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContainer}>
          <SearchBar onSearch={handleSearch} />
          
          {isSearching ? (
            <SearchResults 
              results={searchResults}
              navigation={navigation}
              onClose={() => {
                setIsSearching(false);
                setSearchResults([]);
              }}
            />
          ) : (
            <Tab.Navigator
              screenOptions={{
                tabBarLabelStyle: { 
                  fontSize: 14, 
                  fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
                  textTransform: 'none'
                },
                tabBarStyle: { 
                  backgroundColor: Platform.OS === 'ios' ? '#f8f8f8' : '#fff',
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                },
                tabBarIndicatorStyle: { 
                  backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
                  height: 3
                },
                tabBarActiveTintColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
                tabBarInactiveTintColor: '#666',
              }}
            >
              {content.tv.length > 0 && (
                <Tab.Screen 
                  name="TV" 
                  children={() => <CategoryTab category="tv" items={content.tv} navigation={navigation} />}
                  options={{ 
                    tabBarLabel: 'TV',
                    tabBarIcon: ({ color }) => (
                      <MaterialIcons name="tv" size={24} color={color} />
                    )
                  }}
                />
              )}
              {content.movies.length > 0 && (
                <Tab.Screen 
                  name="Filmler" 
                  children={() => <CategoryTab category="movies" items={content.movies} navigation={navigation} />}
                  options={{ 
                    tabBarLabel: 'Filmler',
                    tabBarIcon: ({ color }) => (
                      <MaterialIcons name="movie" size={24} color={color} />
                    )
                  }}
                />
              )}
              {content.series.length > 0 && (
                <Tab.Screen 
                  name="Diziler" 
                  children={() => <CategoryTab category="series" items={content.series} navigation={navigation} />}
                  options={{ 
                    tabBarLabel: 'Diziler',
                    tabBarIcon: ({ color }) => (
                      <MaterialIcons name="video-library" size={24} color={color} />
                    )
                  }}
                />
              )}
            </Tab.Navigator>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  categoryList: {
    padding: 16,
  },
  categoryCard: {
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
    overflow: 'hidden',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderLogo: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  contentItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  contentItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  contentLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  contentInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  contentSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  playButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  subCategoryScreen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentList: {
    padding: 16,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: Platform.OS === 'ios' ? 36 : 44,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  clearButton: {
    padding: 4,
  },
  searchResultsList: {
    padding: 12,
  },
  searchResultItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  searchResultLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  searchResultCategory: {
    fontSize: 13,
    color: '#666',
  }
});

export default CategoriesScreen; 