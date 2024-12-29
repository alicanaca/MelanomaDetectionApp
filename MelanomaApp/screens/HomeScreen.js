import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    Alert,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    View,
    Image,
    Text,
    Modal,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
    const [previousScans, setPreviousScans] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedScan, setSelectedScan] = useState(null);
    const [userId, setUserId] = useState(null);
    const serverUrl = "http://192.168.1.17:5000"; // Sunucu URL
    const imageUrl = "http://192.168.1.17:8080"; // Resim URL
    const [refreshKey, setRefreshKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const fetchUserIdAndScans = async () => {
                try {
                    const userId = await AsyncStorage.getItem("userId");
                    setUserId(userId);
                    if (userId) {
                        fetchPreviousScans(userId);
                    } else {
                        console.error("User ID not found in AsyncStorage.");
                    }
                } catch (error) {
                    console.error("Error fetching user ID from AsyncStorage:", error);
                }
            };
            fetchUserIdAndScans();
        }, [refreshKey]));

    const fetchPreviousScans = async (userId) => {
        try {
            const response = await axios.get(`${serverUrl}/api/files/analyses?userId=${userId}`);
            setPreviousScans(response.data.analyses || []);
        } catch (error) {
            console.error("Error fetching previous scans:", error);
        }
    };

    const deleteScan = async (scanId) => {
        try {
            await axios.delete(`${serverUrl}/api/files/delete/${scanId}`);
            setRefreshKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error("Error deleting scan:", error);
        }
    };

    const openModal = (scan) => {
        setSelectedScan(scan);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedScan(null);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.content}>
                {previousScans.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 20 }}>
                        No previous scans found.
                    </Text>
                ) : null}
                {previousScans.map(({ id, image_path, created_at, prediction, confidence }) => (
                    <TouchableOpacity
                        key={id}
                        onPress={() => {
                            openModal({ id, image_path, created_at, prediction, confidence });
                        }}
                    >
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <Image
                                    resizeMode="cover"
                                    style={styles.cardImg}
                                    source={{ uri: `${imageUrl}/${userId}/${image_path}` }}
                                />
                            </View>
                            <View style={styles.cardBody}>
                                <Text style={styles.cardDate}>Scan Date:  {new Date(created_at).toLocaleTimeString()}, {new Date(created_at).toLocaleDateString()}</Text>
                                <Text style={styles.cardRiskLevel}>
                                    Prediction: <Text style={{ fontWeight: '700' }}>{prediction === 0 ? 'Benign' : 'Malignant'}</Text>
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Modal */}
            {selectedScan && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeModal}
                            >
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            <Image
                                resizeMode="cover"
                                style={styles.modalImg}
                                source={{ uri: `${imageUrl}/${userId}/${selectedScan.image_path}` }}
                            />
                            <Text style={styles.modalTitle}>Analysis Details</Text>
                            <Text style={styles.modalText}>
                                Prediction: {selectedScan.prediction === 0 ? 'Benign' : 'Malignant'}
                            </Text>
                            <Text style={styles.modalText}>
                                Confidence: {(selectedScan.confidence * 100).toFixed(2)}%
                            </Text>
                            <TouchableOpacity style={styles.button} onPress={() => {
                                Alert.alert(
                                    "Confirm Deletion",
                                    "Are you sure you want to delete this scan?",
                                    [
                                        {
                                            text: "Cancel",
                                            style: "cancel", // Kullanıcı işlemi iptal etmek isterse
                                        },
                                        {
                                            text: "Delete",
                                            onPress: () => {
                                                deleteScan(selectedScan.id); // Silme işlemini gerçekleştir
                                                closeModal(); // Modalı kapat
                                            },
                                            style: "destructive", // Kırmızı renkli bir vurgu (iOS için)
                                        },
                                    ],
                                    { cancelable: true } // Kullanıcı Alert'in dışına tıklarsa kapatılabilir
                                );
                            }}>
                                <Text style={styles.buttonText}>Delete this scan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    button: {
        backgroundColor: "#ff6f61",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTop: {
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    cardImg: {
        resizeMode: 'contain',
        width: '100%',
        height: '100%',
    },
    cardBody: {
        padding: 16,
    },
    cardDate: {
        fontSize: 14,
        color: '#888',
    },
    cardRiskLevel: {
        fontSize: 16,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ff5c5c',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalImg: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        color: '#555',
    },
});
