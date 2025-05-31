import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
// eslint-disable-next-line import/no-duplicates
import { Dimensions, FlatList, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Componente Reutilizável para Segmentos
// eslint-disable-next-line import/no-duplicates
import { ImageSourcePropType } from 'react-native';

// Componente Reutilizável para Atividades
type ActivityCardProps = {
  image: any; // You can replace 'any' with ImageSourcePropType from 'react-native' for stricter typing
  title: string;
  text: string;
};

const ActivityCard: React.FC<ActivityCardProps> = ({ image, title, text }) => (
  <View style={styles.activityCard}>
    <Image 
      source={image} 
      style={styles.activityImage}
      accessibilityLabel={title}
    />
    <View style={styles.activityTextContainer}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityText}>{text}</Text>
    </View>
  </View>
);

type SegmentCardProps = {
  image: ImageSourcePropType;
  title: string;
  text: string;
};

const SegmentCard: React.FC<SegmentCardProps> = ({ image, title, text }) => (
  <View style={styles.segmentCard}>
    <Image
      source={image}
      style={styles.segmentImage}
      accessibilityLabel={title}
    />
    <Text style={styles.segmentTitle}>{title}</Text>
    <Text style={styles.segmentText}>{text}</Text>
  </View>
);

export default function AboutUsScreen() {
  const activities = [
    {
      id: 1,
      image: require('../assets/images/ballet.png'),
      title: 'Ballet',
      text: 'Trabalho de postura, equilíbrio e coordenação em um ambiente acolhedor e divertido.'
    },
    {
      id: 2,
      image: require('../assets/images/computadores.png'),
      title: 'Informática',
      text: 'Desenvolvimento do pensamento lógico e uso responsável da tecnologia.'
    },
    {
      id: 3,
      image: require('../assets/images/capoeira.png'),
      title: 'Capoeira',
      text: 'Aula dinâmica que une arte marcial, música e cultura brasileira, promovendo disciplina e coordenação motora.'
    },
    {
      id: 4,
      image: require('../assets/images/jiujitsu.png'),
      title: 'Jiu-Jítsu',
      text: 'Desenvolve autoconfiança, respeito e técnicas de defesa pessoal em ambiente seguro e supervisionado.'
    },
    {
      id: 5,
      image: require('../assets/images/EF.png'),
      title: 'Educação Física',
      text: 'Promoção de hábitos saudáveis através de esportes e atividades físicas diversificadas.'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          accessibilityLabel="Logo da instituição"
        />
        <Text style={styles.title}>Centro Educacional Novo Horizonte</Text>
      </View>

      {/* Missão */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nossa Missão</Text>
        <View style={styles.missionContainer}>
          <Text style={styles.text}>
            Proporcionar um ambiente motivador para que as potencialidades de cada indivíduo sejam expressadas,
            adquirindo conhecimentos únicos e novas vivências de acordo com o dia a dia nas salas de aula.
          </Text>
          <Image
            source={require('../assets/images/profGenerica.jpg')}
            style={styles.missionImage}
            accessibilityLabel="Professora em sala de aula"
          />
        </View>
      </View>

      {/* Citação da Diretora */}
      <View style={[styles.section, styles.directorSection]}>
        <Text style={styles.quote}>
          &quot;A instituição planeja estrategicamente para o ano letivo projetos inovadores e multidisciplinares
          para estimular o ensino-aprendizado e promover relações interpessoais.&quot;
        </Text>
        <Image
          source={require('../assets/images/diretora.png')}
          style={styles.directorImage}
          accessibilityLabel="Diretora Vanessa Lima"
        />
        <Text style={styles.directorName}>Vanessa Lima</Text>
        <Text style={styles.directorTitle}>Diretora</Text>
      </View>

      {/* Segmentos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nossos Segmentos</Text>
        
        <SegmentCard
          image={require('../assets/images/ensinoInfantil.jpg')}
          title="Educação Infantil"
          text="Desenvolvimento inicial com foco em brincadeiras e aprendizado, estimulando criatividade e socialização."
        />

        <SegmentCard
          image={require('../assets/images/fundamental.jpg')}
          title="Ensino Fundamental I"
          text="Exploração do universo das letras e números, com aventuras nas operações matemáticas básicas."
        />

        <SegmentCard
          image={require('../assets/images/fundamental2.jpg')}
          title="Ensino Fundamental II"
          text="Estímulo ao crescimento intelectual com abordagem interdisciplinar e multidisciplinar."
        />
      </View>

      {/* Atividades com FlatList */}
      <View style={styles.activitiesSection}>
        <Text style={[styles.sectionTitle,{color:"black"}]}>Atividades Extras</Text>
        <FlatList
          data={activities}
          renderItem={({ item }) => (
            <ActivityCard
              image={item.image}
              title={item.title}
              text={item.text}
            />
          )}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Rodapé Atualizado */}
      <View style={styles.footer}>
        <View style={styles.contactContainer}>
          <FontAwesome name="phone" size={20} color="white" />
          <Text style={styles.contactText}>(21) 98506-7184</Text>
        </View>

        <View style={styles.socialIcons}>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/novohorizontetere')}>
            <FontAwesome name="facebook" size={24} color="white" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/centroeducnovohorizonteoficial/')}>
            <FontAwesome name="instagram" size={24} color="white" style={styles.icon} />
          </TouchableOpacity>
        </View>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar para tela inicial</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#902121",
    paddingTop:30,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#f5f5f5',
  },
  activitiesSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderBottomColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgb(212, 212, 212)',
  },
  sectionTitle: {
    color: '#444',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  missionContainer: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: 'center',
    gap: 15,
  },
  missionImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  text: {
    color: '#444',
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
    textAlign: 'justify',
  },
  directorSection: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  quote: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  directorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  directorName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  directorTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  segmentCard: {
    backgroundColor: '#902121',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  segmentImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  segmentTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  segmentText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'justify',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#902121',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    minHeight: 150,
  },
  activityImage: {
    width: 100,
    height: "100%",
    resizeMode: 'cover',
  },
  activityTextContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  activityTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 80,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  icon: {
    marginHorizontal: 15,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
  },
});