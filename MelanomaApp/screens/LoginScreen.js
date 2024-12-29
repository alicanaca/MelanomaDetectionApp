import React, { useState } from "react";
import {
    Text,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ImageBackground,
} from "react-native";
import {
    Button,
    ButtonText,
    ButtonGroup,
} from "@/components/ui/button"
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://192.168.1.17:5000/api/users/login", {
                email,
                password,
            });

            const token = response.data.token;
            const userId = response.data.userId;

            // Token ve userId'i sakla
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("userId", userId.toString());

            // Giriş başarılıysa
            Alert.alert("Başarılı", "Giriş başarılı!");
            navigation.replace("Main"); // Ana ekrana yönlendir
        } catch (error) {
            Alert.alert("Hata", "Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
            console.error(error);
        }
    };

    const handleTouchablePress = (event) => {
        const target = event.target;

        // Eğer hedef bir butonsa ve onPress fonksiyonu varsa çalıştır
        if (target && target.__internalInstanceHandle) {
            if (target.__internalInstanceHandle.memoizedProps.children === "Don't have an account?") {
                navigation.navigate("Register");
                return;
            } else if (target.__internalInstanceHandle.memoizedProps.children === "Login") {
                handleLogin();
                return;
            }
            return;
        }

        Keyboard.dismiss();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
                <TouchableWithoutFeedback onPress={handleTouchablePress}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <BlurView
                            style={styles.blurOverlay}
                            intensity={50}
                        />
                        <Text style={styles.title}>Welcome to our</Text>
                        <Text style={styles.title}>Melanoma Detection App!</Text>
                        <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                        <ButtonGroup style={styles.buttonGroup}>
                            <Button
                                size="xl" variant="solid"
                                action="primary" onPress={handleLogin}
                                style={{ marginBottom: 4, width: '90%' }}
                            >
                                <ButtonText>Login</ButtonText>
                            </Button>
                            <Button
                                size="xl" variant="solid" action="secondary"
                                onPress={() => navigation.navigate("Register")}
                                style={{ width: '90%' }}
                            >
                                <ButtonText>Don't have an account?</ButtonText>
                            </Button>
                        </ButtonGroup>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    blurOverlay: {
        ...StyleSheet.absoluteFillObject, // Blur efekti tam ekran yayılır
    },
    background: {
        position: "absolute",
        resizeMode: "cover",
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'black',
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
        textDecorationColor: 'black',
    },
    input: {
        width: '90%',
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    buttonGroup: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});