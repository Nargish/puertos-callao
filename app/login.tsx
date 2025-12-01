import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { supabase } from "@/api/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSignIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    // no hacemos router.replace("/") porque _layout.tsx ya redirige al detectar sesión
  }

  async function onSignUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    Alert.alert("Cuenta creada", "Revisa tu correo o vuelve a iniciar sesión.");
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
        Ingresar
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <Button title="Ingresar" onPress={onSignIn} />
      <Button title="Crear cuenta" onPress={onSignUp} />
    </View>
  );
}
