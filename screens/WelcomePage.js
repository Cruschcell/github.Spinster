import { StyleSheet, Text, View, StatusBar, TouchableOpacity} from 'react-native'
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function WelcomePage({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content"/>
        <View style={styles.topContent}>
            <Text style={styles.text}>Welcome to {"\n"}Spinster</Text>
            <Text style={styles.subText}>The social media app more addicting than meth and real gambling.</Text>
        </View>
        <View style={styles.bottomContent}>
            <TouchableOpacity style={styles.signUpBtn} onPress={()=>navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign-up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginBtn} onPress={()=>navigation.navigate('Login')}>
                <Text style={styles.loginText}>Log-in</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container:{
        backgroundColor:"#E6CCFF",
        justifyContent:'center',
        alignItems:'center',
        flex:1,
    },
    text:{
        color:"#4B0082",
        fontSize:35,
        marginBottom:10,
        fontWeight:'bold',
    },
    subText:{
        color:"#4B0082",
        fontSize:20,
        fontWeight:"500",
    },
    signUpBtn:{
        marginVertical:10,
        paddingVertical:10,
        paddingHorizontal:40,
        backgroundColor:"#FFCC00",
        borderRadius:15,
        shadowColor:"#000",
        shadowOffset:{width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius:4,
        elevation:4,
    },
    signUpText:{
        color:"#000",
        fontSize:20,
        fontWeight:'bold',
        textAlign:'center',
    },
    loginBtn:{
        marginVertical:10,
        paddingVertical:10,
        paddingHorizontal:40,
        backgroundColor:"#000080",
        borderRadius:15,
        shadowColor:"#000",
        shadowOffset:{width:0, height:4},
        shadowOpacity:0.25,
        shadowRadius:4,
        elevation:4,
    },
    loginText:{
        color:"#fff",
        fontSize:20,
        fontWeight:'bold',
        textAlign:'center',
    },
    topContent:{
        bottom:230,
        marginHorizontal:30,
    },
    bottomContent:{
        top:200,
    }
})
