import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useIsAdmin,
  useTerminal,
  useLanes,
  useLanesRealtime,
  incLane,
  decLane,
} from "@/features/lanes/hooks";

const SCREEN_H = Dimensions.get("window").height;
const LANE_AREA_H = Math.round(SCREEN_H * 0.65);

export default function AtalayaTerminalScreen() {
  const { terminal } = useLocalSearchParams<{ terminal?: string }>();
  const insets = useSafeAreaInsets();

  const { data: term, isLoading: loadingTerm, error: errTerm } =
    useTerminal(terminal || "");

  const {
    data: lanesRaw,
    refetch,
    isFetching,
    isLoading: loadingLanes,
    error: errLanes,
  } = useLanes(term?.id);

  useLanesRealtime(term?.id);

  const { data: role } = useIsAdmin();
  const isAdmin = !!role?.isAdmin;

  const [overlayH, setOverlayH] = useState(LANE_AREA_H);
  const onLayout = (e: LayoutChangeEvent) =>
    setOverlayH(Math.max(1, Math.floor(e.nativeEvent.layout.height)));

  const HEADER_H = 18;

  const lanes = useMemo(() => {
    const arr = lanesRaw ?? [];
    return [...arr].sort((a: any, b: any) =>
      String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "es", {
        numeric: true,
      })
    );
  }, [lanesRaw]);

  const onPlus = async (laneId: string) => {
    try {
      await incLane(laneId);
    } catch (e: any) {
      Alert.alert("Error", String(e?.message ?? e));
    }
  };

  const onMinus = async (laneId: string) => {
    try {
      await decLane(laneId);
    } catch (e: any) {
      Alert.alert("Error", String(e?.message ?? e));
    }
  };

  if (loadingTerm || loadingLanes) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (errTerm || errLanes) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          No se pudo cargar el terminal.
        </Text>
        <Text style={{ opacity: 0.7 }}>
          {String(errTerm?.message || errLanes?.message || "Error")}
        </Text>

        <Pressable
          onPress={() => refetch()}
          style={{
            marginTop: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: "#e6f0ff",
            alignItems: "center",
            alignSelf: "flex-start",
          }}
        >
          <Text>Reintentar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const usableH = Math.max(1, overlayH - HEADER_H - 6);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <View
        style={{
          paddingTop: Math.max(insets.top, 8),
          paddingBottom: 8,
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 20 }}>
          {terminal || term?.name || "Terminal"}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => refetch()}
            disabled={isFetching}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: isFetching ? "#e8e8e8" : "#e6f0ff",
            }}
          >
            <Text>{isFetching ? "Actualizando..." : "Actualizar"}</Text>
          </Pressable>

          {isAdmin && (
            <View
              style={{
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: "#f2fff6",
                borderWidth: 1,
                borderColor: "#cdebd6",
              }}
            >
              <Text style={{ color: "#1b8f52", fontWeight: "700" }}>ADMIN</Text>
            </View>
          )}
        </View>
      </View>

      <View onLayout={onLayout} style={{ height: LANE_AREA_H, paddingHorizontal: 8 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            paddingHorizontal: 2,
            height: HEADER_H,
            marginBottom: 6,
          }}
        >
          {lanes.map((lane, i) => {
            // i = 0 → carril 1   → DPW
             // i = 1 → carril 2   → APM
            // i = 2 → carril 3   → Libre
            const label =
                i === 0 ? "DPW" :
                i === 1 ? "APM" :
                i === 2 ? "Libre" :
                `C${i + 1}`; // fallback si algún día hay más

            return (
            <View key={`h-${lane.id}`} style={{ flex: 1, alignItems: "center" }}>
             <Text style={{ fontSize: 11, fontWeight: "700" }} numberOfLines={1}>
                {label}
                </Text>
         </View>
            );
        })}

        </View>

        <View style={{ flex: 1, flexDirection: "row", gap: 6 }}>
          {lanes.map((lane) => {
            const cap = Math.max(1, Number(lane.capacity ?? 8));
            const occ = Math.max(0, Math.min(cap, Number(lane?.state?.occupancy ?? 0)));
            const full = occ >= cap;

            const blockH =
              cap > 0
                ? Math.max(1, Math.floor((usableH - (cap - 1) * 4) / cap))
                : usableH;

            return (
              <View
                key={lane.id}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#e2e2e2",
                  backgroundColor: "#fafafa",
                  padding: 4,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {Array.from({ length: full ? cap : occ }).map((_, k) => (
                    <View
                      key={k}
                      style={{
                        width: "85%",
                        height: blockH,
                        borderRadius: 4,
                        backgroundColor: full ? "#d83a3a" : "#1fbf75",
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {isAdmin && (
        <ScrollView
          horizontal
          contentContainerStyle={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            gap: 10,
          }}
          showsHorizontalScrollIndicator={false}
        >
          {lanes.map((lane, i) => {
            const cap = Number(lane.capacity ?? 8);
            const occ = Number(lane?.state?.occupancy ?? 0);

            return (
              <View
                key={`ctl-${lane.id}`}
                style={{
                  width: 140,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#f6f7f8",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={{ fontWeight: "700" }}>C{i + 1}</Text>
                <Text style={{ fontSize: 18 }}>
                  {occ} / {cap}
                </Text>

                <Pressable
                  onPress={() => onPlus(lane.id)}
                  style={{
                    width: "100%",
                    paddingVertical: 14,
                    borderRadius: 10,
                    backgroundColor: "#e6f0ff",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>+1</Text>
                </Pressable>

                <Pressable
                  onPress={() => onMinus(lane.id)}
                  style={{
                    width: "100%",
                    paddingVertical: 14,
                    borderRadius: 10,
                    backgroundColor: "#ffe9e6",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>−1</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
