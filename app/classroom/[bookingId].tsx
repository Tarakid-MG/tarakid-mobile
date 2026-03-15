import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Mic,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  User,
  MessageSquare,
  Star,
  Clock,
} from "lucide-react-native";
import { agoraService } from "@/src/services/agora.service";
import { useAuth } from "@/src/context/AuthContext";
import { useKidMode } from "@/src/context/KidModeContext";

const { width, height } = Dimensions.get("window");

export default function ClassroomScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const { user } = useAuth();
  const { selectedKid } = useKidMode();

  const [loading, setLoading] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [stars, setStars] = useState(5);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    // Simulate Agora setup for now as native SDK requires specific configuration
    const init = async () => {
      try {
        if (bookingId && user?.id) {
          // const tokenData = await agoraService.getToken(bookingId as string, user.id);
          // Initialize native RTC here
        }
      } catch (err) {
        console.error("Agora init error:", err);
      } finally {
        setTimeout(() => setLoading(false), 2000);
      }
    };
    init();
  }, [bookingId, user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>PRÉPARATION DE LA CLASSE...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Video (Teacher) - Full Screen Placeholder */}
      <View style={styles.remoteVideo}>
        <View style={styles.placeholderContainer}>
          <User size={80} color="#cbd5e1" />
          <Text style={styles.placeholderText}>
            En attente du professeur...
          </Text>
        </View>

        {/* Header Overlay */}
        <View style={styles.header}>
          <View style={styles.timerBadge}>
            <Clock size={16} color="#3b82f6" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <View style={styles.starsRow}>
            {[...Array(stars)].map((_, i) => (
              <Star key={i} size={20} color="#eab308" fill="#eab308" />
            ))}
          </View>
        </View>

        {/* Local Video (Self) Overlay */}
        <View style={styles.localVideo}>
          <View style={styles.localPlaceholder}>
            <User size={30} color="#94a3b8" />
            <Text style={styles.localName}>Moi</Text>
          </View>
          {!videoEnabled && (
            <View style={styles.videoDisabled}>
              <VideoOff size={24} color="#fff" />
            </View>
          )}
        </View>
      </View>

      {/* Controls Bar */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            !videoEnabled && styles.controlButtonDisabled,
          ]}
          onPress={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? (
            <VideoIcon size={24} color="#64748b" />
          ) : (
            <VideoOff size={24} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            !micEnabled && styles.controlButtonDisabled,
          ]}
          onPress={() => setMicEnabled(!micEnabled)}
        >
          <Mic size={24} color={micEnabled ? "#64748b" : "#fff"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowChat(!showChat)}
        >
          <MessageSquare size={24} color={showChat ? "#3b82f6" : "#64748b"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => router.back()}
        >
          <PhoneOff size={24} color="#fff" />
          <Text style={styles.leaveText}>Quitter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "900",
    color: "#1e293b",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3b82f6",
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  localVideo: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 120,
    height: 180,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 8,
    overflow: "hidden",
  },
  localPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  localName: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    marginTop: 4,
  },
  videoDisabled: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    height: 100,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonDisabled: {
    backgroundColor: "#ef4444",
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  leaveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});
