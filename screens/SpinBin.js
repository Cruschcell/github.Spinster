import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Image, FlatList, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

export default function SpinBin({ navigation }) {
  const [wonPosts, setWonPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpinBin();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadSpinBin();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadSpinBin = async () => {
    try {
      setLoading(true);
      const spinBinJson = await AsyncStorage.getItem('spinBin');
      const spinBin = spinBinJson ? JSON.parse(spinBinJson) : [];
      setWonPosts(spinBin);
    } catch (e) {
      console.log('Error loading spin bin:', e);
      Alert.alert('Error', 'Failed to load won posts');
    } finally {
      setLoading(false);
    }
  };

  const clearSpinBin = () => {
    Alert.alert(
      'Clear Spin Bin',
      'Are you sure you want to delete all won posts? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('spinBin', JSON.stringify([]));
              setWonPosts([]);
              Alert.alert('Success', 'Spin bin cleared!');
            } catch (e) {
              console.log('Error clearing spin bin:', e);
              Alert.alert('Error', 'Failed to clear spin bin');
            }
          }
        }
      ]
    );
  };

  const deletePost = (postId) => {
    Alert.alert(
      'Delete Post',
      'Remove this post from your spin bin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPosts = wonPosts.filter(post => post.id !== postId);
              await AsyncStorage.setItem('spinBin', JSON.stringify(updatedPosts));
              setWonPosts(updatedPosts);
            } catch (e) {
              console.log('Error deleting post:', e);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const viewPost = (post) => {
    navigation.navigate('ViewPost', { post });
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => viewPost(item)}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            {item.author.profileImage ? (
              <Image 
                source={{ uri: item.author.profileImage }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Text style={styles.avatarText}>
                {item.author.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.username}</Text>
            <Text style={styles.authorHandle}>{item.author.handle}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deletePost(item.id)}
        >
          <Text style={styles.deleteIcon}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.postFooter}>
        <Text style={styles.wonDate}>
          Won {new Date(item.spunAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={styles.viewText}>Tap to view →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎰</Text>
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptyText}>
        Spin the roulette wheel to win posts!{'\n'}
        Your won posts will appear here.
      </Text>
      <TouchableOpacity 
        style={styles.goBackButton}
        onPress={() => navigation.navigate('HomePage')}
      >
        <Text style={styles.goBackText}>Go Spin Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spin Bin</Text>
        {wonPosts.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearSpinBin}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
        {wonPosts.length === 0 && <View style={styles.placeholder} />}
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{wonPosts.length}</Text>
          <Text style={styles.statLabel}>Posts Won</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {wonPosts.filter(post => post.image).length}
          </Text>
          <Text style={styles.statLabel}>With Images</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {new Set(wonPosts.map(post => post.author.id)).size}
          </Text>
          <Text style={styles.statLabel}>Unique People</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={wonPosts}
          renderItem={renderPost}
          keyExtractor={item => item.id + item.spunAt}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7D0AD1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 14,
  },
  placeholder: {
    width: 40,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: '#E6CCFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7D0AD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  authorHandle: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  deleteIcon: {
    fontSize: 12,
    color:"#dd0101ff",
    fontWeight:'bold'
  },
  postContent: {
    fontSize: 15,
    color: '#000',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#7D0AD1',
  },
  wonDate: {
    fontSize: 12,
    color: '#7D0AD1',
  },
  viewText: {
    fontSize: 13,
    color: '#7D0AD1',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  goBackButton: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  goBackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});