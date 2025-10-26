import { StyleSheet, Text, View, StatusBar, Image, TouchableOpacity, Alert, Animated, Dimensions, PanResponder} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState,useEffect, useRef} from 'react';
import Wheel from 'react-native-spin-the-wheel';

const {height} = Dimensions.get('window');


export default function HomePage({navigation}) {
  const [winnerPost, setWinnerPost]=useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setIsMenuOpen(false));
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  const segments = [
    { text: 'Post #1', textColour: 'black', backgroundColour: '#FFCC00' },
    { text: 'Post #2', textColour: 'black', backgroundColour: '#fff' },
    { text: 'Post #3', textColour: 'black', backgroundColour: '#FFCC00' },
    { text: 'Post #4', textColour: 'black', backgroundColour: '#fff' },
    { text: 'Post #5', textColour: 'black', backgroundColour: '#FFCC00' },
    { text: 'Post #6', textColour: 'black', backgroundColour: '#fff' },
  ];

  const finishedSpinning = (segment)=>{
    console.log('Winner', segment);
    setWinnerPost(segment);
    Alert.alert('Winner: ',segment);
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.rouletteHeaderText}>Le Roulette</Text>
      <StatusBar barStyle={'light-content'}/>
      <View style={styles.wheelContainer}>
        <View style={styles.wheelWrapper}>
          <Image
            source={require('../assets/lightbulbs.png')}
            style={styles.lightbulbsImage}
          />
          <View style={styles.wheelInner}>
            <Wheel
              segments={segments}
              segColors={segments.map((segment) => segment.backgroundColour)}
              onFinished={(segment) => finishedSpinning(segment.text)}
              textColors={segments.map((segment) => segment.textColour)}
              buttonText="Spin 3/3"
              backgroundImage={require('../assets/out.png')}
              buttonTextStyles={{
                color:"#000",
                fontWeight:'bold'
              }}
              outlineWidth={1}
              buttonStyle={{
                backgroundColor: '#FFCC00',
                shadowColor:"#000",
                shadowOffset:{width:0,height:4},
                shadowOpacity:0.6,
                shadowRadius:4,
                elevation:10
              }}
              size={300}
            />
            <TouchableOpacity style={styles.viewPostBtn}>
              <Text style={styles.viewBtnText}>View Post</Text>
            </TouchableOpacity>
            <Image
              source={require('../assets/pin.png')}
              style={styles.centerImage}
            />
          </View>
        </View>
      </View>
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
            {...panResponder.panHandlers}
            style={[
              styles.menuContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}>
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
  )
}

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#7D0AD1",
    flex:1,
  },
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelWrapper: {
    width: 360,
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    bottom:35,
  },
  lightbulbsImage: {
    position: 'absolute',
    width: 450,
    height: 435,
    zIndex:5,
    bottom:13,
  },
  wheelInner: {
    width: 350,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  centerImage: {
    position: 'absolute',
    width: 60,
    height: 60,
    top: 95,
    left: 145,
    zIndex: 10,
  },
  winnerText: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign:'center',
    bottom:120,
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
  rouletteHeaderText:{
    color:"#FFCC00",
    fontSize:65,
    position:'absolute',
    alignSelf:'center',
    marginTop:30,
  },
  viewPostBtn:{
    backgroundColor:"#0000B3",
    paddingVertical:17,
    borderRadius:12,
    padding:10,
    position:'absolute',
    bottom:-150,
    shadowColor:"#000",
    shadowOffset:{width:0,height:8},
    shadowOpacity:0.5,
    shadowRadius:10,
    elevation:20
  },
  viewBtnText:{
    color:"#fff",
    fontWeight:'bold',
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
})