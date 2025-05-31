import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}
    initialRouteName="index">
      <Stack.Screen name="index"/>

      <Stack.Screen name="index" />
      <Stack.Screen name="forms-aluno" />
      <Stack.Screen name="solicitacoes" />
      <Stack.Screen name="forms-materno" />
      <Stack.Screen name="forms-paterno" />
      <Stack.Screen name="forms-obs" />
      <Stack.Screen name="aboutUs" />
      <Stack.Screen name="aboutDevs" />
    </Stack>
  );
}

