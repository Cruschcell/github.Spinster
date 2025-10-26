import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert, Image, ScrollView, TextInput, Animated, Dimensions} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef } from 'react'
import { launchImageLibrary } from 'react-native-image-picker';

const {height} = Dimensions.get('window');

export default function CreatePost({ navigation }) {
  const [user, setUser] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (currentUserJson) {
        const userData = JSON.parse(currentUserJson);
        setUser(userData);
      }
    } catch (e) {
      console.log("Error getting current user", e);
    }
  };
  const toggleMenu = () => {
      if (isMenuOpen) {
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setIsMenuOpen(false));
      } else {
        setIsMenuOpen(true);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };
  
  const handleMenuItemPress = (item) => {
    toggleMenu();
    setTimeout(() => {
      if (item === 'Logout') {
        Alert.alert('Logout', 'Are you sure you want to logout?');
      } else {
        Alert.alert(item, `You pressed ${item}`);
      }
    }, 300);
  };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includedBase64: false,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets[0]) {
        setPostImage(response.assets[0].uri);
      }
    });
  };

  const removeImage = () => {
    setPostImage(null);
  };

  const handlePostContentChange = (text) => {
    if (text.length <= maxChars) {
      setPostContent(text);
      setCharCount(text.length);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImage) {
      Alert.alert('Error', 'Please add some content or an image to your post');
      return;
    }

    try {
      const newPost = {
        id: Date.now().toString(),
        userId: user.id,
        content: postContent.trim(),
        image: postImage,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        likes: 0,
        comments: 0,
        timestamp: Date.now()
      };

      const postsJson = await AsyncStorage.getItem(`posts_${user.id}`);
      const posts = postsJson ? JSON.parse(postsJson) : [];
      posts.unshift(newPost);
      await AsyncStorage.setItem(`posts_${user.id}`, JSON.stringify(posts));
      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
      setPostContent('');
      setPostImage(null);
      setCharCount(0);
    } catch (e) {
      console.log('Error creating post:', e);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomePage')}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={handleCreatePost}>
          <Text style={styles.postBtn}>Post</Text>
        </TouchableOpacity>
      </View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text style={styles.username}>{user?.username}</Text>
              <Text style={styles.handle}>{user?.handle}</Text>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind bitch?"
            placeholderTextColor="#fff"
            multiline
            value={postContent}
            onChangeText={handlePostContentChange}
            maxLength={maxChars}
          />
          <View style={styles.subInput}>
            <Text style={styles.charCounter}>
              {charCount}/{maxChars}
            </Text>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.attachImage}>Attach Image</Text>
            </TouchableOpacity>
          </View>
          {postImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: postImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <View style={styles.navContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Slots')}>
              <Image source={require('../assets/slots.png')} style={styles.navIcon} />
              <Text style={styles.navLabel}>Slots</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('CreatePost')}>
              <Image source={require('../assets/post.png')} style={styles.navIcon} />
              <Text style={styles.navLabel}>Post</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Profile')}>
              <Image source={require('../assets/user.png')} style={styles.navIcon} />
              <Text style={styles.navLabel}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={toggleMenu}>
              <Image source={require('../assets/hambuger.png')} style={styles.navIcon} />
              <Text style={styles.navLabel}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isMenuOpen && (
          <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1} 
            onPress={toggleMenu}
          >
            <Animated.View 
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={styles.menuHeader}>
                  <View style={styles.menuHandle} />
                  <Text style={styles.menuTitle}>Menu</Text>
                </View>

                <View style={styles.menuContent}>
                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => handleMenuItemPress('Spin Bin')}
                  >
                    <Text style={styles.menuItemText}>🗑 Spin Bin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => handleMenuItemPress('Chatlogs')}
                  >
                    <Text style={styles.menuItemText}>💬 Chatlogs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => handleMenuItemPress('FAQs')}
                  >
                    <Text style={styles.menuItemText}>❓ FAQs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.menuItem} 
                    onPress={() => handleMenuItemPress('Rules')}
                  >
                    <Text style={styles.menuItemText}>📜 Rules</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.menuItem, styles.logoutItem]} 
                    onPress={() => handleMenuItemPress('Logout')}
                  >
                    <Text style={[styles.menuItemText, styles.logoutText]}>🚪 Logout</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: '#fff',
  },
  cancelBtn: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postBtn: {
    color: '#FFCC00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4B0082',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E6CCFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  handle: {
    color: '#fff',
    fontSize: 14,
  },
  textInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  charCounter: {
    color: '#E6CCFF',
    fontSize: 12,
  },
  subInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  attachImage: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 20,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#E6CCFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#4B0082',
    borderRadius: 30,
    borderWidth:1,
    borderColor:"#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
    tintColor: '#fff',
  },
  navLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4B0082',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  menuHeader: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  menuHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 3,
    marginBottom: 15,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  menuItemText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 2,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});