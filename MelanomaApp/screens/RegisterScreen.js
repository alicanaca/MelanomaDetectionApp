import React, { useState } from "react";
import {
    Text,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    ImageBackground,
}
    from "react-native";
import {
    Button,
    ButtonText,
    ButtonGroup,
} from "@/components/ui/button"
import axios from "axios";
import { BlurView } from "expo-blur";

export default function RegisterScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            if (!email || !password || !username) {
                Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
                return;
            } else {
                const response = await axios.post(
                    "http://192.168.1.17:5000/api/users/register",
                    {
                        email,
                        password,
                        username,
                    }
                );
                Alert.alert("Başarılı", "Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
                navigation.replace("Login");
            }
        } catch (error) {
            Alert.alert("Hata", "Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.");
            console.error(error);
        }
    };

    const handleTouchablePress = (event) => {
        const target = event.target;

        // Eğer hedef bir butonsa ve onPress fonksiyonu varsa çalıştır
        if (target && target.__internalInstanceHandle) {
            if (target.__internalInstanceHandle.memoizedProps.children === "Already have an account?") {
                navigation.navigate("Login");
                return;
            } else if (target.__internalInstanceHandle.memoizedProps.children === "Register") {
                handleRegister();
                return;
            }
        }

        Keyboard.dismiss();
    }

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
                        <Text style={styles.title}>Melanoma App</Text>
                        <TextInput
                            placeholder="Your name"
                            value={username}
                            onChangeText={setUsername}
                            style={styles.input}
                        />
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
                                action="primary" onPress={handleRegister}
                                style={{ marginBottom: 4, width: '90%' }}
                            >
                                <ButtonText>Register</ButtonText>
                            </Button>
                            <Button
                                size="xl" variant="solid" action="secondary"
                                onPress={() => navigation.navigate("Login")}
                                style={{ width: '90%' }}
                            >
                                <ButtonText>Already have an account?</ButtonText>
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
