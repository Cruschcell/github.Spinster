import { StyleSheet, Text, View, StatusBar, TextInput, TouchableOpacity, Alert} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context';
import React,{useState,useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUp({navigation}) {
  const[username,setUsername]=useState("");
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[retypePassword,setRetypePassword]=useState("");

  const validateCredentials = () =>{
    const hasNumber=/\d/;
    const hasSpecialChar=/[!@#$%^&*(),.?":{}|<>]/
    const validations = [
      {condition: !username.trim(), message: 'Please enter a username!'},
      {condition: !email.trim(), message: 'Please enter an email!'},
      {condition: !password, message: 'Please enter a password!'},
      {condition: password<10, message: 'Password must be at least 10 characters long!'},
      {condition: !hasNumber.test(password), message: 'Password must contain at least 1 number'},
      {condition: !hasSpecialChar.test(password), message: 'Password must contain at least 1 special character!'},
      {condition:password!==retypePassword, message: 'Password does not match!'},
    ];
    for(const v of validations){
      if(v.condition){
        Alert.alert("Invalid input", v.message);
        return false;
      }
    }
    return true;
  }
  const handleSignUp = async () =>{
    if(!validateCredentials()){
      return;
    }
    try{
      const existingUsersJson = await AsyncStorage.getItem('users');
      const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson):[];
      const userExists = existingUsers.find(
        user =>user.username === username || user.email === email
      );
      if (userExists){
        Alert.alert('Username or email already exists','Please try another one');
        return;
      }
      const newUser={
        id:Date.now().toString(),
        username:username.trim(),
        email:email.trim(),
        password:password,
        role:"user",
        handle:`@${username.trim()}`,
        createdAt: new Date().toString(),
      };
      existingUsers.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(existingUsers));
      Alert.alert(
        'Registration successful', 'You can now log in using your credentials',
        [
          {
            text:'OK',
            onPress:()=>{
              navigation.navigate('WelcomePage'),
              setUsername(""),
              setEmail(""),
              setPassword(""),
              setRetypePassword("");
            },
          },
        ]
      );
      console.log('User has been registered', newUser);
    }catch (e){
      console.log('User failed registration',e);
      Alert.alert('Error','Failed to register, please try again');
    }
  }
  // useEffect(()=>{
  //   const clearStorage = async () =>{
  //     try{
  //       await AsyncStorage.clear();
  //       console.log('Async cleared')
  //     } catch(e){
  //       console.log('Async not cleared')
  //     }
  //   };
  //   clearStorage();
  // },[]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content"/>
      <TouchableOpacity style={styles.backBtn} onPress={()=>navigation.navigate('WelcomePage')}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>Sign-Up</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput style={styles.input}
            placeholder='Username' value={username}
            onChangeText={setUsername} autoCorrect={false}/>
          <TouchableOpacity style={styles.clearBtn} onPress={()=> setUsername("")}>
            <Text style={styles.clearnBtnText}>✖</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.input} 
            placeholder='Email' value={email}
            onChangeText={setEmail} autoCorrect={false}/>
          <TouchableOpacity style={styles.clearBtn} onPress={()=>setEmail("")}>
            <Text style={styles.clearnBtnText}>✖</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput style={styles.input} 
            placeholder='Password' value={password}
            onChangeText={setPassword} autoCorrect={false}/>
          <TouchableOpacity style={styles.clearBtn} onPress={()=>setPassword("")}>
            <Text style={styles.clearnBtnText}>✖</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Re-enter Password</Text>
          <TextInput style={styles.input} 
            placeholder='Password' value={retypePassword}
            onChangeText={setRetypePassword} autoCorrect={false}/>
          <TouchableOpacity style={styles.clearBtn} onPress={()=>setRetypePassword("")}>
            <Text style={styles.clearnBtnText}>✖</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
          <Text style={styles.btnText}>Sign-Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.alreadyHaveBtn} onPress={()=>navigation.navigate('Login')}>
          <Text style={styles.alreadyText}>Already have an account?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    backgroundColor:"#7D0AD1",
    flex:1,
  },
  contentContainer:{
    backgroundColor:"#4B0082",
    position:'absolute',
    borderRadius:50,
    width:412,
    height:755,
    left:0,
    top:195,
  },
  backBtn:{
    marginLeft:10,
  },
  backBtnText:{
    fontSize:50,
    color:"#fff"
  },
  headerText:{
    color:"#fff",
    fontSize:25,
    fontWeight:'bold',
    textAlign:'center',
    marginVertical:35,
  },
  inputContainer: {
    width:"80%",
    alignSelf:'center',
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    width:"100%",
    paddingVertical:15,
    paddingHorizontal:20,
    backgroundColor: '#fff',
    borderTopLeftRadius:8,
    borderTopRightRadius:8,
    fontSize: 15,
    color: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  inputLabel:{
    fontSize:15,
    fontWeight:'regular',
    color:"#fff",
    marginBottom:10,
  },
  signUpBtn:{
    backgroundColor:"#FFCC00",
    borderRadius:15,
    paddingVertical:15,
    paddingHorizontal:25,
    alignSelf:'center',
    marginTop:20,
    shadowColor:"#000",
    shadowOffset:{width:0, height:4},
    shadowOpacity:0.25,
    shadowRadius:4,
    elevation:5,
  },
  btnText:{
    color:"#000",
    fontWeight:'bold',
    fontSize:20,
  },
  alreadyHaveBtn:{
    margin:20,
  },
  alreadyText:{
    color:"#fff",
    fontSize:15,
    textAlign:'center',
    fontWeight:'400',
  },
  clearBtn:{
    position:'absolute',
    right:15,
    top:'63%',
    transform:[{translateY: -10}],
    width:24,
    height:24,
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center'
  },
  clearnBtnText:{
    color:"#000",
    fontSize:15,
  }
})
