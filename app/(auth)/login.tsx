import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Star,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PremiumButton } from "../../src/components/ui/PremiumButton";
import { PremiumCard } from "../../src/components/ui/PremiumCard";
import { Colors } from "../../src/constants/Theme";
import { useAuth } from "../../src/context/AuthContext";
import { authService } from "../../src/services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const { login: setAuthToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);

  const handleResendVerification = async () => {
    try {
      await authService.resendVerification(formData.email);
      setSuccessMessage("Email de vérification renvoyé !");
      setIsUnverified(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi");
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await authService.login(formData);
      await setAuthToken(response.access_token);
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err.message || "Email ou mot de passe incorrect";
      setError(msg);
      if (
        msg.toLowerCase().includes("vérifier") ||
        msg.toLowerCase().includes("verified")
      ) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Decorative Elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <RNImage
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.welcomeBadge}>
            <Sparkles size={16} color={Colors.orange} />
            <Text style={styles.welcomeBadgeText}>TARAKID WELCOME</Text>
          </View>

          <Text style={styles.title}>
            Bon de <Text style={styles.titleAccent}>retour !</Text>
          </Text>
          <Text style={styles.subtitle}>
            Continuez l'aventure de votre enfant
          </Text>
        </View>

        <PremiumCard style={styles.card}>
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                {isUnverified && (
                  <TouchableOpacity onPress={handleResendVerification}>
                    <Text style={styles.resendLink}>
                      Renvoyer l'email de vérification
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Adresse Email</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.navy} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.slate[300]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text style={styles.forgotText}>Oublié ?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.navy} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry={!showPassword}
                  placeholderTextColor={Colors.slate[300]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={22} color={Colors.slate[400]} />
                  ) : (
                    <Eye size={22} color={Colors.slate[400]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <PremiumButton
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={styles.loginBtn}
            >
              <Text style={styles.btnText}>Se Connecter</Text>
              <ArrowRight size={20} color={Colors.white} />
            </PremiumButton>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou se connecter avec</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialBtn}>
                <Image
                  source={{
                    uri: "https://www.svgrepo.com/show/475656/google-color.svg",
                  }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Image
                  source={{
                    uri: "https://www.svgrepo.com/show/475647/facebook-color.svg",
                  }}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </PremiumCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerLink}>S'inscrire gratuitement</Text>
          </TouchableOpacity>
        </View>

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
    paddingBottom: 40,
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
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.yellow,
    marginBottom: 20,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    // transform: [{ rotate: '-2deg' }],
  },
  welcomeBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.navy,
    marginLeft: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.navy,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 42,
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
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.blue,
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
  loginBtn: {
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
  resendLink: {
    color: Colors.blue,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 8,
  },
  successContainer: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#dcfce7",
  },
  successText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.beige,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.slate[300],
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 24,
    height: 24,
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
  registerLink: {
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
