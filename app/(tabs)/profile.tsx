import {
  Baby,
  CheckCircle,
  MapPin,
  Phone,
  Save,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../../src/api/client";
import { PremiumButton } from "../../src/components/ui/PremiumButton";
import { PremiumCard } from "../../src/components/ui/PremiumCard";
import { Colors } from "../../src/constants/Theme";
import { useAuth } from "../../src/context/AuthContext";
import { useKidMode } from "../../src/context/KidModeContext";

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { selectedKid, updateSelectedKid } = useKidMode();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [parentInfo, setParentInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
  });

  const [kidInfo, setKidInfo] = useState({
    name: selectedKid?.name || "",
    age: selectedKid?.age || 0,
  });

  useEffect(() => {
    if (user) {
      setParentInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (selectedKid) {
      setKidInfo({
        name: selectedKid.name || "",
        age: selectedKid.age || 0,
      });
    }
  }, [selectedKid]);

  const handleParentSubmit = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await api.patch("/users/profile", parentInfo);
      if (updateUser) updateUser(response.data);
      setSuccessMsg("Informations parent enregistrées !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKidSubmit = async () => {
    if (!selectedKid) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await api.patch(`/kids/${selectedKid.id}`, kidInfo);
      if (updateSelectedKid) updateSelectedKid(response.data);
      setSuccessMsg("Informations enfant enregistrées !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero header with gradient bg */}
        <View
          style={[
            styles.heroHeader,
            { paddingTop: Math.max(insets.top, 20) + 20 },
          ]}
        >
          <View style={styles.heroGradientOverlay} />
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={styles.headerRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.greeting}>
                Mon <Text style={styles.greetingAccent}>Profil</Text>
              </Text>
              <Text style={styles.subtitle}>Gérez vos informations </Text>
            </View>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {successMsg ? (
          <View style={styles.successBox}>
            <CheckCircle size={20} color="#059669" />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.sectionsGrid}>
          {/* Parent Profile */}
          <PremiumCard accent="blue" style={styles.card}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.blue + "10" },
                ]}
              >
                <UserIcon size={24} color={Colors.blue} />
              </View>
              <Text style={styles.sectionTitle}>Profil Parent</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    value={parentInfo.firstName}
                    onChangeText={(text) =>
                      setParentInfo({ ...parentInfo, firstName: text })
                    }
                    placeholder="Prénom"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    value={parentInfo.lastName}
                    onChangeText={(text) =>
                      setParentInfo({ ...parentInfo, lastName: text })
                    }
                    placeholder="Nom"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Numéro de téléphone</Text>
                <View style={styles.inputWithIcon}>
                  <Phone
                    size={20}
                    color={Colors.navy + "60"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { paddingLeft: 44 }]}
                    value={parentInfo.phoneNumber}
                    onChangeText={(text) =>
                      setParentInfo({ ...parentInfo, phoneNumber: text })
                    }
                    placeholder="06 00 00 00 00"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adresse</Text>
                <View style={styles.inputWithIcon}>
                  <MapPin
                    size={20}
                    color={Colors.navy + "60"}
                    style={[styles.inputIcon, { top: 14 }]}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea, { paddingLeft: 44 }]}
                    value={parentInfo.address}
                    onChangeText={(text) =>
                      setParentInfo({ ...parentInfo, address: text })
                    }
                    placeholder="Votre adresse complète"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <PremiumButton
                onPress={handleParentSubmit}
                loading={isLoading}
                icon={<Save size={20} color={Colors.white} />}
                style={styles.submitBtn}
              >
                Enregistrer
              </PremiumButton>
            </View>
          </PremiumCard>

          {/* Kid Profile */}
          <PremiumCard accent="gold" style={styles.card}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: Colors.gold + "10" },
                ]}
              >
                <Baby size={24} color={Colors.gold} />
              </View>
              <Text style={styles.sectionTitle}>Profil Enfant</Text>
            </View>

            {!selectedKid ? (
              <View style={styles.emptyKidState}>
                <Text style={styles.emptyKidText}>
                  Veuillez sélectionner un enfant pour modifier ses paramètres.
                </Text>
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    value={kidInfo.name}
                    onChangeText={(text) =>
                      setKidInfo({ ...kidInfo, name: text })
                    }
                    placeholder="Prénom de l'enfant"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Âge</Text>
                  <TextInput
                    style={styles.input}
                    value={kidInfo.age.toString()}
                    onChangeText={(text) =>
                      setKidInfo({ ...kidInfo, age: parseInt(text) || 0 })
                    }
                    placeholder="Âge"
                    keyboardType="numeric"
                  />
                </View>

                <PremiumButton
                  onPress={handleKidSubmit}
                  loading={isLoading}
                  variant="secondary"
                  icon={<Save size={20} color={Colors.navy} />}
                  style={styles.submitBtn}
                >
                  Enregistrer l'enfant
                </PremiumButton>
              </View>
            )}
          </PremiumCard>
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
  scrollContent: {
    paddingBottom: 40,
  },
  // ─── Hero Header ───────────────────────────────────────────────────────────
  heroHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.navy,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.09,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  heroGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.blue,
    opacity: 0.02,
  },
  heroCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.blue,
    opacity: 0.04,
  },
  heroCircle2: {
    position: "absolute",
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.orange,
    opacity: 0.05,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: 30,
    fontWeight: "900",
    color: Colors.navy,
    letterSpacing: -0.8,
  },
  greetingAccent: {
    color: Colors.blue,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.slate[400],
    marginTop: 4,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.blue + "08",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 44,
    height: 36,
    opacity: 0.18,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.navy,
  },
  successBox: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  successText: {
    color: "#065f46",
    fontWeight: "700",
    marginLeft: 12,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorText: {
    color: "#991b1b",
    fontWeight: "700",
  },
  sectionsGrid: {
    gap: 20,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.navy,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.navy + "90",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.slate[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.navy,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputWithIcon: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: 12,
    zIndex: 1,
  },
  textArea: {
    paddingTop: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    marginTop: 8,
  },
  emptyKidState: {
    padding: 24,
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.slate[200],
    alignItems: "center",
  },
  emptyKidText: {
    color: Colors.navy + "60",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
});
