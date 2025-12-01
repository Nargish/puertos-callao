import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function AtalayaGate() {
  const [sec, setSec] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  // redirige al terminal real "Atalaya"
  useEffect(() => {
    if (sec <= 0) router.replace("/atalaya/Atalaya");
  }, [sec]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <Text style={{ fontSize: 18 }}>
        Publicidad… espera {Math.max(sec, 0)}s
      </Text>

      <Button
        title="Continuar"
        disabled={sec > 0}
        onPress={() => router.replace("/atalaya/Atalaya")}
      />
    </View>
  );
}
