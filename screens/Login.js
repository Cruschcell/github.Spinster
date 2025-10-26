import { StyleSheet, Text, View, StatusBar, TouchableOpacity, TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState,useEffect} from 'react'


export default function Login({navigation}) {
    // useEffect(()=>{
    //     const clearStorage = async () =>{
    //     try{
    //         await AsyncStorage.clear();
    //         console.log('Async cleared')
    //     } catch(e){
    //         console.log('Async not cleared')
    //     }
    //     };
    //     clearStorage();
    // },[]);

    const[username,setUsername]=useState("");
    const[password,setPassword]=useState("");

    const handleLogin = async() =>{
        if(!username.trim() || !password){
            Alert.alert('Please enter both username or email and password!');
            return;
        }
        try{
            const usersJson = await AsyncStorage.getItem('users');
            const users = usersJson ? JSON.parse(usersJson):[];
            const inputValue = username.trim().toLowerCase();

            const user = users.find(u=>{
                const matchUsername = u.username.toLowerCase()===inputValue;
                const matchEmail = u.email.toLowerCase()===inputValue;
                const matchPassword = u.password === password;

                return (matchUsername || matchEmail) && matchPassword;
            });
            if(user){
                if(user.banned){
                    Alert.alert('Account banned', 'Your account has been by banned by an administrator');
                    return;
                }
                else if(user.suspended){
                    Alert.alert('Account suspended', 'Come back later bitchass');
                    return;
                }
                await AsyncStorage.setItem('currentUser', JSON.stringify({isLoggedIn:true,...user}));
                Alert.alert('Login Successful', `Welcome, ${user.username}`,[
                    {text:'ok',onPress:()=>navigation.navigate('HomePage')}
                ]);
            }else{
                Alert.alert('Login Failed','Invalid Username/Email or Password')
            }
        }catch(e){
            console.log('Login error', e),
            Alert.alert('Error', 'Failed to login, please try again')
        }
    }

    return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content"/>
        <TouchableOpacity style={styles.backBtn} onPress={()=>navigation.navigate('WelcomePage')}>
            <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.contentContainer}>
            <Text style={styles.headerText}>Login</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username or Email</Text>
                <TextInput style={styles.input}
                placeholder='Username or Email' value={username} onChangeText={setUsername}/>
                <TouchableOpacity style={styles.clearBtn} onPress={()=>setUsername("")}>
                    <Text style={styles.clearBtnText}>✖</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput style={styles.input}
                placeholder='Password' value={password} onChangeText={setPassword}/>
                <TouchableOpacity style={styles.clearBtn} onPress={()=>setPassword("")}>
                    <Text style={styles.clearBtnText}>✖</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dontHaveBtn} onPress={()=>navigation.navigate('SignUp')}>
                <Text style={styles.dontHaveText}>Don't have an account?
                    Register here
                </Text>
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
        position:'Absolute',
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
    inputContainer:{
        width:"80%",
        alignSelf:'center',
        marginBottom:20,
        position:'relative',
    },
    input:{
        width:"100%",
        paddingVertical:15,
        paddingHorizontal:20,
        backgroundColor:"#fff",
        borderTopLeftRadius:8,
        borderTopRightRadius:8,
        fontSize:15,
        color:'#000',
        borderBottomWidth:2,
        borderBottomColor:"#000",
    },
    inputLabel:{
        fontSize:15,
        fontWeight:'regular',
        color:"#fff",
        marginBottom:10,
    },
    loginBtn:{
        backgroundColor:"#FFCC00",
        borderRadius:15,
        paddingVertical:15,
        paddingHorizontal:15,
        alignSelf:'center',
        marginTop:20,
        shadowColor:"#000",
        shadowOffset:{width:0,height:4},
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:5
    },
    loginBtnText:{
        color:"#000",
        fontWeight:'bold',
        fontSize:20,
    },
    dontHaveBtn:{
        margin:20,
    },
    dontHaveText:{
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
        alignItems:'center',
    },
    clearBtnText:{
        color:"#000",
        fontSize:15,
    }
})