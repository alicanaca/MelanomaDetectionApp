import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import axios from "axios";
import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
    const [userData, setUserData] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            const token = await AsyncStorage.getItem("token");

            const AuthStr = `Bearer ${token}`;

            if (!userId) {
                console.error("User ID not found");
                return;
            }

            const response = await axios.get(`http://192.168.1.17:5000/api/profile/${userId}`, {
                headers: {
                    'Authorization': AuthStr,
                },
            });

            setUserData({ name: response.data.user.username, email: response.data.user.email });

        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            // Kullanıcıdan onay iste
            Alert.alert(
                "Sign Out",
                "Are you sure you want to sign out?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Sign Out",
                        onPress: async () => {
                            // AsyncStorage'den tüm oturum bilgilerini temizle
                            await AsyncStorage.removeItem("token");
                            await AsyncStorage.removeItem("userId");

                            console.log("User signed out successfully!");

                            // Giriş ekranına yönlendir (örnek navigation)
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "Login" }],
                            });
                        },
                    },
                ],
                { cancelable: true }
            );
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Yükleniyor... */
                loading ? (
                    <ActivityIndicator size="large" color="#ff6f61" />
                ) : (
                    <>
                        <Image
                            source={{
                                uri: "https://img.icons8.com/bubbles/200/user.png",
                            }}
                            style={styles.profileImage}
                        />

                        {/* Kullanıcı Bilgileri */}
                        <View style={styles.infoCard}>
                            <Text style={styles.name}>Welcome {userData.name}! </Text>
                            <Text style={styles.email}>Email: {userData.email} </Text>
                        </View>

                        {/* Çıkış Yap Butonu */}
                        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: "center",
        marginBottom: 20,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        color: "#777",
    },
    signOutButton: {
        backgroundColor: "#ff6f61",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    signOutText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
});
