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
import { useRouter } from "expo-router";
import { Mail, ArrowRight, Sparkles, Star } from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { Colors } from "../../src/constants/Theme";
import { PremiumButton } from "../../src/components/ui/PremiumButton";
import { PremiumCard } from "../../src/components/ui/PremiumCard";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("L'email est requis");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.message);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            Mot de passe <Text style={styles.titleAccent}>perdu ?</Text>
          </Text>
          <Text style={styles.subtitle}>Pas de panique, on s'en occupe !</Text>
        </View>

        <PremiumCard style={styles.card}>
          {success ? (
            <View style={styles.successWrapper}>
              <View style={styles.successIcon}>
                <Mail size={32} color={Colors.blue} />
              </View>
              <Text style={styles.successTitle}>Email envoyé !</Text>
              <Text style={styles.successDesc}>{success}</Text>
              <PremiumButton
                variant="outline"
                fullWidth
                onPress={() => router.push("/(auth)/login")}
                style={styles.backBtn}
              >
                Retour à la connexion
              </PremiumButton>
            </View>
          ) : (
            <View style={styles.form}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail
                    size={18}
                    color={Colors.navy}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="votre@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
                <Text style={styles.btnText}>Envoyer le lien</Text>
                <ArrowRight size={20} color={Colors.white} />
              </PremiumButton>
            </View>
          )}
        </PremiumCard>

        <TouchableOpacity
          style={styles.footer}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.footerText}>Vous vous en souvenez ? </Text>
          <Text style={styles.loginLink}>Se connecter</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Star size={14} color={Colors.navy} fill={Colors.navy} />
            <Text style={styles.statText}>10k+ Élèves</Text>
          </View>
          <View style={styles.statItem}>
            <Sparkles size={14} color={Colors.navy} />
            <Text style={styles.statText}>Leçons de 25 min</Text>
          </View>
        </View>
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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.navy,
    textAlign: "center",
    letterSpacing: -1,
  },
  titleAccent: {
    color: Colors.blue,
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.slate[400],
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    padding: 32,
  },
  successWrapper: {
    alignItems: "center",
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: Colors.blue + "15",
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
    lineHeight: 20,
  },
  backBtn: {
    marginTop: 32,
  },
  form: {
    gap: 24,
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
  errorContainer: {
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: Colors.slate[400],
    fontSize: 14,
    fontWeight: "700",
  },
  loginLink: {
    color: Colors.blue,
    fontSize: 14,
    fontWeight: "900",
    textDecorationLine: "underline",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 48,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.navy,
    opacity: 0.4,
  },
});
