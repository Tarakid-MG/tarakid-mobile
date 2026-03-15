import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { Colors } from "../../src/constants/Theme";
import { PremiumButton } from "../../src/components/ui/PremiumButton";
import { PremiumCard } from "../../src/components/ui/PremiumCard";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      setError("Jeton de réinitialisation manquant");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.resetPassword({ token, password });
      setSuccess(response.message);
      setTimeout(() => router.replace("/(auth)/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <View style={styles.errorContainerFull}>
        <PremiumCard style={styles.errorCard}>
          <Text style={styles.errorTitle}>Lien invalide</Text>
          <Text style={styles.errorDesc}>
            Ce lien de réinitialisation est manquant ou incorrect.
          </Text>
          <PremiumButton
            fullWidth
            onPress={() => router.replace("/(auth)/forgot-password")}
          >
            Demander un nouveau lien
          </PremiumButton>
        </PremiumCard>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <PremiumCard style={styles.card}>
          {success ? (
            <View style={styles.successWrapper}>
              <View style={styles.successIcon}>
                <CheckCircle2 size={32} color={Colors.teal} />
              </View>
              <Text style={styles.successTitle}>Réussi !</Text>
              <Text style={styles.successDesc}>{success}</Text>
              <Text style={styles.redirectText}>
                Redirection vers la connexion...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Nouveau mot de passe</Text>
                <Text style={styles.subtitle}>
                  Choisissez un mot de passe fort et mémorable.
                </Text>
              </View>

              <View style={styles.form}>
                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                  <View style={styles.inputWrapper}>
                    <Lock
                      size={18}
                      color={Colors.navy}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholderTextColor={Colors.slate[300]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Confirmer le mot de passe
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Lock
                      size={18}
                      color={Colors.navy}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholderTextColor={Colors.slate[300]}
                    />
                  </View>
                </View>

                <PremiumButton
                  onPress={handleSubmit}
                  loading={loading}
                  fullWidth
                  style={styles.submitBtn}
                >
                  <Text style={styles.btnText}>Réinitialiser</Text>
                  <ArrowRight size={20} color={Colors.white} />
                </PremiumButton>
              </View>
            </>
          )}
        </PremiumCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  circle1: {
    position: "absolute",
    top: 60,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.yellow,
    opacity: 0.15,
  },
  circle2: {
    position: "absolute",
    bottom: 100,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.blue,
    opacity: 0.1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 40,
  },
  card: {
    width: "100%",
    padding: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.navy,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.slate[400],
    marginTop: 8,
    textAlign: "center",
  },
  successWrapper: {
    alignItems: "center",
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#f0fdf4",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.navy,
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.slate[500],
    textAlign: "center",
  },
  redirectText: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: "800",
    color: Colors.blue,
    fontStyle: "italic",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.navy,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.beige,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 58,
    backgroundColor: Colors.white,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.navy,
  },
  submitBtn: {
    marginTop: 8,
  },
  btnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "900",
    marginRight: 10,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fee2e2",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  errorContainerFull: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorCard: {
    width: "100%",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.navy,
    marginBottom: 12,
  },
  errorDesc: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.slate[500],
    textAlign: "center",
    marginBottom: 24,
  },
});
