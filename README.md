# VT6002CEM Mobile App Development

This project is a cw2 for the VT6002CEM.
Please put the firebase.js and serviceAccountKey.json files in the server directory of the project from the source code zip.
Please also put the .env file in the root directory of the project from the source code zip.

## Features 

- User authentication (login/logout)

- Home dashboard with key information

- Diet record and management

- Exercise tracking

- Healthy restaurant recommendations

- Recipe browsing

- Data statistics and visualization

- Notification reminders

- User profile management


## Project Structure

VT6002CEM/
  ├── App.tsx                  # Main application entry point
  ├── app.json                 # Expo configuration
  ├── package.json             # Project dependencies and scripts
  ├── tsconfig.json            # TypeScript configuration
  ├── data.json                # Sample/mock data
  ├── assets/                  # Images and static resources
  ├── src/
  │   ├── context/             # React Context (e.g., AuthContext)
  │   ├── navigation/          # Navigation setup (Stack, Tab)
  │   ├── screens/             # App screens (Home, Login, Diet, etc.)
  │   ├── services/            # API and service logic
  │   └── types/               # TypeScript type definitions
  ├── server/                  # Node.js/Express backend server
  └── web/                     # Web entry (if applicable)

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the frontend (Expo)

```bash
npx expo start
```

### Start the backend server

```bash
cd server
npm install
node server.js
```

## External APIs & Sensors

### External APIs

- Google Maps Geocoding API: Used to convert latitude/longitude to human-readable addresses for displaying the user's current location.

- Google Places API: Used (via backend proxy) to search for nearby healthy restaurants.

- TheMealDB API: Used to search and browse recipes.

### Sensors & Device Features

- Location Sensor (expo-location): Used to obtain the user's current geographic location.

- Camera (expo-image-picker): Used to take photos or select images from the gallery for diet records.

- Notification Sound: Push notifications are configured to play a sound when triggered.

