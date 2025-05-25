import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  BackHandler,
  GestureResponderEvent,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  function confirmExit(event: GestureResponderEvent): void {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        { 
          text: 'Sair', 
          onPress: () => BackHandler.exitApp() 
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.headerImage}
        />
        <Text style={styles.headerTitle}>C. E. Novo Horizonte</Text>
      </View>

      {/* Conteúdo Principal */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Seção Matrícula */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/forms-aluno')}
        >
          <Text style={styles.cardTitle}>Pré Matrícula</Text>
          <Text style={styles.cardSubtitle}>Cadastre os dados do aluno</Text>
        </TouchableOpacity>

        {/* Seção Gerenciamento de Matrículas */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/solicitacoes')}
        >
          <Text style={styles.cardTitle}>Solicitações</Text>
          <Text style={styles.cardSubtitle}>Solicite alterações de dados cadastrados</Text>
        </TouchableOpacity>

        {/* Seção Contatos */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/aboutUs')}
        >
          <Text style={styles.cardTitle}>Sobre Nós</Text>
          <Text style={styles.cardSubtitle}>Informações sobre a Instituição e contatos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/aboutDevs')}
        >
          <Text style={styles.cardTitle}>Desenvolvedores</Text>
          <Text style={styles.cardSubtitle}>Informações sobre os desenvolvedores do projeto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmExit}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#902121',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 40,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerImage: {
    width: 40,
    height: 40,
    marginRight: 15
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    marginTop: 30,
    alignSelf: 'center',
    padding: 10,
  },
  logoutText: {
    color: '#902121',
    fontSize: 20,
    fontWeight: 'bold',
  }
});