import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BookingStatus,
  Chauffeur,
  Trip,
  getChauffeurs,
  getTrips,
  loginAsAdmin,
  updateTripStatus,
} from "./src/api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "#fcd34d",
  CONFIRMED: "#7dd3fc",
  IN_PROGRESS: "#c4b5fd",
  COMPLETED: "#6ee7b7",
  CANCELLED: "#fca5a5",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// The status button moves a trip one step forward
const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  PENDING: "IN_PROGRESS",
  CONFIRMED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const BUTTON_LABELS: Partial<Record<BookingStatus, string>> = {
  PENDING: "Start trip",
  CONFIRMED: "Start trip",
  IN_PROGRESS: "Complete trip",
};

// "2026-12-10T10:00:00" -> "10 Dec 2026, 10:00"
function formatDateTime(isoDateTime: string): string {
  const [datePart, timePart = ""] = isoDateTime.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day} ${MONTHS[Number(month) - 1]} ${year}, ${timePart.slice(0, 5)}`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [starting, setStarting] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On start: sign in and load the chauffeur list
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const authToken = await loginAsAdmin();
        const list = await getChauffeurs(authToken);
        if (cancelled) return;
        setToken(authToken);
        setChauffeurs(list);
        setSelectedId(list.length > 0 ? list[0].id : null);
      } catch (err) {
        if (!cancelled) setError(messageOf(err));
      } finally {
        if (!cancelled) setStarting(false);
      }
    }
    start();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the selected chauffeur's trips (again when pulled down to refresh)
  useEffect(() => {
    if (!token || selectedId === null) return;
    let cancelled = false;
    async function loadTrips(authToken: string, chauffeurId: number) {
      try {
        const data = await getTrips(chauffeurId, authToken);
        if (!cancelled) {
          setTrips(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(messageOf(err));
      } finally {
        if (!cancelled) {
          setTripsLoading(false);
          setRefreshing(false);
        }
      }
    }
    loadTrips(token, selectedId);
    return () => {
      cancelled = true;
    };
  }, [token, selectedId, reloadKey]);

  function selectChauffeur(id: number) {
    if (id === selectedId) return;
    setTrips([]);
    setTripsLoading(true);
    setSelectedId(id);
  }

  function refresh() {
    setRefreshing(true);
    setReloadKey((key) => key + 1);
  }

  async function advanceTrip(trip: Trip) {
    const nextStatus = NEXT_STATUS[trip.status];
    if (!nextStatus || !token) return;
    setUpdatingId(trip.id);
    setError(null);
    try {
      const updated = await updateTripStatus(trip.id, nextStatus, token);
      setTrips((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setUpdatingId(null);
    }
  }

  const selectedChauffeur = chauffeurs.find((chauffeur) => chauffeur.id === selectedId);
    const emptyMessage =
    !starting && !tripsLoading && selectedChauffeur ? (
      <Text style={styles.empty}>No trips assigned to {selectedChauffeur.name} yet.</Text>
    ) : undefined;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Text style={styles.title}>LUXORIDES</Text>
      <Text style={styles.subtitle}>Chauffeur app: your assigned trips</Text>

      {starting && <ActivityIndicator color="#fcd34d" style={styles.spinner} />}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {chauffeurs.length > 0 && (
        <View>
          <Text style={styles.label}>Who are you?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {chauffeurs.map((chauffeur) => (
              <Pressable
                key={chauffeur.id}
                onPress={() => selectChauffeur(chauffeur.id)}
                style={[styles.chip, chauffeur.id === selectedId && styles.chipSelected]}
              >
                <Text style={[styles.chipText, chauffeur.id === selectedId && styles.chipTextSelected]}>
                  {chauffeur.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {tripsLoading && !starting && selectedId !== null && (
        <ActivityIndicator color="#fcd34d" style={styles.spinner} />
      )}

      <FlatList
        data={trips}
        keyExtractor={(trip) => String(trip.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#fcd34d" />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={emptyMessage}
        renderItem={({ item: trip }) => {
          const buttonLabel = BUTTON_LABELS[trip.status];
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.vehicle}>{trip.vehicleName}</Text>
                <Text style={[styles.status, { color: STATUS_COLORS[trip.status] }]}>
                  {STATUS_LABELS[trip.status]}
                </Text>
              </View>
              <Text style={styles.detail}>{trip.city}</Text>
              <Text style={styles.detail}>
                {formatDateTime(trip.pickupTime)} ({trip.durationHours} hrs)
              </Text>
              <Text style={styles.detail}>
                {trip.customerName}, {trip.customerPhone}
              </Text>
              {buttonLabel && (
                <Pressable
                  onPress={() => advanceTrip(trip)}
                  disabled={updatingId === trip.id}
                  style={[styles.button, updatingId === trip.id && styles.buttonDisabled]}
                >
                  <Text style={styles.buttonText}>
                    {updatingId === trip.id ? "Updating…" : buttonLabel}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 56, paddingHorizontal: 16 },
  title: { color: "#fcd34d", fontSize: 22, fontWeight: "700", letterSpacing: 3 },
  subtitle: { color: "#a3a3a3", marginTop: 4, marginBottom: 16 },
  spinner: { marginVertical: 16 },
  label: { color: "#a3a3a3", fontSize: 12, marginBottom: 8 },
  chipRow: { flexGrow: 0, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: { backgroundColor: "#fcd34d", borderColor: "#fcd34d" },
  chipText: { color: "#e5e5e5" },
  chipTextSelected: { color: "#000", fontWeight: "600" },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.4)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#fca5a5" },
  list: { paddingBottom: 40 },
  empty: { color: "#a3a3a3", textAlign: "center", marginTop: 32 },
  card: {
    backgroundColor: "#171717",
    borderColor: "#262626",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  vehicle: { color: "#fff", fontSize: 18, fontWeight: "600", flexShrink: 1 },
  status: { fontWeight: "600" },
  detail: { color: "#a3a3a3", marginTop: 2 },
  button: {
    backgroundColor: "#fcd34d",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#000", fontWeight: "700" },
});