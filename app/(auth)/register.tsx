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
  User as UserIcon,
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
import { authService } from "../../src/services/auth.service";

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "client",
    accountType: "parent",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.register(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.successIconWrapper}>
          <Star size={40} color={Colors.white} fill={Colors.white} />
        </View>
        <Text style={styles.successTitle}>Inscription réussie !</Text>
        <Text style={styles.successSubtitle}>
          Bienvenue dans la famille Tarakid ! Votre compte parent a été créé
          avec succès.
        </Text>
        <Text style={styles.redirectText}>
          Redirection vers la connexion...
        </Text>

        <PremiumButton
          onPress={() => router.replace("/(auth)/login")}
          style={styles.successBtn}
        >
          <Text style={styles.successBtnText}>Se Connecter Maintenent</Text>
        </PremiumButton>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Decorative Circles */}
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
          <Text style={styles.title}>
            Créer un <Text style={styles.titleAccent}>compte parent</Text>
          </Text>
          <Text style={styles.subtitle}>
            Informations du parent ou tuteur légal
          </Text>
        </View>

        <PremiumCard style={styles.card}>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <UserIcon size={16} color={Colors.blue} />
              <Text style={styles.infoTitle}>
                Vos informations en tant que parent
              </Text>
            </View>
            <Text style={styles.infoDesc}>
              Ces informations seront utilisées pour votre compte parent. Les
              informations de votre enfant ont été collectées à l'étape
              précédente.
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>Votre prénom</Text>
                <View style={[styles.inputWrapper, { paddingHorizontal: 12 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Sophie"
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                    placeholderTextColor={Colors.slate[300]}
                  />
                </View>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>Votre nom</Text>
                <View style={[styles.inputWrapper, { paddingHorizontal: 12 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Dubois"
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                    placeholderTextColor={Colors.slate[300]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Votre adresse email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={Colors.navy} style={styles.inputIcon} />
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
              <Text style={styles.inputLabel}>Votre mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={Colors.navy} style={styles.inputIcon} />
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
                    <EyeOff size={20} color={Colors.slate[400]} />
                  ) : (
                    <Eye size={20} color={Colors.slate[400]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <PremiumButton
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={styles.registerBtn}
            >
              <Text style={styles.btnText}>C'est parti !</Text>
              <ArrowRight size={20} color={Colors.white} />
            </PremiumButton>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou s'inscrire avec</Text>
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
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>Se connecter</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.navy,
    textAlign: "center",
    letterSpacing: -1,
  },
  titleAccent: {
    color: Colors.orange,
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.slate[400],
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    padding: 24,
  },
  infoBox: {
    backgroundColor: Colors.blue + "08",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.blue + "10",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.navy,
  },
  infoDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.slate[500],
    lineHeight: 16,
  },
  form: {
    gap: 20,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  flex1: {
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.beige,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    backgroundColor: Colors.white,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.navy,
  },
  registerBtn: {
    marginTop: 8,
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "900",
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.beige,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.slate[300],
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 22,
    height: 22,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
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
    marginTop: 40,
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
  successContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: Colors.blue,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.navy,
    marginBottom: 16,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.slate[500],
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  redirectText: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.blue,
    fontStyle: "italic",
    marginBottom: 40,
  },
  successBtn: {
    paddingHorizontal: 30,
  },
  successBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
});
