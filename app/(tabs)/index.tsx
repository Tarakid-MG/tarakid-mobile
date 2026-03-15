import { useRouter } from "expo-router";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Gamepad2,
  HelpCircle,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image as RNImage,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/Theme";
import { useAuth } from "../../src/context/AuthContext";
import { useKidMode } from "../../src/context/KidModeContext";
import {
  bookingService,
  freeTrialService,
  kidService,
  subscriptionService,
} from "../../src/services/data.service";
import { styles } from "../../src/styles/index.styles";
import {
  type Booking,
  type FreeTrialBooking,
  type Subscription,
} from "../../src/types/auth";

const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: "quiz",
    title: 'Quiz "Les Animaux" complété',
    date: "Hier",
    score: "8/10",
  },
  {
    id: 2,
    type: "video",
    title: 'Vidéo "Les Couleurs" regardée',
    date: "Il y a 2 jours",
  },
  {
    id: 3,
    type: "achievement",
    title: 'Badge "Explorateur" débloqué',
    date: "Il y a 3 jours",
  },
];

const LEVEL_DATA: Record<
  string,
  { label: string; percent: number; color: string }
> = {
  L0: { label: "Pre-K Explorer", percent: 0, color: Colors.slate[300] },
  L1: { label: "Junior Starter", percent: 20, color: Colors.lightBlue },
  L2: { label: "Starter", percent: 40, color: Colors.blue },
  L3: { label: "Mover", percent: 60, color: Colors.teal },
  L4: { label: "Flyer", percent: 80, color: Colors.orange },
  L5: { label: "Master Explorer", percent: 100, color: Colors.gold },
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { selectedKid, enterKidMode, updateSelectedKid, exitKidMode } =
    useKidMode();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [stats, setStats] = useState({
    credits: 0,
    booked: 0,
    finished: 0,
    activeSubId: null as string | null,
  });
  const [nextBooking, setNextBooking] = useState<any>(null);

  const getKidId = (id: any) => (typeof id === "string" ? parseInt(id) : id);

  useEffect(() => {
    if (user?.kids && selectedKid) {
      const latestKid = user.kids.find(
        (k) => getKidId(k.id) === getKidId(selectedKid.id),
      );
      if (latestKid) {
        if (JSON.stringify(latestKid) !== JSON.stringify(selectedKid)) {
          updateSelectedKid(latestKid);
        }
      } else {
        exitKidMode();
      }
    }
  }, [user?.kids]);

  useEffect(() => {
    if (!selectedKid) return;
    const fetchLevel = async () => {
      try {
        const { level } = await kidService.getLevel(selectedKid.id.toString());
        if (level && level !== selectedKid.level) {
          updateSelectedKid({ ...selectedKid, level });
        }
      } catch (err) {
        console.error("Failed to fetch latest level", err);
      }
    };
    fetchLevel();
  }, [selectedKid?.id]);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [trialBookings, regularBookings, kidSubscriptions]: [
        FreeTrialBooking[],
        Booking[],
        Subscription[],
      ] = await Promise.all([
        freeTrialService.getUserBookings(user.id),
        selectedKid
          ? bookingService.getKidBookings(selectedKid.id.toString())
          : Promise.resolve([]),
        selectedKid
          ? subscriptionService.getKidSubscriptions(selectedKid.id.toString())
          : Promise.resolve([]),
      ]);

      const kidTrials = selectedKid
        ? trialBookings.filter(
            (b) => getKidId(b.kidId) === getKidId(selectedKid.id),
          )
        : trialBookings;

      const now = new Date();
      const unifiedUpcoming = [
        ...kidTrials
          .filter((b) => b.status === "CONFIRMED" && b.session)
          .map((b) => ({
            ...b,
            displayType: "FREE_TRIAL" as const,
            date: b.session!.date,
            start: b.session!.startTime,
            end: b.session!.endTime,
          })),
        ...regularBookings
          .filter((b) => b.status === "SCHEDULED")
          .map((b) => ({
            ...b,
            displayType: "REGULAR" as const,
            date: b.sessionDate,
            start: b.startTime,
            end: b.endTime,
          })),
      ]
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.date}T${a.start}`);
          const dateB = new Date(`${b.date}T${b.start}`);
          return dateA.getTime() - dateB.getTime();
        })
        .filter((b: any) => new Date(`${b.date}T${b.start}`) > now);

      setNextBooking(unifiedUpcoming[0] || null);

      let credits = 0;
      let booked = 0;
      let finished = 0;
      let activeSubId = null;

      if (selectedKid) {
        finished += regularBookings.filter(
          (b) => b.status === "COMPLETED",
        ).length;
        booked += regularBookings.filter(
          (b) => b.status === "SCHEDULED",
        ).length;

        const freeTrialCompleted = kidTrials.filter(
          (b) =>
            b.status === "CONFIRMED" &&
            b.session &&
            new Date(`${b.session.date}T${b.session.endTime}`) < now,
        ).length;

        const freeTrialBooked = kidTrials.filter(
          (b) =>
            b.status === "CONFIRMED" &&
            b.session &&
            new Date(`${b.session.date}T${b.session.endTime}`) >= now,
        ).length;

        finished += freeTrialCompleted;
        booked += freeTrialBooked;

        const activeSub = kidSubscriptions.find((s) => s.status === "ACTIVE");
        credits = activeSub ? activeSub.remainingCredits : (user.credits ?? 0);
        activeSubId = activeSub?.id || null;

        const hasTrialBooked = kidTrials.some((b) => b.status === "CONFIRMED");
        if (!hasTrialBooked) credits += 1;

        setStats({ credits, booked, finished, activeSubId });
      } else {
        credits = user.credits ?? 0;
        setStats({ credits, booked, finished, activeSubId });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedKid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCancelBooking = async () => {
    if (!nextBooking || !user?.id) return;
    setCanceling(true);
    try {
      if (nextBooking.displayType === "FREE_TRIAL") {
        await freeTrialService.cancelBooking(Number(nextBooking.id), user.id);
      } else {
        await bookingService.cancelBooking(String(nextBooking.id));
      }
      await refreshProfile();
      fetchData();
      Alert.alert("Succès", "Votre réservation a été annulée.");
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'annuler la réservation.");
    } finally {
      setCanceling(false);
    }
  };

  const handleReschedule = async () => {
    if (!nextBooking || !user?.id) return;
    setCanceling(true);
    try {
      if (nextBooking.displayType === "FREE_TRIAL") {
        await freeTrialService.cancelBooking(Number(nextBooking.id), user.id);
        router.push("/free-trial-booking" as any);
      } else {
        await bookingService.cancelBooking(String(nextBooking.id));
        router.push("/(tabs)/schedule" as any);
      }
      await refreshProfile();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de reporter.");
    } finally {
      setCanceling(false);
    }
  };

  const formatDateFR = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const levelInfo = LEVEL_DATA[selectedKid?.level ?? "L0"] ?? LEVEL_DATA["L0"];

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.blue}
        />
      }
    >
      {/* Hero header with gradient bg */}
      <View style={styles.heroHeader}>
        <View style={styles.heroGradientOverlay} />
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting}>
              Bonjour,{" "}
              <Text style={styles.greetingAccent}>{user?.firstName}</Text> 👋
            </Text>
            <Text style={styles.subtitle}>
              Prêt pour une nouvelle journée ?
            </Text>
          </View>
          <View style={styles.logoWrapper}>
            <RNImage
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        {user?.kids && user.kids.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.kidSwitcher}
          >
            {user.kids.map((kid) => (
              <TouchableOpacity
                key={kid.id}
                onPress={() => enterKidMode(kid)}
                style={[
                  styles.kidTab,
                  getKidId(selectedKid?.id) === getKidId(kid.id) &&
                    styles.kidTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.kidTabText,
                    getKidId(selectedKid?.id) === getKidId(kid.id) &&
                      styles.kidTabTextActive,
                  ]}
                >
                  {kid.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Kid Mode card — vibrant orange accent */}
      <View style={styles.kidModeCardWrapper}>
        <View style={styles.kidModeCardInner}>
          <View style={styles.kidModeGlow} />
          <TouchableOpacity
            style={styles.kidModeContent}
            onPress={() => router.push("/kid-dashboard" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.kidModeIconBg}>
              <Gamepad2 size={26} color={Colors.white} />
            </View>
            <View style={styles.flex1}>
              <View style={styles.row}>
                <Text style={styles.kidModeTitle}>Mode Kid Hub</Text>
                <View style={styles.kidModeBadge}>
                  <Sparkles size={9} color={Colors.teal} />
                  <Text style={styles.kidModeBadgeText}>ACCÈS RAPIDE</Text>
                </View>
              </View>
              <Text style={styles.kidModeDesc}>
                Jeux, activités et tableau enfant.
              </Text>
            </View>
            <View style={styles.arrowIconFilled}>
              <ArrowRight size={18} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard
          icon={<Zap size={18} color={Colors.gold} fill={Colors.gold} />}
          label="Crédits"
          value={stats.credits}
          accentColor={Colors.gold}
          onPress={() => {
            const url = stats.activeSubId
              ? `/(tabs)/schedule?subscriptionId=${stats.activeSubId}`
              : `/(tabs)/schedule`;
            router.push(url as any);
          }}
        />
        <StatCard
          icon={<BookOpen size={18} color={Colors.blue} />}
          label="Réservés"
          value={stats.booked}
          accentColor={Colors.blue}
          onPress={() => router.push("/(tabs)/schedule" as any)}
        />
        <StatCard
          icon={<CheckCircle size={18} color={Colors.teal} />}
          label="Terminés"
          value={stats.finished}
          accentColor={Colors.teal}
        />
      </View>

      {/* Next booking */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>PROCHAIN COURS</Text>
          </View>
          <TouchableOpacity
            style={styles.sectionLinkBtn}
            onPress={() => router.push("/(tabs)/schedule" as any)}
          >
            <Text style={styles.sectionLink}>PLANNING</Text>
            <ChevronRight size={12} color={Colors.blue} />
          </TouchableOpacity>
        </View>

        {nextBooking ? (
          <View style={styles.bookingCardOuter}>
            {/* Colored top stripe */}
            <View
              style={[
                styles.bookingStripe,
                {
                  backgroundColor:
                    nextBooking.displayType === "FREE_TRIAL"
                      ? Colors.teal
                      : Colors.blue,
                },
              ]}
            >
              <View style={styles.bookingStripeContent}>
                <View style={styles.bookingTypePill}>
                  <Text style={styles.bookingTypePillText}>
                    {nextBooking.displayType === "FREE_TRIAL"
                      ? "✦ COURS D'ESSAI"
                      : "✦ COURS"}
                  </Text>
                </View>
                <View style={styles.bookingStatusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.bookingStatusText}>À VENIR</Text>
                </View>
              </View>
              <Text style={styles.bookingStripeTitle}>
                {nextBooking.displayType === "FREE_TRIAL"
                  ? "L'aventure TaraKid commence !"
                  : "Prêt pour votre cours ?"}
              </Text>
            </View>

            <View style={styles.bookingBody}>
              <View style={styles.bookingInfoRow}>
                <View style={styles.bookingInfoItem}>
                  <View
                    style={[
                      styles.bookingInfoIcon,
                      { backgroundColor: Colors.blue + "12" },
                    ]}
                  >
                    <Calendar size={15} color={Colors.blue} />
                  </View>
                  <Text style={styles.bookingInfoText}>
                    {formatDateFR(nextBooking.date)}
                  </Text>
                </View>
                <View style={styles.bookingInfoDivider} />
                <View style={styles.bookingInfoItem}>
                  <View
                    style={[
                      styles.bookingInfoIcon,
                      { backgroundColor: Colors.blue + "12" },
                    ]}
                  >
                    <Clock size={15} color={Colors.blue} />
                  </View>
                  <Text style={styles.bookingInfoText}>
                    {nextBooking.start.substring(0, 5)} –{" "}
                    {nextBooking.end.substring(0, 5)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingActions}>
                <TouchableOpacity
                  style={styles.joinBtnNew}
                  onPress={() => router.push("/kid-dashboard" as any)}
                >
                  <Play size={15} color={Colors.white} fill={Colors.white} />
                  <Text style={styles.joinBtnNewText}>Se connecter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.manageBtn}
                  onPress={() =>
                    Alert.alert("Options", "Gérez votre réservation", [
                      { text: "Reporter", onPress: handleReschedule },
                      {
                        text: "Annuler",
                        onPress: handleCancelBooking,
                        style: "destructive",
                      },
                      { text: "Fermer", style: "cancel" },
                    ])
                  }
                >
                  <Text style={styles.manageBtnText}>Gérer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyBookingCard}>
            <View style={styles.emptyBookingIcon}>
              <Calendar size={28} color={Colors.blue + "60"} />
            </View>
            <Text style={styles.emptyTitle}>Aucun cours programmé</Text>
            <Text style={styles.emptyDesc}>
              Réservez votre séance dès maintenant.
            </Text>
            <TouchableOpacity
              style={styles.reserveBtn}
              onPress={() => router.push("/(tabs)/schedule" as any)}
            >
              <Text style={styles.reserveBtnText}>Réserver un cours</Text>
              <ArrowRight size={15} color={Colors.blue} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Level / progression */}
      <View style={styles.section}>
        <View style={styles.levelCard}>
          <View
            style={[
              styles.levelCardGlow,
              { backgroundColor: levelInfo.color + "30" },
            ]}
          />
          <View style={styles.levelCardTop}>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: levelInfo.color + "20",
                  borderColor: levelInfo.color + "40",
                },
              ]}
            >
              <Star size={16} color={levelInfo.color} fill={levelInfo.color} />
              <Text style={[styles.levelBadgeText, { color: levelInfo.color }]}>
                {selectedKid?.level || "L0"}
              </Text>
            </View>
            <View style={styles.levelTitleBlock}>
              <Text style={styles.levelName}>{levelInfo.label}</Text>
              <Text style={styles.levelSub}>Niveau actuel</Text>
            </View>
            <View style={styles.trophyCircle}>
              <Trophy size={20} color={levelInfo.color} />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${levelInfo.percent}%`,
                  backgroundColor: levelInfo.color,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressPct}>
              {levelInfo.percent}% complété
            </Text>
            <View style={styles.progressMilestone}>
              <TrendingUp size={11} color={Colors.teal} />
              <Text style={styles.progressMilestoneText}>En progression</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[styles.sectionDot, { backgroundColor: Colors.gold }]}
            />
            <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
          </View>
        </View>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={[styles.quickItem, { borderColor: Colors.gold + "30" }]}
            onPress={() => router.push("/(tabs)/schedule" as any)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.quickItemIcon,
                { backgroundColor: Colors.gold + "18" },
              ]}
            >
              <Zap size={22} color={Colors.gold} fill={Colors.gold} />
            </View>
            <Text style={styles.quickItemLabel}>Abonnement</Text>
            <Text style={styles.quickItemTitle}>Recharger</Text>
            <ArrowRight
              size={14}
              color={Colors.slate[300]}
              style={{ marginTop: 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickItem, { borderColor: Colors.blue + "30" }]}
            onPress={() => router.push("/(tabs)/schedule" as any)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.quickItemIcon,
                { backgroundColor: Colors.blue + "12" },
              ]}
            >
              <Calendar size={22} color={Colors.blue} />
            </View>
            <Text style={styles.quickItemLabel}>Planning</Text>
            <Text style={styles.quickItemTitle}>Voir</Text>
            <ArrowRight
              size={14}
              color={Colors.slate[300]}
              style={{ marginTop: 4 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[styles.sectionDot, { backgroundColor: Colors.teal }]}
            />
            <Text style={styles.sectionTitle}>ACTIVITÉ RÉCENTE</Text>
          </View>
        </View>
        <View style={styles.activityCard}>
          {MOCK_ACTIVITIES.map((activity, index) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityItem,
                index === MOCK_ACTIVITIES.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.activityIconCircle,
                  {
                    backgroundColor:
                      activity.type === "quiz"
                        ? Colors.blue + "12"
                        : activity.type === "video"
                          ? Colors.orange + "12"
                          : Colors.gold + "15",
                  },
                ]}
              >
                {activity.type === "quiz" ? (
                  <BookOpen size={16} color={Colors.blue} />
                ) : activity.type === "video" ? (
                  <Sparkles size={16} color={Colors.orange} />
                ) : (
                  <Trophy size={16} color={Colors.gold} />
                )}
              </View>
              <View style={styles.flex1}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              {activity.score && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{activity.score}</Text>
                </View>
              )}
              <ChevronRight size={14} color={Colors.slate[200]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <View style={styles.supportCard}>
          <View style={styles.supportLeft}>
            <View
              style={[
                styles.supportIconCircle,
                { backgroundColor: Colors.teal + "18" },
              ]}
            >
              <HelpCircle size={20} color={Colors.teal} />
            </View>
            <View>
              <Text style={styles.supportTitle}>Besoin d'aide ?</Text>
              <Text style={styles.supportSubtitle}>
                Testez votre matériel avant le cours.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.supportBtn}>
            <Text style={styles.supportBtnText}>Tester</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  accentColor,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accentColor: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { borderTopColor: accentColor }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View
        style={[styles.statIconBox, { backgroundColor: accentColor + "15" }]}
      >
        {icon}
      </View>
      <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}
