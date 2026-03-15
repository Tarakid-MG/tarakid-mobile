import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Star,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Image as RNImage,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PremiumButton } from "../../src/components/ui/PremiumButton";
import { PremiumCard } from "../../src/components/ui/PremiumCard";
import { Colors } from "../../src/constants/Theme";
import { useAuth } from "../../src/context/AuthContext";
import { useKidMode } from "../../src/context/KidModeContext";
import {
  bookingService,
  freeTrialService,
  subscriptionService,
} from "../../src/services/data.service";
import { styles } from "../../src/styles/schedule.styles";
import {
  type Booking,
  type FreeTrialBooking,
  type Subscription,
} from "../../src/types/auth";

type ScheduleItem = {
  id: string | number;
  type: "FREE_TRIAL" | "REGULAR";
  date: string;
  start: string;
  end: string;
  kidId?: string | number;
};

function formatDateFR(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function toHHMM(time: string) {
  return (time || "").substring(0, 5);
}

function toDateTime(date: string, time: string) {
  return new Date(`${date}T${toHHMM(time)}:00`);
}

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selectedKid, enterKidMode } = useKidMode();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allBookings, setAllBookings] = useState<ScheduleItem[]>([]);
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);

  // Determine which kid to fetch data for
  const selectedKidId =
    selectedKid?.id ??
    (user?.kids && user.kids.length > 0 ? user.kids[0].id : null);

  const selectedKidObj = useMemo(() => {
    if (!user?.kids || !selectedKidId) return undefined;
    return user.kids.find((k) => String(k.id) === String(selectedKidId));
  }, [user, selectedKidId]);

  const fetchData = useCallback(async () => {
    if (!user?.id || !selectedKidId) {
      setLoading(false);
      return;
    }

    try {
      const [freeTrialData, regularData, subscriptions] = await Promise.all([
        freeTrialService.getUserBookings(user.id),
        bookingService.getKidBookings(String(selectedKidId)),
        subscriptionService.getKidSubscriptions(String(selectedKidId)),
      ]);

      // Active subscription
      const active = (subscriptions as Subscription[]).find(
        (s) => s.status === "ACTIVE",
      );
      setActiveSub(active || null);

      // Free trial bookings for this kid — only confirmed ones
      const freeTrialFiltered = (freeTrialData as FreeTrialBooking[]).filter(
        (b) =>
          String(b.kidId) === String(selectedKidId) &&
          b.status === "CONFIRMED" &&
          b.session?.date &&
          b.session?.startTime &&
          b.session?.endTime,
      );

      const combined: ScheduleItem[] = [
        ...freeTrialFiltered.map(
          (b): ScheduleItem => ({
            id: b.id,
            type: "FREE_TRIAL",
            date: b.session!.date,
            start: b.session!.startTime,
            end: b.session!.endTime,
            kidId: b.kidId,
          }),
        ),
        ...(regularData as Booking[])
          .filter(
            (b) =>
              b.sessionDate &&
              b.startTime &&
              b.endTime &&
              !["CANCELLED", "REPORTED"].includes(b.status),
          )
          .map(
            (b): ScheduleItem => ({
              id: b.id,
              type: "REGULAR",
              date: b.sessionDate,
              start: b.startTime,
              end: b.endTime,
              kidId: selectedKidId ?? undefined,
            }),
          ),
      ].sort((a, b) => {
        const A = toDateTime(a.date, a.start).getTime();
        const B = toDateTime(b.date, b.start).getTime();
        return A - B;
      });

      setAllBookings(combined);
    } catch (error) {
      console.error("Schedule fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, selectedKidId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Only future sessions
  const upcoming = useMemo(() => {
    const now = new Date();
    return allBookings.filter((b) => toDateTime(b.date, b.start) > now);
  }, [allBookings]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  const kidName = selectedKidObj?.name ?? "votre enfant";

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
      {/* Decorative circle */}
      <View style={styles.decorCircle} />

      {/* Hero header with gradient bg */}
      <View
        style={[styles.heroHeader, { paddingTop: Math.max(insets.top, 24) }]}
      >
        <View style={styles.heroGradientOverlay} />
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting}>
              Mon <Text style={styles.greetingAccent}>Planning</Text> 🗓️
            </Text>
            <Text style={styles.subtitle}>
              {selectedKidObj?.name ? `Cours de ${selectedKidObj.name} · ` : ""}
              Gérez et rejoignez la classe en un clic.
            </Text>
          </View>
          <View style={[styles.logoWrapper, { gap: 10 }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/(tabs)" as any)}
            >
              <ArrowLeft size={20} color={Colors.blue} />
            </TouchableOpacity>
            <RNImage
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Subscription / Credits Card */}
      <View style={styles.section}>
        <PremiumCard accent="gold" style={styles.creditsCard}>
          <View style={styles.creditsRow}>
            <View style={styles.creditsIconWrap}>
              <Zap size={24} color={Colors.gold} fill={Colors.gold} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.creditsLabel}>
                {activeSub ? "CRÉDITS RESTANTS" : "ABONNEMENT"}
              </Text>
              <Text style={styles.creditsValue}>
                {activeSub
                  ? activeSub.remainingCredits
                  : "Aucun abonnement actif"}
              </Text>
              {!activeSub && (
                <Text style={styles.creditsHint}>
                  Abonnez-vous pour réserver des cours.
                </Text>
              )}
            </View>
            <PremiumButton
              onPress={() => {
                // Navigate to book or subscribe
                router.push("/(tabs)" as any);
              }}
              size="sm"
              style={styles.reserveBtn}
            >
              <Text style={styles.reserveBtnText}>
                {activeSub && activeSub.remainingCredits > 0
                  ? "Réserver"
                  : "S'abonner"}
              </Text>
            </PremiumButton>
          </View>
        </PremiumCard>
      </View>

      {/* Upcoming section header */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIconWrap}>
              <Clock size={20} color={Colors.blue} />
            </View>
            <Text style={styles.sectionTitle}>Prochains cours</Text>
          </View>
          <TouchableOpacity
            style={styles.dashboardLink}
            onPress={() => router.push("/(tabs)" as any)}
          >
            <Text style={styles.dashboardLinkText}>Dashboard</Text>
            <ArrowRight size={16} color={Colors.blue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking cards */}
      {upcoming.length > 0 ? (
        <View style={styles.bookingList}>
          {upcoming.map((booking) => {
            const isTrial = booking.type === "FREE_TRIAL";
            return (
              <PremiumCard
                key={String(booking.id)}
                accent={isTrial ? "orange" : "blue"}
                style={styles.bookingCard}
              >
                {/* Top row: date + badge */}
                <View style={styles.bookingTopRow}>
                  <View style={styles.flex1}>
                    <Text style={styles.bookingDate}>
                      {formatDateFR(booking.date)}
                    </Text>
                    <View style={styles.timeRow}>
                      <Clock size={15} color={Colors.blue} />
                      <Text style={styles.timeText}>
                        {toHHMM(booking.start)} – {toHHMM(booking.end)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      isTrial ? styles.typeBadgeTrial : styles.typeBadgeRegular,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: isTrial ? Colors.orange : Colors.blue },
                      ]}
                    >
                      {isTrial ? "ESSAI" : "STANDARD"}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Title row */}
                <View style={styles.bookingMainRow}>
                  <View style={styles.starWrap}>
                    <Star size={22} color={Colors.gold} fill={Colors.gold} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.courseTitle}>
                      Anglais {isTrial ? "Découverte" : "Standard"}
                    </Text>
                    <Text style={styles.courseKid}>
                      Pour : <Text style={styles.kidNameAccent}>{kidName}</Text>
                    </Text>
                  </View>
                </View>

                {/* CTA */}
                <View style={styles.bookingActions}>
                  <PremiumButton
                    onPress={() => {
                      const kid = user?.kids?.find(
                        (k) => String(k.id) === String(selectedKidId),
                      );
                      if (kid) enterKidMode(kid);
                      router.push("/kid-dashboard" as any);
                    }}
                    fullWidth
                    style={styles.joinBtn}
                  >
                    <Text style={styles.joinBtnText}>Rejoindre la classe</Text>
                  </PremiumButton>
                </View>
              </PremiumCard>
            );
          })}
        </View>
      ) : (
        /* Empty state */
        <View style={styles.section}>
          <PremiumCard style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconWrap}>
                <Calendar size={36} color={Colors.slate[300]} />
              </View>
              <Text style={styles.emptyTitle}>Aucun cours prévu</Text>
              <Text style={styles.emptySubtitle}>
                Réservez un créneau pour continuer l'apprentissage de {kidName}.
              </Text>
              <PremiumButton
                onPress={() => router.push("/(tabs)" as any)}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>
                  {activeSub ? "Réserver un cours" : "Découvrir nos offres"}
                </Text>
              </PremiumButton>
            </View>
          </PremiumCard>
        </View>
      )}

      {/* Past sessions section */}
      {allBookings.filter((b) => toDateTime(b.date, b.start) <= new Date())
        .length > 0 && (
        <View style={[styles.section, { marginTop: 12 }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <View
                style={[
                  styles.sectionIconWrap,
                  { backgroundColor: Colors.slate[100] },
                ]}
              >
                <BookOpen size={20} color={Colors.slate[400]} />
              </View>
              <Text style={[styles.sectionTitle, { color: Colors.slate[500] }]}>
                Cours passés
              </Text>
            </View>
          </View>

          <View style={styles.pastList}>
            {allBookings
              .filter((b) => toDateTime(b.date, b.start) <= new Date())
              .slice()
              .reverse()
              .map((booking) => {
                const isTrial = booking.type === "FREE_TRIAL";
                return (
                  <PremiumCard
                    key={`past-${String(booking.id)}`}
                    style={styles.pastCard}
                  >
                    <View style={styles.pastRow}>
                      <View style={styles.flex1}>
                        <Text style={styles.pastDate}>
                          {formatDateFR(booking.date)}
                        </Text>
                        <View style={styles.timeRow}>
                          <Clock size={13} color={Colors.slate[300]} />
                          <Text
                            style={[
                              styles.timeText,
                              { color: Colors.slate[400] },
                            ]}
                          >
                            {toHHMM(booking.start)} – {toHHMM(booking.end)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: Colors.slate[50],
                            borderColor: Colors.slate[100],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            { color: Colors.slate[400] },
                          ]}
                        >
                          {isTrial ? "ESSAI" : "STANDARD"}
                        </Text>
                      </View>
                    </View>
                  </PremiumCard>
                );
              })}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
