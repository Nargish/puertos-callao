import { View, Button, Text } from "react-native";
import { useRouter } from "expo-router";

export default function APMTerminals() {
  const router = useRouter();
  const go = (terminal: string) =>
    router.push({ pathname: "/apm/[terminal]", params: { terminal } });

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center", gap:16 }}>
      <Text style={{ fontSize:24, fontWeight:"700" }}>APM – Selecciona terminal</Text>
      <Button title="MANCO CÁPAC" onPress={() => go("Manco Cápac")} />
      <Button title="GUADALUPE" onPress={() => go("Guadalupe")} />
    </View>
  );
}
