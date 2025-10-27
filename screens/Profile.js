import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert, Image, ScrollView, TextInput, Modal} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState,useEffect} from 'react'
import {launchImageLibrary} from 'react-native-image-picker';

export default function Profile({route,navigation}) {
  const[user,setUser] = useState(null);
  const[profileImage,setProfileImage]=useState(null);
  const[coverImage,setCoverImage]=useState(null);
  const [showOption,setShowOption]=useState(false);
  const {viewedUserId} = route.params || {};
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loading, setLoading] = useState(false);


  const[showEditModal,setShowEditModal]=useState(false);
  const[editType,setEditType]=useState('');
  const[editValue,setEditValue]=useState('');

  const[showPasswordModal,setShowPasswordModal]=useState(false);
  const[currentPassword,setCurrentPassword]=useState('');
  const[newPassword,setNewPassword]=useState('');
  const[confirmPassword,setConfirmPassword]=useState('');
  const[showCurrentPassword,setShowCurrentPassword]=useState(false);
  const[showNewPassword,setShowNewPassword]=useState(false);
  const[showConfirmPassword,setShowConfirmPassword]=useState(false);

  const[friends,setFriends]=useState([]);
  const[showFriendsModal,setShowFriendsModal]=useState(false);
  const[friendSearchQuery,setFriendSearchQuery]=useState('');
  const[activeTab,setActiveTab]=useState('friends');

  const[posts,setPosts]=useState([]);
  const[bio,setBio]=useState('');
  const[showBioModal,setShowBioModal]=useState(false);
  const[bioInput,setBioInput]=useState('');

  const loadFriends = async(userId) => {
    try{
      const friendsJson = await AsyncStorage.getItem(`friends_${userId}`);
      if(friendsJson){
        const friendsList = JSON.parse(friendsJson);
        setFriends(friendsList);
      } 
    }catch(e){
      console.log('Error loading friends:', e);
    }
  };
  const loadPosts = async(userId) => {
    try{
      const postsJson = await AsyncStorage.getItem(`posts_${userId}`);
      if(postsJson){
        const postsList = JSON.parse(postsJson);
        setPosts(postsList);
      }
    }catch(e){
      console.log('Error loading posts:', e);
    }
  };

  const openBioModal = () => {
    setBioInput(bio);
    setShowBioModal(true);
  };

  const saveBio = async() => {
    try{
      await AsyncStorage.setItem(`bio_${user.id}`, bioInput);
      setBio(bioInput);
      setShowBioModal(false);
      Alert.alert('Success', 'Bio updated successfully');
    }catch(e){
      console.log('Error saving bio:', e);
      Alert.alert('Error', 'Failed to update bio');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem('users');
        const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
        const currentUserData = await AsyncStorage.getItem('currentUser');
        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
        
        let userToView = currentUser;
        if (viewedUserId && viewedUserId !== currentUser?.id) {
          const other = allUsers.find(u => u.id === viewedUserId);
          if (other) {
            userToView = other;
            setIsOwnProfile(false);
          }
        } else {
          setIsOwnProfile(true);
        }
        setUser(userToView);
        if(userToView?.id){
          loadFriends(userToView.id);
          loadPosts(userToView.id);
        }
        try {
          const storedProfileImage = await AsyncStorage.getItem(`profileImage_${userToView.username}`);
          const storedCoverImage = await AsyncStorage.getItem(`coverImage_${userToView.username}`);
          if (storedProfileImage) setProfileImage(storedProfileImage);
          if (storedCoverImage) setCoverImage(storedCoverImage);
        } catch (e) {
          console.log('Error loading profile/cover images:', e);
        }
      } catch (e) {
        console.log('Error loading profile:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
      }, [viewedUserId]);
      useEffect(() => {
      const loadBio = async () => {
        if (!user?.id) return;
        try {
          const storedBio = await AsyncStorage.getItem(`bio_${user.id}`);
          if (storedBio) setBio(storedBio);
        } catch (e) {
          console.log('Error loading bio:', e);
        }
      };
      loadBio();
    }, [user]);

  const openEditModal = (type) =>{
    setEditType(type);
    switch(type){
      case 'username':
        setEditValue(user?.username||'');
        break;
      case 'handle':
        setEditValue(user?.handle||'');
        break;
      case 'email':
        setEditValue(user?.email||'');
        break;
    }
    setShowEditModal(true);
  };
  
  const openPasswordModal = () =>{
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const getModalTitle = () => {
    switch(editType){
      case 'username': return 'Edit Username';
      case 'handle': return 'Edit Handle';
      case 'email': return 'Edit Email';
      default: return 'Edit';
    }
  };

  const saveEdit = async () =>{
    if(!editValue.trim()){
      Alert.alert('Failed', 'Field cannot be empty!')
      return;
    }
    if(editType==='handle' && !editValue.startsWith('@')){
      Alert.alert('Failed', 'Handle must start with @');
      return;
    }
    if(editType==='email'&& !editValue.includes('@')){
      Alert.alert('Failed', 'Please enter a valid email address')
      return;
    }
    try{
      const updatedUser={...user};
      switch(editType){
        case 'username':
          updatedUser.username=editValue;
          break;
        case 'handle':
          updatedUser.handle=editValue;
          break;
        case 'email':
          updatedUser.email=editValue;
          break;
      }
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const usersJson = await AsyncStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          await AsyncStorage.setItem('users', JSON.stringify(users));
        }
      }
      setUser(updatedUser);
      setShowEditModal(false);
      Alert.alert('Success',`${editType.charAt(0).toUpperCase() + editType.slice(1)} updated successfully`);
    }catch(e){
      console.log('Error saving edit',e);
      Alert.alert('Error', 'Failed to update, please try again');
    }
  }

   const savePassword = async () => {
    if(!currentPassword || !newPassword || !confirmPassword){
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if(currentPassword !== user.password){
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }
    if(newPassword !== confirmPassword){
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if(newPassword.length < 6){
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if(newPassword === currentPassword){
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }
    try{
      const updatedUser = {...user, password: newPassword};
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password updated successfully');
    }catch(e){
      console.log('Error saving password:', e);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    }
  };

  const handleOptionMenu = (option) => {
    setShowOption(false);
    switch(option){
      case 'editUsername':
        openEditModal('username')
        break;
      case 'editHandle':
        openEditModal('handle')
        break;
      case 'editEmail':
        openEditModal('email')
        break;
      case 'editPassword':
        openPasswordModal();
        break;
      case 'logout':
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Logout', onPress: handleLogout}
        ]);
        break;
      case 'addFriend':
        Alert.alert('Add Friend', 'Friend request sent');
        break;
      case 'report':
        Alert.alert('Report', 'Report functionality');
        break;
      case 'block':
        Alert.alert('Block', 'Are you sure you want to block this user?', [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Block', onPress: () => console.log('Blocking user...')}
        ]);
        break;
    }
  };

  const handleLogout = async () =>{
    try{
      await AsyncStorage.removeItem('currentUser');
      console.log('User has been logged out');
      Alert.alert('Logged Out', 'You have been logged out successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('WelcomePage')
        }
      ]);
    }catch(e){
      console.log('Error logging out',e);
      Alert.alert('Error', 'Failed to logout');
    }
  }

  const pickImage = async(type) => {
    const options ={
      mediaType:'photo',
      quality:0.8,
    };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets[0] && user) {
        const imageUri = response.assets[0].uri;
        
        if (type === 'profile') {
          setProfileImage(imageUri);
          await AsyncStorage.setItem(`profileImage_${user.username}`, imageUri);
          
          const updatedUser = { ...user, profileImage: imageUri };
          setUser(updatedUser);
          await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          const usersJson = await AsyncStorage.getItem('users');
          if (usersJson) {
            const users = JSON.parse(usersJson);
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
              users[userIndex].profileImage = imageUri;
              await AsyncStorage.setItem('users', JSON.stringify(users));
            }
          }
          
          console.log('Profile image updated:', imageUri);
        } else {
          setCoverImage(imageUri);
          await AsyncStorage.setItem(`coverImage_${user.username}`, imageUri);
          const updatedUser = { ...user, coverImage: imageUri };
          setUser(updatedUser);
          await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
          
          const usersJson = await AsyncStorage.getItem('users');
            if (usersJson) {
              const users = JSON.parse(usersJson);
              const userIndex = users.findIndex(u => u.id === user.id);
              if (userIndex !== -1) {
                users[userIndex].coverImage = imageUri;
                await AsyncStorage.setItem('users', JSON.stringify(users));
              }
            }
        }
      }
    });
  };

  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
    friend.handle.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  const renderFriendItem = (friend) => (
    <TouchableOpacity key={friend.id} style={styles.friendItem}>
      <View style={styles.friendAvatar}>
        {friend.profileImage ? (
          <Image source={{uri: friend.profileImage}} style={styles.friendAvatarImage}/>
        ) : (
          <Text style={styles.friendAvatarText}>{friend.username.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendUsername}>{friend.username}</Text>
        <Text style={styles.friendHandle}>{friend.handle}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFriendsGrid = () => {
    const displayFriends = friends.slice(0, 8);
    const remainingCount = friends.length - 8;

    return (
      <View style={styles.friendsGrid}>
        {displayFriends.map((friend) => (
          <TouchableOpacity key={friend.id} style={styles.friendGridItem}>
            <View style={styles.friendGridAvatar}>
              {friend.profileImage ? (
                <Image source={{uri: friend.profileImage}} style={styles.friendGridAvatarImage}/>
              ) : (
                <Text style={styles.friendGridAvatarText}>{friend.username.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.friendGridUsername} numberOfLines={1}>{friend.username}</Text>
          </TouchableOpacity>
        ))}
        {remainingCount > 0 && (
          <TouchableOpacity 
            style={styles.friendGridItem} 
            onPress={() => setShowFriendsModal(true)}
          >
            <View style={[styles.friendGridAvatar, styles.friendGridMore]}>
              <Text style={styles.friendGridMoreText}>+{remainingCount}</Text>
            </View>
            <Text style={styles.friendGridUsername} numberOfLines={1}>More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const viewImage = (uri) => {
    if (!uri) return;
    navigation.navigate('ImageViewer', { imageUri: uri });
  };

  const renderContent = () => {
    switch(activeTab){
      case 'friends':
        return (
          <View style={styles.tabContent}>
            {friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No friends yet</Text>
              </View>
            ) : (
              renderFriendsGrid()
            )}
          </View>
        );
      case 'posts':
        return (
          <ScrollView 
            style={styles.tabContent} 
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}>            
          {posts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No posts yet</Text>
              </View>
            ) : (
              posts.map((post) => (
                <TouchableOpacity 
                  key={post.id} 
                  style={styles.postItem}
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Post', 'Post clicked!')}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.postUserInfo}>
                      <View style={styles.postAvatar}>
                        {user?.profileImage ? (
                          <Image source={{uri: user.profileImage}} style={styles.postAvatarImage}/>
                        ) : (
                          <Text style={styles.postAvatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={{flex: 1}}>
                        <Text style={styles.postUsername}>{user?.username}</Text>
                        <Text style={styles.postContent} numberOfLines={3} ellipsizeMode="tail">
                          {post.content}
                        </Text>
                        {post.image && <Text style={styles.imageAttached}>[Image Attached]</Text>}
                      </View>
                    </View>
                    <TouchableOpacity onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert('Options', 'Post options');
                    }}>
                      <Text style={styles.postOptionsBtn}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        );
      case 'about':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                {isOwnProfile && (
                  <TouchableOpacity onPress={openBioModal}>
                    <Text style={styles.editBioBtn}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.bioText}>
                {bio || 'No bio yet. Tell people about yourself!'}
              </Text>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'}/>
      {showOption && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={()=>setShowOption(false)}
        />
      )}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={()=>setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${editType}`}
              placeholderTextColor="#888"
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={()=>setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={()=>setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current Password"
                placeholderTextColor="#888"
                secureTextEntry={!showCurrentPassword}
                autoFocus={true}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={()=>setShowCurrentPassword(!showCurrentPassword)}
              >
                <Text style={styles.eyeText}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                placeholderTextColor="#888"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={()=>setShowNewPassword(!showNewPassword)}
              >
                <Text style={styles.eyeText}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm New Password"
                placeholderTextColor="#888"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={()=>setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.passwordHint}>Password must be at least 6 characters</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={()=>setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={savePassword}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFriendsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={()=>setShowFriendsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.friendsModalContainer}>
            <View style={styles.friendsModalHeader}>
              <Text style={styles.friendsModalTitle}>Friends ({friends.length})</Text>
              <TouchableOpacity onPress={()=>setShowFriendsModal(false)}>
                <Text style={styles.friendsModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.friendSearchInput}
              value={friendSearchQuery}
              onChangeText={setFriendSearchQuery}
              placeholder="Search friends..."
              placeholderTextColor="#888"
            />

            <ScrollView style={styles.friendsList}>
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => renderFriendItem(friend))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No friends found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showBioModal}
        transparent={true}
        animationType="fade"
        onRequestClose={()=>setShowBioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Bio</Text>
            <TextInput
              style={[styles.modalInput, styles.bioTextInput]}
              value={bioInput}
              onChangeText={setBioInput}
              placeholder="Write something about yourself..."
              placeholderTextColor="#888"
              multiline={true}
              numberOfLines={4}
              maxLength={200}
              autoFocus={true}
            />
            <Text style={styles.charCount}>{bioInput.length}/200</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={()=>setShowBioModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveBio}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.headerSection}>
       <TouchableOpacity
          style={styles.coverImageContainer}
          onPress={() => {
            if (isOwnProfile) {
              pickImage('cover');
            } else if (coverImage) {
              viewImage(coverImage);
            }
          }}
          disabled={!isOwnProfile && !coverImage}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverImagePlaceholder} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreOption} onPress={()=>setShowOption(!showOption)}>
          <Text style={styles.moreOptionText}>⋮</Text>
        </TouchableOpacity>
        {showOption && (
          <View style={styles.optionContainer}>
            {isOwnProfile && (
              <>
                <TouchableOpacity style={styles.optionItem} onPress={()=>handleOptionMenu('editUsername')}>
                  <Text style={styles.optionText}>Edit Username</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={()=>handleOptionMenu('editHandle')}>
                  <Text style={styles.optionText}>Edit Handle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={()=>handleOptionMenu('editEmail')}>
                  <Text style={styles.optionText}>Edit Email</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={()=>handleOptionMenu('editPassword')}>
                  <Text style={styles.optionText}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionItem, styles.optionItemLast]} onPress={()=>handleOptionMenu('logout')}>
                  <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </>
            )} {!isOwnProfile && (
              <>
                <TouchableOpacity style={styles.optionItem} onPress={()=>handleOptionMenu('addFriend')}>
                  <Text style={styles.optionText}>Add Friend</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={()=>handleOptionMenu('report')}>
                  <Text style={styles.optionText}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionItem, styles.optionItemLast]} onPress={()=>handleOptionMenu('block')}>
                  <Text style={[styles.optionText, styles.blockText]}>Block</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => {
              if (isOwnProfile) {
                pickImage('profile');
              } else if (profileImage) {
                viewImage(profileImage);
              }
            }}
            disabled={!isOwnProfile && !profileImage}
          >
            <View style={styles.profile}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Text style={styles.profilePlaceholder}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.nameFlairContainer}>
            <Text style={styles.username}>{user?.username||'Obese china man'}</Text>   
            <Text style={styles.flair}>{user?.role||'Lesbian'}</Text>
          </View>
          <Text style={styles.handle}>{user?.handle||'@Ratman'}</Text>       
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.rowNav}>
          <TouchableOpacity 
            style={styles.navBtn} 
            onPress={()=>setActiveTab('friends')}
          >
            <Text style={[styles.navText, activeTab === 'friends' && styles.activeNavText]}>
              Friends
            </Text>
            {activeTab === 'friends' && <View style={styles.activeIndicator}/>}
          </TouchableOpacity>
          <View style={styles.line}></View>
          <TouchableOpacity 
            style={styles.navBtn}
            onPress={()=>setActiveTab('posts')}
          >
            <Text style={[styles.navText, activeTab === 'posts' && styles.activeNavText]}>
              Post history
            </Text>
            {activeTab === 'posts' && <View style={styles.activeIndicator}/>}
          </TouchableOpacity>
          <View style={styles.line}></View>
          <TouchableOpacity 
            style={styles.navBtn}
            onPress={()=>setActiveTab('about')}
          >
            <Text style={[styles.navText, activeTab === 'about' && styles.activeNavText]}>
              About
            </Text>
            {activeTab === 'about' && <View style={styles.activeIndicator}/>}
          </TouchableOpacity>
        </View>
        {renderContent()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#7D0AD1",
    flex:1,
  },
  headerSection:{
    position:'relative',
  },
  coverImageContainer:{
    width:'100%',
    height:200,
    backgroundColor:"#E6CCFF",
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverImagePlaceholder:{
    width:'100%',
    height:'100%',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#E6CCFF"
  },
  profileSection:{
    paddingBottom:20,
    paddingTop:0,
    alignItems:'flex-start',
    marginLeft:20,
  },
  profileContainer:{
    marginTop:-60,
    marginBottom:15,
    position:'relative',
  },
  profile:{
    backgroundColor:"#4B0082",
    width:120,
    height:120,
    borderRadius:60,
    justifyContent:'center',
    alignItems:'center',
    borderWidth:5,
    borderColor:'#E6CCFF',
    overflow:'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profilePlaceholder:{
    fontSize:50,
    textAlign:'center',
    color:"#fff"
  },
  moreOption:{
    position:'absolute',
    top:200,
    right:20,
    zIndex:10,
  },
  moreOptionText:{
    color:"#fff",
    fontSize:30,
    fontWeight:'bold',
  },
  username:{
    fontSize:20,
    fontWeight:'bold',
    color:'#fff',
    marginLeft:10,
  },
  flair:{
    fontSize:15,
    paddingVertical:5,
    paddingHorizontal:10,
    borderRadius:30,
    fontWeight:'bold',
    backgroundColor:'#FFCC00',
    marginLeft:10,
  },
  nameFlairContainer:{
    flexDirection:'row',
  },
  handle:{
    fontSize:15,
    fontWeight:'thin',
    color:"#fff",
    marginLeft:10,
    marginTop:5,
  },
  contentContainer:{
    backgroundColor:"#4B0082",
    position:'absolute',
    borderRadius:50,
    width:412,
    height:740,
    left:0,
    top:400,
  },
  rowNav:{
    flexDirection:'row',
    paddingHorizontal:10,
    paddingVertical:30,
    justifyContent:'space-evenly'
  },
  navText:{
    color:"#fff",
    fontWeight:'bold',
  },
  activeNavText:{
    color:'#FFCC00',
  },
  navBtn:{
    paddingTop:8,
    alignItems:'center',
  },
  activeIndicator:{
    width:60,
    height:3,
    backgroundColor:'#FFCC00',
    marginTop:5,
    borderRadius:2,
  },
  line:{
    width:2,
    height:40,
    backgroundColor:"#fff",
    alignSelf:'center'
  },
  optionContainer:{
    position:'absolute',
    top:240,
    right:20,
    backgroundColor:'#fff',
    borderRadius:10,
    minWidth:150,
    shadowColor:'#000',
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.25,
    shadowRadius:3.84,
    elevation:5,
    zIndex:999,
  },
  optionItem:{
    paddingVertical:12,
    paddingHorizontal:16,
    borderBottomWidth:1,
    borderBottomColor:'#E6CCFF',
  },
  optionItemLast:{
    borderBottomWidth:0,
  },
  optionText:{
    fontSize:14,
    color:'#4B0082',
    fontWeight:'500',
  },
  logoutText:{
    color:'#DC3545',
  },
  blockText:{
    color:'#DC3545',
  },
  overlay:{
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    zIndex:998,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    color: '#4B0082',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    color: '#333',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6CCFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E6CCFF',
  },
  saveButton: {
    backgroundColor: '#7D0AD1',
  },
  cancelButtonText: {
    color: '#4B0082',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E6CCFF',
  },
  passwordInput: {
    flex: 1,
    color: '#333',
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  eyeText: {
    fontSize: 20,
  },
  passwordHint: {
    color: '#888',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContent: {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 10,
  paddingBottom: 100,
},
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  friendGridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  friendGridAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#7D0AD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E6CCFF',
  },
  friendGridAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  friendGridAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  friendGridMore: {
    backgroundColor: '#E6CCFF',
  },
  friendGridMoreText: {
    color: '#4B0082',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendGridUsername: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  emptyState: {
    marginTop:150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#E6CCFF',
    fontSize: 16,
    fontWeight: '500',
  },
  friendsModalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  friendsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4B0082',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  friendsModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendsModalClose: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  friendSearchInput: {
    backgroundColor: '#F5F5F5',
    color: '#333',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6CCFF',
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6CCFF',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7D0AD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  friendAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  friendAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  friendUsername: {
    color: '#4B0082',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  friendHandle: {
    color: '#888',
    fontSize: 14,
  },
  postItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginBottom:10,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  postUserInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  postAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#7D0AD1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E6CCFF',
  },
  postAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22.5,
  },
  postAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postUsername: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postContent: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  imageAttached: {
    color: '#E6CCFF',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  postOptionsBtn: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
  bioSection: {
    paddingVertical:5,
    paddingHorizontal:10,
    marginBottom: 15,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  editBioBtn: {
    color:"#fff",
    fontSize: 14,
    fontWeight:'bold',
  },
  bioText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 25,
    textAlign:'center',
    marginTop:40
  },
  bioTextInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 15,
  },
});