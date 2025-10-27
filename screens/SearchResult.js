import { Text, View, TouchableOpacity, StatusBar, Image, TextInput, ScrollView, ActivityIndicator, StyleSheet} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserSearchResult({ navigation, route }) {
  const { query } = route.params;
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittedQuery, setSubmittedQuery] = useState(query);

  useEffect(() => {
    performUserSearch(query);
  }, []);

  const performUserSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const lowerQuery = searchTerm.toLowerCase().trim();
      const storedUsers = await AsyncStorage.getItem('users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const matchingUsers = allUsers.filter(user => {
        const username = user.username?.toLowerCase() || '';
        const handle = user.handle?.toLowerCase() || '';
        const normalizedHandle = handle.startsWith('@') ? handle.slice(1) : handle;
        return (
          username.includes(lowerQuery) ||
          handle === lowerQuery ||
          normalizedHandle === lowerQuery
        );
      });
      setResults(matchingUsers);
      } catch (e) {
        console.log('Error performing user search:', e);
      } finally {
        setLoading(false);
    }
  };

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      setSubmittedQuery(trimmed);
      performUserSearch(trimmed);
    }
  };

  const goToUserProfile = (user)=>{
    navigation.navigate('Profile',{user});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Image style={styles.searchIcon} source={require('../assets/search.png')}/>
          </TouchableOpacity>
        </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Searching users...</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found for "{submittedQuery}"</Text>
            <Text style={styles.emptySubtext}>Try a different username or handle</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Users ({results.length})</Text>
            <View style={styles.gridContainer}>
              {results.map((user, index) => (
                <TouchableOpacity 
                  key={`${user.username}-${index}`} 
                  style={styles.userCard}
                  onPress={() => navigation.navigate('Profile', { viewedUserId: user.id })}
                  >
                  <View style={styles.profile}>
                    {user.profileImage ? (
                      <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                    ) : (
                      <View style={styles.profilePlaceholder}>
                        <Text style={styles.profilePlaceholderText}>
                          {user.username?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.usernameText}>{user.username}</Text>
                  <Text style={styles.userHandle}>{user.handle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7D0AD1',
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  backButtonText: {
    fontSize: 22,
    color: '#fff',
  },
  searchContainer:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:"#f3f3f3ff",
    borderRadius:10,
    paddingHorizontal:15,
    marginHorizontal:20,
    marginTop:10,
    height:45,
  },
  searchInput:{
    flex:1,
    fontSize:15,
    color:"#000"
  },
  searchButton:{
    padding:5,
  },
  searchIcon:{
    width:20,
    height:20,
    tintColor:'#7D0AD1',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFCC00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft:10,
  },
  resultCard: {
    backgroundColor: '#4B0082',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4B0082',
  },
  usernameText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  userHandle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 3,
  },
  flair: {
    color: '#FFCC00',
    fontSize: 13,
    marginTop: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:'flex-start',
    justifyContent:'space-between',
    marginTop:20,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 20,
    width: '28%',
  },
  profile: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profilePlaceholderText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },

});
