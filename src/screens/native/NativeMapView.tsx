import React from 'react';
import { View, Text, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Slider from "@react-native-community/slider";

//download the required packages npm install react-native-maps@1.7.1
//npx expo prebuild --clean

const renderRestaurantMarker = (restaurant: any, styles: any) => (
    <Marker
        key={restaurant.id}
        coordinate={{
            latitude: restaurant.location.lat,
            longitude: restaurant.location.lng,
        }}
        title={restaurant.name}
    >
        <Callout>
            <View style={styles.calloutContainer}>
                {restaurant.photos && restaurant.photos.length > 0 && (
                    <Image
                        source={{ uri: restaurant.photos[0] }}
                        style={styles.calloutImage}
                    />
                )}
                <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                <Text style={styles.calloutAddress}>{restaurant.address}</Text>
                <View style={styles.calloutInfo}>
                    <Text style={styles.calloutRating}>⭐ {restaurant.rating}</Text>
                    <Text style={styles.calloutStatus}>
                        {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </Text>
                </View>
            </View>
        </Callout>
    </Marker>
);

const NativeMapView = ({
    region,
    setRegion,
    restaurants,
    searchRadius,
    setSearchRadius,
    refreshRestaurants,
    styles
}: any) => (
    <View style={styles.container}>
        <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
        >
            {restaurants.map((restaurant: any) => renderRestaurantMarker(restaurant, styles))}
        </MapView>
        <View style={styles.controlsContainer}>
            <Text style={styles.radiusText}>Search radius : {searchRadius/1000}km</Text>
            <Slider
  style={styles.slider}
    minimumValue={500}
    maximumValue={5000}
    step={500}
    value={searchRadius}
    onValueChange={setSearchRadius}
    onSlidingComplete={() => refreshRestaurants()}
            />
        </View>
    </View>
);

export default NativeMapView; 