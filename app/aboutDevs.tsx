import { Link } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutDevs() {
  const developers = [
    {
      name: 'Matheus Paim',
      github: 'https://github.com/MatheusPaimX',
      linkedin: 'https://www.linkedin.com/in/matheus-de-oliveira-paim-936561269/'
    },
    {
      name: 'Rebeca Vianna Francklin',
      github: 'https://github.com/becafrancklin',
      linkedin: 'https://www.linkedin.com/in/rebecafrancklin/'
    },
    {
      name: 'Gabriel Nogueira Pereira',
      github: 'https://github.com/Gabrielquirce',
      linkedin: 'https://www.linkedin.com/in/gabrielnogueira20041218/'
    },
    {
      name: 'João Pedro',
      github: 'https://github.com/JPeeeedrs',
      linkedin: 'https://www.linkedin.com/in/jo%C3%A3o-pedro-daumas-correa-b3196b25b/'
    },
    {
      name: 'Vitor Mendes',
      github: 'https://github.com/VitorMendesGallo',
      linkedin: 'https://www.linkedin.com/in/vitor-mendes-gallo/'
    },
    {
      name: 'Hugo Ottati',
      github: 'https://github.com/Hugo-Ottati',
      linkedin: 'https://www.linkedin.com/in/hugo-ottati/'
    },
    {
      name: 'Beatriz Hyath',
      github: 'https://github.com/beatrizhyath',
      linkedin: 'https://www.linkedin.com/in/beatriz-hyath-3205aa295/'
    },
    {
      name: 'Lívia Caldeira',
      github: 'https://github.com/liviacaldeira',
      linkedin: 'https://www.linkedin.com/in/l%C3%ADvia-cardoso-caldeira-ab4154258/'
    },
  ];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Erro ao abrir link:', err));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Sobre os Desenvolvedores</Text>
      </View>

      {/* Mensagem de Agradecimento */}
      <View style={styles.content}>
        <Text style={styles.thankYouText}>
          Com gratidão e entusiasmo, nós, um grupo de jovens programadores, dedicamos este projeto à comunidade educacional.
          Cada linha de código representa nosso compromisso com a excelência técnica e nosso desejo de contribuir para um futuro
          onde a tecnologia e a educação caminham lado a lado.
        </Text>

        <Text style={styles.subText}>
          Unidos pelo propósito de aprender, crescer e inovar, apresentamos com orgulho o fruto de nossa colaboração e
          esforço coletivo.
        </Text>
      </View>

      {/* Lista de Desenvolvedores */}
      <View style={styles.developersSection}>
        <Text style={styles.sectionTitle}>Nossa Equipe</Text>

        {developers.map((dev, index) => (
          <View key={index} style={styles.devContainer}>
            <Text style={styles.devName}>{dev.name}</Text>

            <View style={styles.linksContainer}>
              <Text
                style={styles.devLink}
                onPress={() => handleOpenLink(dev.github)}
              >
                GitHub
              </Text>

              <Text
                style={[styles.devLink, styles.linkedin]}
                onPress={() => handleOpenLink(dev.linkedin)}
              >
                LinkedIn
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Botão de Voltar */}
      <Link href="/home" style={styles.link}>
        Voltar para tela Inicial
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(82,10,10,1)",
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)'
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'georgia-regular',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    marginBottom: 30,
  },
  thankYouText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  subText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  developersSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'georgia-regular',
  },
  devContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
  },
  devName: {
    color: '#902121',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  devLink: {
    color: 'black',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  linkedin: {
    color: '#0A66C2',
  },
  link: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    
  },
});