import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { api } from '../services/api';
import { GOOGLE_API_KEY } from '@env';
import * as Location from 'expo-location';

let NativeMapView: any = null;
if (Platform.OS !== 'web') {
    NativeMapView = require('./native/NativeMapView').default;
}

interface Restaurant {
    id: string; // place_id
    name: string;
    address: string; // vicinity
    rating: number;
    photos: string[];
    isOpen: boolean; // opening_hours.open_now
    location: {
        lat: number;
        lng: number;
    };
}

const HealthyRestaurantsScreen = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [region, setRegion] = useState({
        latitude: 22.3193,
        longitude: 114.1694,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [searchRadius, setSearchRadius] = useState(1500);
    const [locationName, setLocationName] = useState<string>('');

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const fetchLocationName = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
            );
            const data = await response.json();
            console.log('Geocode API result:', data);
            if (data.results && data.results.length > 0) {
                setLocationName(data.results[0].formatted_address);
            } else {
                setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
        } catch {
            setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
    };

const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required!');
        setLoading(false);
        return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    await fetchLocationName(latitude, longitude);
    await refreshRestaurantsWithCoords(latitude, longitude);
};

const refreshRestaurantsWithCoords = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
        const response = await api.getNearbyHealthyRestaurants(
            latitude,
            longitude,
            searchRadius
        );
        if (response.success) {
            setRestaurants(response.data);
            setError(null);
        } else {
            setError('Failed to load restaurants');
        }
    } catch (err) {
        setError('Failed to refresh restaurants');
    } finally {
        setLoading(false);
    }
};

    const refreshRestaurants = async () => {
        setLoading(true);
        try {
            const response = await api.getNearbyHealthyRestaurants(
                region.latitude,
                region.longitude,
                searchRadius
            );
            if (response.success) {
                setRestaurants(response.data);
            }
        } catch (err) {
            setError('Failed to refresh restaurants');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (Platform.OS === 'web') {
        console.log('restaurants data:', restaurants);
        return (
            <ScrollView style={styles.webContainer}>
                <Text style={styles.webTitle}>Healthy restaurant search</Text>
                <Text style={styles.webMessage}>
                    Current location: {locationName}
                </Text>
                <Text style={styles.webMessage}>
                    Search radius: {searchRadius / 1000}km
                </Text>
                {restaurants.map(restaurant => (
                    <View key={restaurant.id} style={styles.webRestaurantCard}>
                        {restaurant.photos && restaurant.photos.length > 0 ? (
                            <Image
                                source={{ uri: restaurant.photos[0] }}
                                style={styles.webRestaurantImage}
                            />
                        ) : (
                            <View style={[styles.webRestaurantImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}>
                                <Text style={{ color: '#aaa' }}>No Image</Text>
                            </View>
                        )}
                        <View style={styles.webRestaurantInfo}>
                            <Text style={styles.webRestaurantName}>{restaurant.name}</Text>
                            <Text style={styles.webRestaurantAddress}>{restaurant.address}</Text>
                            <View style={styles.webRestaurantDetails}>
                                <Text style={styles.webRestaurantRating}>⭐ {restaurant.rating}</Text>
                                <Text style={styles.webRestaurantStatus}>
                                    {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        );
    }


    return NativeMapView ? (
        <NativeMapView
            region={region}
            setRegion={setRegion}
            restaurants={restaurants}
            searchRadius={searchRadius}
            setSearchRadius={setSearchRadius}
            refreshRestaurants={refreshRestaurants}
            styles={styles}
        />
    ) : null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calloutContainer: {
        width: 200,
        padding: 10,
    },
    calloutImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    calloutAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    calloutInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    calloutRating: {
        fontSize: 12,
        color: '#666',
    },
    calloutStatus: {
        fontSize: 12,
        color: '#666',
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
    },

    controlsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    radiusText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    slider: {
        width: '100%',
        height: 40,
    },

    // 添加Web平台特定样式
    webContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    webTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    webMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    webRestaurantCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    webRestaurantImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    webRestaurantInfo: {
        padding: 10,
    },
    webRestaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    webRestaurantAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    webRestaurantDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    webRestaurantRating: {
        fontSize: 14,
        color: '#666',
    },
    webRestaurantStatus: {
        fontSize: 14,
        color: '#666',
    },
});

export default HealthyRestaurantsScreen;