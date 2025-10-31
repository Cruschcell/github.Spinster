import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Image, ScrollView, Alert, TextInput, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

export default function ViewPost({ navigation, route }) {
  const { post } = route.params;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState([]);

  useEffect(() => {
    loadPostInteractions();
    loadCurrentUser();
    loadUsers();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setCurrentUser(JSON.parse(userJson));
      }
    } catch (e) {
      console.log('Error loading current user:', e);
    }
  };

  const loadUsers = async () => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      if (usersJson) {
        setUsers(JSON.parse(usersJson));
      }
    } catch (e) {
      console.log('Error loading users:', e);
    }
  };

  const loadPostInteractions = async () => {
    try {
      const likesKey = `post_likes_${post.id}`;
      const likesJson = await AsyncStorage.getItem(likesKey);
      const likes = likesJson ? JSON.parse(likesJson) : { count: 0, users: [] };
      setLikesCount(likes.count);

      const currentUserJson = await AsyncStorage.getItem('currentUser');
      const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
      if (currentUser) {
        setIsLiked(likes.users.includes(currentUser.id));
      }

      const commentsKey = `post_comments_${post.id}`;
      const commentsJson = await AsyncStorage.getItem(commentsKey);
      const loadedComments = commentsJson ? JSON.parse(commentsJson) : [];
      setComments(loadedComments);
    } catch (e) {
      console.log('Error loading post interactions:', e);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to like posts');
      return;
    }

    try {
      const likesKey = `post_likes_${post.id}`;
      const likesJson = await AsyncStorage.getItem(likesKey);
      const likes = likesJson ? JSON.parse(likesJson) : { count: 0, users: [] };

      if (isLiked) {
        likes.count = Math.max(0, likes.count - 1);
        likes.users = likes.users.filter(id => id !== currentUser.id);
        setIsLiked(false);
      } else {
        likes.count += 1;
        likes.users.push(currentUser.id);
        setIsLiked(true);
      }

      setLikesCount(likes.count);
      await AsyncStorage.setItem(likesKey, JSON.stringify(likes));
    } catch (e) {
      console.log('Error toggling like:', e);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleCommentChange = (text) => {
    setCommentText(text);
    
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === text.length - 1) {
      setUserSuggestions(users.filter(u => u.id !== currentUser?.id));
      setShowUserSuggestions(true);
    } else if (lastAtIndex !== -1) {
      const textAfterAt = text.substring(lastAtIndex + 1);
      const hasSpace = textAfterAt.includes(' ');
      
      if (!hasSpace && textAfterAt.length > 0) {
        const filtered = users.filter(u => 
          u.id !== currentUser?.id &&
          (u.username.toLowerCase().includes(textAfterAt.toLowerCase()) ||
           u.handle.toLowerCase().includes(textAfterAt.toLowerCase()))
        );
        setUserSuggestions(filtered);
        setShowUserSuggestions(filtered.length > 0);
      } else if (!hasSpace && textAfterAt.length === 0) {
        setUserSuggestions(users.filter(u => u.id !== currentUser?.id));
        setShowUserSuggestions(true);
      } else {
        setShowUserSuggestions(false);
      }
    } else {
      setShowUserSuggestions(false);
    }
  };

  const selectUser = (user) => {
    const lastAtIndex = commentText.lastIndexOf('@');
    const beforeAt = commentText.substring(0, lastAtIndex);
    const newText = `${beforeAt}@${user.username} `;
    setCommentText(newText);
    setShowUserSuggestions(false);
  };

  const handleComment = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    try {
      const newComment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        handle: currentUser.handle,
        profileImage: currentUser.profileImage,
        text: commentText.trim(),
        timestamp: Date.now()
      };

      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);

      const commentsKey = `post_comments_${post.id}`;
      await AsyncStorage.setItem(commentsKey, JSON.stringify(updatedComments));
      
      setCommentText('');
    } catch (e) {
      console.log('Error adding comment:', e);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const viewImage = (uri) => {
    if (!uri) return;
    navigation.navigate('ImageViewer', { imageUri: uri });
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Profile', { viewedUserId: item.userId })}
      >
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.commentAvatar} />
        ) : (
          <View style={styles.commentAvatarPlaceholder}>
            <Text style={styles.commentAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.username}</Text>
          <Text style={styles.commentHandle}>{item.handle}</Text>
          <Text style={styles.commentDot}>·</Text>
          <Text style={styles.commentTime}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton}>
              <Image source={require('../assets/comment.png')} style={styles.actionIconImage} />
            </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
              <Image source={require('../assets/like.png')} style={styles.actionIconImage} />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Post */}
        <View style={styles.postContainer}>
          <TouchableOpacity 
            style={styles.postHeader}
            onPress={() => navigation.navigate('Profile', { viewedUserId: post.author.id })}
          >
            {post.author.profileImage ? (
              <Image 
                source={{ uri: post.author.profileImage }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {post.author.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.postHeaderInfo}>
              <Text style={styles.username}>{post.author.username}</Text>
              <Text style={styles.handle}>{post.author.handle}</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.postText}>{post.content}</Text>

          {post.image && (
            <TouchableOpacity 
              style={styles.postImageContainer}
              onPress={() => viewImage(post.image)}
            >
              <Image 
                source={{ uri: post.image }} 
                style={styles.postImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          <Text style={styles.postTimestamp}>
            {new Date(post.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })} · {new Date(post.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>

          <View style={styles.statsBar}>
            <Text style={styles.statText}>
              <Text style={styles.statNumber}>{likesCount}</Text> Likes
            </Text>
            <Text style={styles.statText}>
              <Text style={styles.statNumber}>{comments.length}</Text> Replies
            </Text>
          </View>

          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.actionButton}>
              <Image source={require('../assets/comment.png')} style={styles.actionIconImage} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Image source={require('../assets/retweet.png')} style={styles.actionIconImage} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Image 
                source={require('../assets/like.png')}
                style={[
                  styles.actionIconImage, 
                  isLiked && { color:"#fff" }
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Image source={require('../assets/save.png')} style={styles.actionIconImage} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.replyContainer}>
          <View style={styles.replyInputWrapper}>
            {currentUser?.profileImage ? (
              <Image 
                source={{ uri: currentUser.profileImage }} 
                style={styles.replyAvatar} 
              />
            ) : (
              <View style={styles.replyAvatarPlaceholder}>
                <Text style={styles.replyAvatarText}>
                  {currentUser?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <TextInput
              style={styles.replyInput}
              placeholder="Post your reply"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={commentText}
              onChangeText={handleCommentChange}
              multiline
            />
          </View>
          <View style={styles.replyActions}>
            <TouchableOpacity style={styles.replyIconButton}>
              <Text style={styles.replyIcon}>Attach Image</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.replyButton, !commentText.trim() && styles.replyButtonDisabled]}
              onPress={handleComment}
              disabled={!commentText.trim()}
            >
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsSection}>
          {comments.length > 0 ? (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>Be the first to reply!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showUserSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={userSuggestions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => selectUser(item)}
              >
                {item.profileImage ? (
                  <Image source={{ uri: item.profileImage }} style={styles.suggestionAvatar} />
                ) : (
                  <View style={styles.suggestionAvatarPlaceholder}>
                    <Text style={styles.suggestionAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.suggestionUsername}>{item.username}</Text>
                  <Text style={styles.suggestionHandle}>{item.handle}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  postHeaderInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  handle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  postText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 32,
    marginBottom: 12,
  },
  postImageContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  postTimestamp: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 12,
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 4,
  },
  statText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 20,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#fff',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionIconImage: {
    width: 20,          
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',   
  },
  replyContainer: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  replyInputWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  replyAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  replyAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  replyInput: {
    flex: 1,
    fontSize: 17,
    color: '#fff',
    minHeight: 44,
    paddingTop: 10,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 52,
  },
  replyIcon: {
    fontSize: 15,
    color:"#fff"
  },
  replyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replyButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    opacity: 0.5,
  },
  replyButtonText: {
    color: '#7D0AD1',
    fontSize: 15,
    fontWeight: 'bold',
  },
  commentsSection: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  commentHandle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 4,
  },
  commentDot: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 4,
  },
  commentTime: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  commentText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  commentActionButton: {
    marginRight: 60,
  },
  commentActionIcon: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  noCommentsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  suggestionAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7D0AD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  suggestionUsername: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#14171A',
  },
  suggestionHandle: {
    fontSize: 14,
    color: '#657786',
  },
});