import { Colors } from "@/src/constants/Theme";
import { useAuth } from "@/src/context/AuthContext";
import { useKidMode } from "@/src/context/KidModeContext";
import { bookingService, freeTrialService } from "@/src/services/data.service";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Gamepad2,
  LogOut,
  PenTool,
  Shapes,
  Sparkles,
  Star,
  Video,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ── Decorative star component ──────────────────────────────────────────────
function DecoStar({ size = 12, color = Colors.gold, style }: any) {
  return (
    <View style={[{ position: "absolute" }, style]}>
      <Text style={{ fontSize: size, color }}>✦</Text>
    </View>
  );
}

// ── Floating dot ──────────────────────────────────────────────────────────
function Dot({ size = 10, color = Colors.gold, style }: any) {
  return (
    <View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.5,
        },
        style,
      ]}
    />
  );
}

export default function KidDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedKid, isKidMode, enterKidMode, setShowExitModal } =
    useKidMode();

  const [nextClass, setNextClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextClass = async () => {
      if (!selectedKid || !user?.id) return;
      try {
        const [freeTrialBookings, regularBookings] = await Promise.all([
          freeTrialService.getUserBookings(user.id),
          bookingService.getKidBookings(selectedKid.id),
        ]);

        const allUpcoming = [
          ...freeTrialBookings
            .filter(
              (b) =>
                String(b.kidId) === String(selectedKid.id) &&
                b.status === "CONFIRMED",
            )
            .map((b) => ({
              ...b,
              date: b.session?.date,
              startTime: b.session?.startTime,
              type: "FREE_TRIAL",
            })),
          ...regularBookings
            .filter((b) => b.status === "SCHEDULED")
            .map((b) => ({
              ...b,
              date: b.sessionDate,
              startTime: b.startTime,
              type: "REGULAR",
            })),
        ]
          .filter((b) => b.date && b.startTime)
          .sort((a: any, b: any) => {
            const A = new Date(`${a.date}T${a.startTime}`).getTime();
            const B = new Date(`${b.date}T${b.startTime}`).getTime();
            return A - B;
          })
          .filter(
            (b: any) => new Date(`${b.date}T${b.startTime}`) > new Date(),
          );

        setNextClass(allUpcoming[0] || null);
      } catch (error) {
        console.error("Kid dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextClass();
  }, [selectedKid, user]);

  // ── Kid selector screen ──────────────────────────────────────────────────
  if (!isKidMode || !selectedKid) {
    return (
      <ImageBackground
        source={require("@/assets/images/kids-bg.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.selectorContainer}>
          {/* Background blobs */}
          <View
            style={[
              styles.blob,
              {
                top: -60,
                right: -40,
                backgroundColor: Colors.blue + "18",
                width: 200,
                height: 200,
              },
            ]}
          />
          <View
            style={[
              styles.blob,
              {
                bottom: 80,
                left: -50,
                backgroundColor: Colors.orange + "18",
                width: 180,
                height: 180,
              },
            ]}
          />
          <DecoStar
            size={20}
            color={Colors.gold}
            style={{ top: 80, right: 50 }}
          />
          <DecoStar
            size={14}
            color={Colors.teal}
            style={{ top: 140, left: 30 }}
          />
          <DecoStar
            size={10}
            color={Colors.orange}
            style={{ bottom: 200, right: 60 }}
          />

          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.selectorEmoji}>🌟</Text>
          <Text style={styles.selectorTitle}>
            Qui va apprendre{"\n"}aujourd'hui ?
          </Text>

          <ScrollView
            horizontal
            contentContainerStyle={styles.profilesList}
            showsHorizontalScrollIndicator={false}
          >
            {user?.kids?.map((kid: any, i: number) => {
              const avatarColors = [
                Colors.blue,
                Colors.orange,
                Colors.teal,
                Colors.gold,
              ];
              const bg = avatarColors[i % avatarColors.length];
              return (
                <TouchableOpacity
                  key={kid.id}
                  style={styles.profileItem}
                  onPress={() => enterKidMode(kid)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.avatarRing, { borderColor: bg + "50" }]}>
                    <View
                      style={[
                        styles.avatarPlaceholder,
                        { backgroundColor: bg },
                      ]}
                    >
                      <Text style={styles.avatarText}>{kid.name[0]}</Text>
                    </View>
                  </View>
                  <Text style={styles.profileName}>{kid.name}</Text>
                  <View style={[styles.selectPill, { backgroundColor: bg }]}>
                    <Text style={styles.selectPillText}>C'EST MOI ! 🎉</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.backToParent}
            onPress={() =>
              isKidMode ? setShowExitModal(true) : router.replace("/(tabs)")
            }
          >
            <LogOut size={14} color={Colors.slate[400]} />
            <Text style={styles.backToParentText}>Quitter le Hub Enfant</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  // ── Main kid dashboard ───────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require("@/assets/images/kids-bg.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background decorations */}
        <View style={[styles.bgBlob1]} />
        <View style={[styles.bgBlob2]} />
        <View style={[styles.bgBlob3]} />
        <DecoStar
          size={22}
          color={Colors.gold}
          style={{ top: 70, right: 28 }}
        />
        <DecoStar
          size={14}
          color={Colors.teal}
          style={{ top: 130, left: 16 }}
        />
        <Dot size={14} color={Colors.orange} style={{ top: 200, right: 55 }} />
        <Dot size={8} color={Colors.blue} style={{ top: 260, left: 32 }} />

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.kidHeader}>
          <View style={styles.kidInfo}>
            <View style={styles.avatarRingSmall}>
              <View
                style={[styles.smallAvatar, { backgroundColor: Colors.blue }]}
              >
                <Text style={styles.smallAvatarText}>
                  {selectedKid.name[0]}
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.kidGreeting}>Salut 👋</Text>
              <Text style={styles.kidName}>{selectedKid.name} !</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.xpBadge}>
              <Star size={12} color={Colors.gold} fill={Colors.gold} />
              <Text style={styles.xpText}>NIVEAU ⚡</Text>
            </View>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => setShowExitModal(true)}
            >
              <LogOut size={18} color={Colors.slate[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero Card ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push("/lessons")}
          activeOpacity={0.9}
        >
          {/* Inner decoration */}
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <DecoStar
            size={18}
            color="rgba(255,255,255,0.4)"
            style={{ top: 18, right: 70 }}
          />
          <DecoStar
            size={12}
            color={Colors.gold}
            style={{ bottom: 60, left: 24 }}
          />
          <Dot
            size={20}
            color="rgba(255,255,255,0.1)"
            style={{ bottom: 30, right: 30 }}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroIconWrap}>
                <Text style={{ fontSize: 32 }}>📖</Text>
              </View>
              <View style={styles.newBadge}>
                <Sparkles size={13} color={Colors.navy} />
                <Text style={styles.newBadgeText}>NOUVELLE QUÊTE !</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Ta prochaine{"\n"}
              <Text style={styles.heroTitleAccent}>leçon t'attend !</Text>
            </Text>
            <Text style={styles.heroSub}>
              Continue ton aventure en anglais 🚀
            </Text>

            <View style={styles.playButton}>
              <Text style={{ fontSize: 20 }}>🎮</Text>
              <Text style={styles.playButtonText}>COMMENCER L'AVENTURE</Text>
              <ArrowRight size={20} color={Colors.white} />
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Streak / XP strip ────────────────────────────────────────── */}
        <View style={styles.streakStrip}>
          <View style={styles.streakItem}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakValue}>3</Text>
              <Text style={styles.streakLabel}>jours de suite</Text>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakEmoji}>⭐</Text>
            <View>
              <Text style={styles.streakValue}>12</Text>
              <Text style={styles.streakLabel}>étoiles gagnées</Text>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakEmoji}>🏆</Text>
            <View>
              <Text style={styles.streakValue}>2</Text>
              <Text style={styles.streakLabel}>badges</Text>
            </View>
          </View>
        </View>

        {/* ── Activity Grid ─────────────────────────────────────────────── */}
        <View style={styles.gridHeader}>
          <View style={styles.sectionDotRow}>
            <View
              style={[styles.sectionDot, { backgroundColor: Colors.orange }]}
            />
            <Text style={styles.gridSectionTitle}>MES ACTIVITÉS</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <KidActionCard
            title="EXERCICES"
            subtitle="Jeux & défis"
            emoji="✏️"
            bgColor="#FFD93D"
            textColor={Colors.navy}
            icon={<PenTool size={22} color={Colors.navy} />}
            stars={3}
          />
          <KidActionCard
            title="VOCAB"
            subtitle="Mots magiques"
            emoji="📚"
            bgColor={Colors.teal}
            textColor={Colors.white}
            icon={<Shapes size={22} color={Colors.white} />}
            stars={2}
          />
          <KidActionCard
            title="VIDÉOS"
            subtitle="Regarde"
            emoji="🎬"
            bgColor={Colors.blue}
            textColor={Colors.white}
            icon={<Video size={22} color={Colors.white} />}
            stars={4}
          />
          <KidActionCard
            title="JEUX"
            subtitle="Mini-games"
            emoji="🎮"
            bgColor={Colors.orange}
            textColor={Colors.white}
            icon={<Gamepad2 size={22} color={Colors.white} />}
            stars={1}
            isNew
          />
        </View>

        {/* ── Progress banner ───────────────────────────────────────────── */}
        <View style={styles.progressBanner}>
          <View style={styles.progressBannerLeft}>
            <Text style={styles.progressBannerEmoji}>🚀</Text>
            <View>
              <Text style={styles.progressBannerTitle}>
                Continue comme ça !
              </Text>
              <Text style={styles.progressBannerSub}>
                Tu es à 60% du niveau suivant
              </Text>
            </View>
          </View>
          <View style={styles.progressBarWrap}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: "60%" }]} />
            </View>
            <Text style={styles.progressBarPct}>60%</Text>
          </View>
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* ── Floating Bottom Bar ───────────────────────────────────────── */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomBar}>
          <View style={styles.bookingInfo}>
            <View style={styles.schoolIconWrap}>
              <Text style={{ fontSize: 22 }}>🏫</Text>
            </View>
            <View style={styles.flex1}>
              <Text style={styles.bookingLabel}>PROCHAIN COURS</Text>
              <Text style={styles.bookingValue} numberOfLines={1}>
                {nextClass
                  ? new Date(
                      `${nextClass.date}T${nextClass.startTime}`,
                    ).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Aucun cours prévu"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.enterClassButton,
              !nextClass && styles.disabledButton,
            ]}
            disabled={!nextClass}
            onPress={() => {
              if (nextClass) router.push(`/classroom/${nextClass.id}`);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.enterButtonText}>ENTRER</Text>
            <ArrowRight size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

// ── KidActionCard ─────────────────────────────────────────────────────────
function KidActionCard({
  title,
  subtitle,
  emoji,
  bgColor,
  textColor,
  icon,
  stars = 0,
  isNew = false,
}: any) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: bgColor }]}
      activeOpacity={0.82}
    >
      {/* Shine overlay top right */}
      <View style={styles.actionShine} />

      <View style={styles.actionTop}>
        <View
          style={[
            styles.actionIconWrap,
            { backgroundColor: "rgba(0,0,0,0.12)" },
          ]}
        >
          {icon}
        </View>
        <Text style={styles.actionEmoji}>{emoji}</Text>
      </View>

      {isNew && (
        <View style={styles.newChip}>
          <Text style={styles.newChipText}>NEW ✨</Text>
        </View>
      )}

      <View style={styles.actionMiddle}>
        <Text
          style={[
            styles.actionSubtitle,
            {
              color:
                textColor === Colors.white
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(0,0,0,0.5)",
            },
          ]}
        >
          {subtitle}
        </Text>
        <Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text>
      </View>

      {/* Star rating */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Text
            key={s}
            style={{ fontSize: 10, opacity: s <= stars ? 1 : 0.25 }}
          >
            ⭐
          </Text>
        ))}
      </View>

      <View style={styles.actionBottom}>
        <View style={styles.openPill}>
          <Text style={styles.openText}>GO ! →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Containers ─────────────────────────────────────────────────────────────
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.45)", // Subtle white wash for readability
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },

  // ── Background blobs ───────────────────────────────────────────────────────
  bgBlob1: {
    position: "absolute",
    top: -30,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.blue + "12",
  },
  bgBlob2: {
    position: "absolute",
    top: 300,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.orange + "12",
  },
  bgBlob3: {
    position: "absolute",
    top: 580,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.teal + "15",
  },
  blob: { position: "absolute", borderRadius: 100 },

  // ── Selector screen ────────────────────────────────────────────────────────
  selectorContainer: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  logo: {
    width: 160,
    height: 50,
    marginBottom: 8,
  },
  selectorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  selectorTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.navy,
    marginBottom: 40,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  profilesList: {
    gap: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileItem: { alignItems: "center" },
  avatarRing: {
    padding: 6,
    borderRadius: 70,
    borderWidth: 3,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 44,
    fontWeight: "900",
    color: Colors.white,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.navy,
    marginBottom: 10,
  },
  selectPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  selectPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  backToParent: {
    marginTop: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backToParentText: {
    color: Colors.slate[400],
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  kidHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 24,
  },
  kidInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarRingSmall: {
    padding: 3,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: Colors.blue + "40",
  },
  smallAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  smallAvatarText: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.white,
  },
  kidGreeting: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.slate[400],
  },
  kidName: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.gold + "20",
    borderWidth: 1,
    borderColor: Colors.gold + "40",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.gold,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // ── Hero card ──────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: Colors.blue,
    borderRadius: 36,
    padding: 28,
    minHeight: 300,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 12,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    marginBottom: 16,
  },
  heroBlob1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroBlob2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.teal + "40",
  },
  heroContent: { gap: 8 },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: Colors.gold,
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.navy,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.white,
    lineHeight: 38,
    letterSpacing: -1,
  },
  heroTitleAccent: {
    color: Colors.gold,
    fontStyle: "italic",
  },
  heroSub: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.teal,
    paddingVertical: 16,
    borderRadius: 22,
    gap: 10,
    marginTop: 24,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  playButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.white,
    letterSpacing: 1,
  },

  // ── Streak strip ───────────────────────────────────────────────────────────
  streakStrip: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 28,
    shadowColor: Colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.slate[100],
  },
  streakItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  streakEmoji: { fontSize: 24 },
  streakValue: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.slate[400],
  },
  streakDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.slate[100],
  },

  // ── Grid header ────────────────────────────────────────────────────────────
  gridHeader: {
    marginBottom: 16,
  },
  sectionDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gridSectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.slate[400],
    letterSpacing: 1.5,
  },

  // ── Action grid ────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },
  actionCard: {
    width: (width - 54) / 2,
    borderRadius: 28,
    padding: 18,
    height: 210,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: Colors.navy,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  actionShine: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    transform: [{ translateX: 20 }, { translateY: -20 }],
  },
  actionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionEmoji: { fontSize: 26 },
  newChip: {
    alignSelf: "flex-start",
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  newChipText: {
    fontSize: 9,
    fontWeight: "900",
    color: Colors.orange,
  },
  actionMiddle: { gap: 3 },
  actionSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  actionBottom: { alignItems: "flex-start" },
  openPill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: Colors.navy,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  openText: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.navy,
  },

  // ── Progress banner ────────────────────────────────────────────────────────
  progressBanner: {
    backgroundColor: Colors.navy,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    overflow: "hidden",
    shadowColor: Colors.navy,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  progressBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBannerEmoji: { fontSize: 30 },
  progressBannerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.white,
  },
  progressBannerSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  progressBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  progressBarPct: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.gold,
    minWidth: 36,
  },

  // ── Floating bottom bar ────────────────────────────────────────────────────
  bottomBarContainer: {
    position: "absolute",
    bottom: 28,
    left: 16,
    right: 16,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 10,
    paddingLeft: 14,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.slate[100],
  },
  bookingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  schoolIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.blue + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  flex1: { flex: 1 },
  bookingLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: Colors.slate[400],
    letterSpacing: 1,
  },
  bookingValue: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.navy,
  },
  enterClassButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue,
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 22,
    gap: 8,
    shadowColor: Colors.blue,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  disabledButton: {
    backgroundColor: Colors.slate[200],
    shadowOpacity: 0,
    borderColor: "transparent",
  },
  enterButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
