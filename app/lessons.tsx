import { useKidMode } from "@/src/context/KidModeContext";
import {
  lessonService,
  type Lesson,
  type Unit,
} from "@/src/services/lesson.service";
import { useRouter } from "expo-router";
import { BookOpen, ChevronRight, Lock, Play, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Palette (matching kid dashboard) ──────────────────────────────────────
const K = {
  blue: "#3b82f6",
  navy: "#1a2b4b",
  teal: "#2dd4bf",
  gold: "#fbbf24",
  orange: "#f97316",
  purple: "#a855f7",
  green: "#22c55e",
  bg: "#F0F4FF",
  white: "#ffffff",
  slate400: "#94a3b8",
  slate100: "#f1f5f9",
};

// ── Unit accent colors cycling ─────────────────────────────────────────────
const UNIT_COLORS = [K.blue, K.teal, K.orange, K.purple, K.green, K.gold];
const UNIT_EMOJIS = ["🌍", "🎵", "🐾", "🚀", "🎨", "⚡"];

// ── Decorative helpers ─────────────────────────────────────────────────────
function DecoStar({ size = 12, color = K.gold, style }: any) {
  return (
    <View style={[{ position: "absolute" }, style]} pointerEvents="none">
      <Text style={{ fontSize: size, color }}>✦</Text>
    </View>
  );
}
function Dot({ size = 10, color = K.gold, style }: any) {
  return (
    <View
      style={[
        {
          position: "absolute",
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: color, opacity: 0.45,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
}

export default function LessonsScreen() {
  const router = useRouter();
  const { selectedKid } = useKidMode();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedKid?.id || !selectedKid?.level) return;
      try {
        const data = await lessonService.getLessonsByKidAndLevel(
          selectedKid.id,
          selectedKid.level,
        );
        setUnits(data);
      } catch (error) {
        console.error("Failed to fetch units:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, [selectedKid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBlob1} />
        <View style={styles.loadingBlob2} />
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📚</Text>
        <ActivityIndicator size="large" color={K.blue} />
        <Text style={styles.loadingText}>Chargement de tes leçons...</Text>
        <DecoStar size={18} color={K.gold} style={{ top: 100, right: 50 }} />
        <DecoStar size={12} color={K.teal} style={{ bottom: 150, left: 40 }} />
        <Dot size={14} color={K.orange} style={{ top: 180, left: 30 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Inner decoration */}
        <View style={styles.headerBlob1} />
        <View style={styles.headerBlob2} />
        <DecoStar size={16} color="rgba(255,255,255,0.35)" style={{ top: 50, right: 80 }} />
        <DecoStar size={10} color={K.gold} style={{ bottom: 20, left: 60 }} />
        <Dot size={20} color="rgba(255,255,255,0.12)" style={{ bottom: 10, right: 50 }} />

        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color={K.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIconWrap}>
            <Text style={{ fontSize: 30 }}>📖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>MES LEÇONS</Text>
            <Text style={styles.headerSubtitle}>Choisis ton aventure du jour !</Text>
          </View>
        </View>

        {/* XP strip */}
        <View style={styles.xpStrip}>
          <View style={styles.xpItem}>
            <Text style={styles.xpEmoji}>🔥</Text>
            <Text style={styles.xpVal}>3 jours</Text>
          </View>
          <View style={styles.xpDivider} />
          <View style={styles.xpItem}>
            <Text style={styles.xpEmoji}>⭐</Text>
            <Text style={styles.xpVal}>12 étoiles</Text>
          </View>
          <View style={styles.xpDivider} />
          <View style={styles.xpItem}>
            <Text style={styles.xpEmoji}>🏆</Text>
            <Text style={styles.xpVal}>2 badges</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable content ───────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Background blobs */}
        <View style={styles.bgBlob1} />
        <View style={styles.bgBlob2} />

        {units.map((unit, unitIdx) => {
          const accentColor = UNIT_COLORS[unitIdx % UNIT_COLORS.length];
          const unitEmoji = UNIT_EMOJIS[unitIdx % UNIT_EMOJIS.length];
          return (
            <View key={unit.id} style={styles.unitSection}>
              {/* Unit header */}
              <View style={styles.unitHeader}>
                <View style={[styles.unitEmojiWrap, { backgroundColor: accentColor + "18", borderColor: accentColor + "30" }]}>
                  <Text style={{ fontSize: 22 }}>{unitEmoji}</Text>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.unitLabel}>UNITÉ {unitIdx + 1}</Text>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                </View>
                <View style={[styles.unitProgressPill, { backgroundColor: accentColor + "15", borderColor: accentColor + "30" }]}>
                  <Text style={[styles.unitProgressText, { color: accentColor }]}>
                    {unit.lessons.filter((l: Lesson) => !l.isLocked).length}/{unit.lessons.length}
                  </Text>
                </View>
              </View>

              {/* Lesson cards */}
              <View style={styles.grid}>
                {unit.lessons.map((lesson: Lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    accentColor={accentColor}
                    onPress={() => {
                      if (!lesson.isLocked) {
                        // router.push(`/lesson/${lesson.id}`);
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── LessonCard ────────────────────────────────────────────────────────────
function LessonCard({
  lesson,
  accentColor,
  onPress,
}: {
  lesson: Lesson;
  accentColor: string;
  onPress: () => void;
}) {
  const isLocked = lesson.isLocked;
  const isNew = lesson.order === 1;

  return (
    <TouchableOpacity
      style={[styles.lessonCard, isLocked && styles.lockedCard]}
      onPress={onPress}
      activeOpacity={isLocked ? 1 : 0.85}
    >
      {/* Thumbnail zone */}
      <View style={[styles.thumbWrap, { backgroundColor: isLocked ? "#e2e8f0" : accentColor + "15" }]}>
        {/* Shine */}
        <View style={[styles.thumbShine, { opacity: isLocked ? 0 : 1 }]} />

        {/* Center emoji / icon */}
        <View style={styles.thumbCenter}>
          {isLocked ? (
            <Text style={{ fontSize: 36, opacity: 0.4 }}>🔒</Text>
          ) : (
            <Text style={{ fontSize: 36 }}>
              {["🎯", "🌈", "🦁", "🎸", "🌺", "⚡", "🎪", "🦋"][lesson.order % 8]}
            </Text>
          )}
        </View>

        {/* Play / lock overlay */}
        <View style={[
          styles.playOverlay,
          { backgroundColor: isLocked ? "rgba(100,116,139,0.9)" : K.white },
        ]}>
          {isLocked
            ? <Lock size={16} color={K.white} />
            : <Play size={16} color={accentColor} fill={accentColor} />
          }
        </View>

        {/* NEW ribbon */}
        {isNew && !isLocked && (
          <View style={[styles.newRibbon, { backgroundColor: K.gold }]}>
            <Text style={styles.newText}>✨ NEW</Text>
          </View>
        )}
      </View>

      {/* Card info */}
      <View style={styles.cardInfo}>
        <View style={[styles.orderPill, { backgroundColor: isLocked ? "#f1f5f9" : accentColor + "12" }]}>
          <Text style={[styles.orderText, { color: isLocked ? K.slate400 : accentColor }]}>
            LEÇON {lesson.order}
          </Text>
        </View>

        <Text style={[styles.lessonTitle, isLocked && { color: K.slate400 }]} numberOfLines={2}>
          {lesson.title}
        </Text>

        {/* Stars row */}
        {!isLocked && (
          <View style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <Text key={s} style={{ fontSize: 11 }}>
                {s === 1 ? "⭐" : "☆"}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={[styles.playLabel, { color: isLocked ? K.slate400 : accentColor }]}>
            {isLocked ? "🔒 VERROUILLÉ" : "▶ JOUER"}
          </Text>
          {!isLocked && <ChevronRight size={14} color={accentColor} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: K.bg,
  },

  // ── Loading ──────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: K.bg, gap: 12, overflow: "hidden",
  },
  loadingBlob1: {
    position: "absolute", top: -60, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: K.blue + "12",
  },
  loadingBlob2: {
    position: "absolute", bottom: 80, left: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: K.orange + "12",
  },
  loadingText: {
    fontSize: 14, fontWeight: "800", color: K.navy, letterSpacing: 0.5,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    backgroundColor: K.blue,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    shadowColor: K.blue,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerBlob1: {
    position: "absolute", top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerBlob2: {
    position: "absolute", bottom: -30, left: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: K.teal + "35",
  },
  closeButton: {
    position: "absolute", top: 56, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  headerContent: {
    flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20,
  },
  headerIconWrap: {
    width: 62, height: 62, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: 30, fontWeight: "900", color: K.white,
    fontStyle: "italic", letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12, fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.3, marginTop: 2,
  },

  // XP strip inside header
  xpStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18, paddingVertical: 10, paddingHorizontal: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  xpItem: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
  },
  xpEmoji: { fontSize: 18 },
  xpVal: {
    fontSize: 11, fontWeight: "900", color: K.white,
  },
  xpDivider: {
    width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.25)",
  },

  // ── Scroll content ────────────────────────────────────────────────────────
  scroll: {
    padding: 20, paddingTop: 28,
  },
  bgBlob1: {
    position: "absolute", top: 20, right: -50,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: K.teal + "10",
  },
  bgBlob2: {
    position: "absolute", top: 400, left: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: K.orange + "10",
  },

  // ── Unit section ──────────────────────────────────────────────────────────
  unitSection: { marginBottom: 36 },
  unitHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 18,
  },
  unitEmojiWrap: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  flex1: { flex: 1 },
  unitLabel: {
    fontSize: 9, fontWeight: "900", color: K.slate400, letterSpacing: 1.5,
  },
  unitTitle: {
    fontSize: 17, fontWeight: "900", color: K.navy,
    textTransform: "uppercase", letterSpacing: -0.3,
  },
  unitProgressPill: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
  },
  unitProgressText: {
    fontSize: 11, fontWeight: "900",
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: 14,
  },

  // ── Lesson card ───────────────────────────────────────────────────────────
  lessonCard: {
    width: (width - 54) / 2,
    backgroundColor: K.white,
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: K.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },
  lockedCard: {
    opacity: 0.65,
  },

  // Thumbnail
  thumbWrap: {
    aspectRatio: 1.4,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbShine: {
    position: "absolute", top: -20, right: -20,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  thumbCenter: {
    alignItems: "center", justifyContent: "center",
  },
  playOverlay: {
    position: "absolute", top: 8, right: 8,
    width: 34, height: 34, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  newRibbon: {
    position: "absolute", top: 8, left: -2,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
    transform: [{ rotate: "-4deg" }],
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)",
  },
  newText: {
    fontSize: 9, fontWeight: "900", color: K.navy,
  },

  // Card info
  cardInfo: {
    padding: 14,
  },
  orderPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, marginBottom: 8,
  },
  orderText: {
    fontSize: 9, fontWeight: "900", letterSpacing: 0.5,
  },
  lessonTitle: {
    fontSize: 14, fontWeight: "900", color: K.navy,
    lineHeight: 19, minHeight: 38,
  },
  starsRow: {
    flexDirection: "row", gap: 2, marginTop: 6, marginBottom: 4,
  },
  cardFooter: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 8,
  },
  playLabel: {
    fontSize: 11, fontWeight: "900", letterSpacing: 0.3,
  },
});