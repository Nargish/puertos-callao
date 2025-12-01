import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/api/supabase";

export default function Home() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "700" }}>Puertos Callao</Text>

      <Button title="APM" onPress={() => router.push("/apm")} />
      <Button title="DPW" onPress={() => router.push("/dpw")} />

      {/* 🔥 Nuevo botón Atalaya */}
      <Button title="Atalaya" onPress={() => router.push("/atalaya")} />

      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}
