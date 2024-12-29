import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function AnalyzeScreen() {
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [photoUri, setPhotoUri] = useState(null);
    const navigation = useNavigation();

    const openCameraOrGallery = async (type) => {
        try {
            const permission =
                type === "camera"
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permission.status !== "granted") {
                Alert.alert("İzin Gerekli", `${type === "camera" ? "Kamera" : "Galeri"} erişimi için izin vermelisiniz.`);
                return;
            }

            const result =
                type === "camera"
                    ? await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        quality: 1,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        quality: 1,
                    });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                const userId = await AsyncStorage.getItem("userId");

                const formData = new FormData();
                formData.append("image", {
                    uri,
                    type: "image/jpeg",
                    name: "photo.jpg",
                });
                formData.append("userId", userId);

                setModalVisible(true);
                setIsLoading(true);
                setPhotoUri(uri);

                try {
                    const response = await axios.post(
                        `http://192.168.1.17:5000/api/files/upload?userId=${userId}`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    setAnalysisResult(response.data);
                } catch (error) {
                    console.error("Fotoğraf yükleme hatası:", error);
                    Alert.alert("Hata", "Fotoğraf yüklenirken bir hata oluştu.");
                }
            } else {
                Alert.alert("İptal Edildi", `${type === "camera" ? "Kamera" : "Galeri"} işlemi iptal edildi.`);
            }
        } catch (error) {
            console.error(`${type} hatası:`, error);
            Alert.alert("Hata", `${type === "camera" ? "Kamera" : "Galeri"} işlemi sırasında bir hata oluştu.`);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setAnalysisResult(null);
        navigation.navigate("Home");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Skin Analysis</Text>
            <Text style={styles.description}>
                Start analyzing your skin by taking a photo or selecting one from your gallery. Our AI will provide risk evaluations based on your scan.
            </Text>

            <Image
                source={{
                    uri: "https://img.icons8.com/clouds/100/camera.png",
                }}
                style={styles.icon}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => openCameraOrGallery("gallery")}>
                    <Text style={styles.buttonText}>Pick from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => openCameraOrGallery("camera")}>
                    <Text style={styles.buttonText}>Use Camera</Text>
                </TouchableOpacity>
            </View>

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

                        {isLoading ? (
                            <ActivityIndicator
                                size="large"
                                color="#0000ff"
                                style={styles.activityIndicator}
                            />
                        ) : (
                            <View style={styles.resultContainer}>
                                {/* Fotoğraf */}
                                {photoUri && (
                                    <Image
                                        source={{ uri: photoUri }}
                                        style={styles.photoPreview}
                                    />
                                )}

                                {/* Başlık */}
                                <Text style={styles.resultTitle}>
                                    Analysis Result
                                </Text>

                                {/* Sonuç ve Bilgilendirme */}
                                {analysisResult ? (
                                    <>
                                        {/* Prediction Durumu */}
                                        {analysisResult.prediction === 0 ? (
                                            <Text style={styles.safeText}>
                                                The analyzed area appears benign. 🎉
                                            </Text>
                                        ) : (
                                            <Text style={styles.riskText}>
                                                Potential risk detected! ⚠️ Please consult a specialist.
                                            </Text>
                                        )}

                                        {/* Güven Derecesi Açıklaması */}
                                        <Text style={styles.infoText}>
                                            Confidence: {Math.round(analysisResult.confidence * 100)}%
                                        </Text>

                                        <Text style={styles.additionalInfo}>
                                            {(() => {
                                                const confidence = analysisResult.confidence;
                                                if (confidence >= 0.8) {
                                                    return "This analysis is highly confident in its prediction. Please consider this result seriously.";
                                                } else if (confidence >= 0.55) {
                                                    return "The analysis shows moderate confidence. While not definitive, it's advisable to consult a specialist for a second opinion.";
                                                } else {
                                                    return "The analysis shows low confidence in its prediction. It might be worthwhile to reanalyze with a clearer image.";
                                                }
                                            })()}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.noResultText}>
                                        No result available. Please try again.
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    activityIndicator: {
        marginTop: "85%",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    description: {
        textAlign: "center",
        marginBottom: 20,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    icon: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        width: "90%",
    },
    button: {
        backgroundColor: "#ff6f61",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: "85%",
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#ff5c5c",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    resultContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    safeText: {
        color: '#4CAF50', // Yeşil renk
        fontSize: 22, // Önemli sonucu büyüttük
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    riskText: {
        color: '#F44336', // Kırmızı renk
        fontSize: 22, // Risk sonucu büyüttük
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 18, // Güven derecesi büyütüldü
        color: '#555',
        marginBottom: 10,
        textAlign: 'center',
    },
    additionalInfo: {
        fontSize: 18, // Ek bilgiler büyütüldü
        color: '#007BFF',
        marginTop: 10,
        textAlign: 'center',
    },
    noResultText: {
        fontSize: 18, // Sonuç yok yazısı büyütüldü
        color: '#555',
        textAlign: 'center',
    },
    photoPreview: {
        width: 200, // Görüntü büyütüldü
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
});