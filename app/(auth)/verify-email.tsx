import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Star,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import { authService } from "../../src/services/auth.service";
import { Colors } from "../../src/constants/Theme";
import { PremiumButton } from "../../src/components/ui/PremiumButton";
import { PremiumCard } from "../../src/components/ui/PremiumCard";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Vérification de votre compte en cours...",
  );
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Jeton de vérification manquant.");
      return;
    }

    const verify = async () => {
      try {
        const response = await authService.verifyEmail(token as string);
        setStatus("success");
        setMessage(response.message);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Échec de la vérification.");
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;

    setResending(true);
    setResendError("");
    setResendSuccess("");

    try {
      await authService.resendVerification(resendEmail);
      setResendSuccess("L'email de vérification a été renvoyé !");
    } catch (err: any) {
      setResendError(err.message || "Une erreur est survenue.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <PremiumCard style={styles.card}>
          {status === "loading" && (
            <View style={styles.centerContent}>
              <ActivityIndicator
                size="large"
                color={Colors.blue}
                style={styles.loader}
              />
              <Text style={styles.title}>Un instant...</Text>
              <Text style={styles.subtitle}>{message}</Text>
            </View>
          )}

          {status === "success" && (
            <View style={styles.centerContent}>
              <View style={styles.successIcon}>
                <CheckCircle2 size={48} color={Colors.teal} />
              </View>
              <Text style={styles.title}>Génial !</Text>
              <Text style={styles.subtitle}>{message}</Text>
              <PremiumButton
                fullWidth
                onPress={() => router.replace("/(auth)/login")}
                style={styles.actionBtn}
              >
                Se connecter
              </PremiumButton>
            </View>
          )}

          {status === "error" && (
            <View style={styles.centerContent}>
              <View style={styles.errorIcon}>
                <XCircle size={48} color="#ef4444" />
              </View>
              <Text style={styles.title}>Mince !</Text>
              <Text style={styles.subtitle}>{message}</Text>

              <View style={styles.resendSection}>
                <Text style={styles.resendTitle}>
                  Vous n'avez pas reçu l'email ?
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre adresse email"
                  value={resendEmail}
                  onChangeText={setResendEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.slate[300]}
                />
                <PremiumButton
                  variant="outline"
                  fullWidth
                  onPress={handleResend}
                  loading={resending}
                  disabled={!resendEmail}
                  style={styles.resendBtn}
                >
                  Renvoyer l'email
                </PremiumButton>

                {resendSuccess ? (
                  <Text style={styles.successMsg}>{resendSuccess}</Text>
                ) : null}
                {resendError ? (
                  <Text style={styles.errorMsg}>{resendError}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          )}
        </PremiumCard>

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
    </View>
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
  centerContent: {
    alignItems: "center",
    width: "100%",
  },
  loader: {
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#f0fdf4",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  errorIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#fef2f2",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.navy,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.slate[500],
    textAlign: "center",
    lineHeight: 24,
  },
  actionBtn: {
    marginTop: 32,
  },
  resendSection: {
    width: "100%",
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 2,
    borderTopColor: Colors.beige,
    alignItems: "center",
  },
  resendTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.slate[400],
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 54,
    borderWidth: 2,
    borderColor: Colors.beige,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.navy,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  resendBtn: {
    marginBottom: 12,
  },
  successMsg: {
    fontSize: 12,
    fontWeight: "800",
    color: "#22c55e",
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 12,
    width: "100%",
    textAlign: "center",
  },
  errorMsg: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 12,
    width: "100%",
    textAlign: "center",
  },
  backBtn: {
    marginTop: 24,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.blue,
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
