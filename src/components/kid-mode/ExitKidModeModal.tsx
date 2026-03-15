import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Theme";
import { useAuth } from "../../context/AuthContext";
import { useKidMode } from "../../context/KidModeContext";

export const ExitKidModeModal: React.FC = () => {
  const router = useRouter();
  const { verifyPassword } = useAuth();
  const { exitKidMode, showExitModal, setShowExitModal } = useKidMode();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    if (!password) {
      setError("Veuillez entrer votre mot de passe");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        // console.log("Password verified! Exiting Kid Mode...");
        // This will trigger state changes in context
        await exitKidMode();

        // Force immediate redirection back to main tabs
        // Using a short delay to let context state propagate reliably
        setTimeout(() => {
          // console.log("Redirecting to (tabs)...");
          router.replace("/(tabs)");
        }, 100);
      } else {
        setError("Mot de passe incorrect");
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={showExitModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowExitModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowExitModal(false)}
          >
            <X size={24} color={Colors.navy + "60"} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Lock size={32} color={Colors.orange} />
            </View>
          </View>

          <Text style={styles.modalTitle}>Sortir du Mode Enfant 🔒</Text>
          <Text style={styles.modalSub}>
            Entrez le mot de passe parent pour continuer
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock
                size={20}
                color={Colors.navy + "40"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe parent"
                placeholderTextColor={Colors.navy + "40"}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.navy + "40"} />
                ) : (
                  <Eye size={20} color={Colors.navy + "40"} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowExitModal(false)}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.exitButton]}
              onPress={handleExit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.exitButtonText}>Sortir</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalView: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.orange + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.navy,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 16,
    color: Colors.navy + "99",
    textAlign: "center",
    marginBottom: 24,
  },
  errorContainer: {
    width: "100%",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.slate[200],
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.navy,
    fontWeight: "600",
  },
  eyeButton: {
    padding: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: Colors.slate[200],
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.navy,
  },
  exitButton: {
    backgroundColor: Colors.orange,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});
