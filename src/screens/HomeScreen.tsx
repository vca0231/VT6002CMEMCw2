import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.header}>Healthy Eating Guide</Text>

        <View style={styles.infoCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>Daily Diet Recommendations</Text>
          <Text style={styles.infoText}>
            • Drink enough water every day (at least 8 glasses of water){'\n'}
            • Eat more fresh vegetables and fruits{'\n'}
            • Eat a moderate amount of high-quality protein{'\n'}
            • Control the intake of refined sugar and salt{'\n'}
            • Maintain regular meal times
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>Balanced nutrition principles</Text>
          <Text style={styles.infoText}>
            • Carbohydrates: Provide energy{'\n'}
            • Protein: Repair and build muscle{'\n'}
            • Healthy fats: Maintain body functions{'\n'}
            • Vitamins and minerals: Support the immune system{'\n'}
            • Dietary fiber: Promote digestive health
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>Health Tips</Text>
          <Text style={styles.infoText}>
            • Eat slowly and enjoy your food{'\n'}
            • Avoid excessive dieting{'\n'}
            • Maintain moderate exercise{'\n'}
            • Pay attention to food diversity{'\n'}
            • Get enough sleep
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>Dietary taboos</Text>
          <Text style={styles.infoText}>
            • Avoid over-processed foods{'\n'}
            • Limit sugary drinks{'\n'}
            • Reduce fried foods{'\n'}
            • Control alcohol intake{'\n'}
            • Avoid overeating
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#219ebc',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: width - 80,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#219ebc',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default HomeScreen;
