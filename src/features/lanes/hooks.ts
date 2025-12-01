import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";

/** ---- Tipos ---- */
export type TerminalRow = {
  id: string;
  name: string;
  code?: string | null;
};

export type LaneStateRow = {
  occupancy: number;
  updated_at: string | null;
};

export type LaneRow = {
  id: string;
  name: string;
  capacity: number;
  rect?: any;
  state?: LaneStateRow | null;
};

/** ---- Rol (admin) ---- */
export function useIsAdmin() {
  return useQuery({
    queryKey: ["me","role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false };
      const { data, error } = await supabase
        .from("app_users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();             // <- no rompe si no hay fila
      if (error) throw error;
      return { isAdmin: data?.role === "admin" };
    },
  });
}

/** ---- Terminal por nombre mostrado (e.g. "Manco Cápac") ---- */
export function useTerminal(terminalName: string) {
  return useQuery({
    enabled: !!terminalName,
    queryKey: ["terminal", terminalName],
    queryFn: async (): Promise<TerminalRow> => {
      const { data, error } = await supabase
        .from("terminals")
        .select("id, name, code")
        .eq("name", terminalName)
        .single();
      if (error) throw error;
      return data as TerminalRow;
    },
  });
}

/** ---- Lanes por terminal_id (con lane_state embebido) ---- */
export function useLanes(terminalId?: string) {
  return useQuery({
    enabled: !!terminalId,
    queryKey: ["lanes", terminalId],
    queryFn: async (): Promise<LaneRow[]> => {
      const { data, error } = await supabase
        .from("lanes")
        .select(
          "id, name, capacity, rect, state:lane_state(occupancy, updated_at)"
        )
        .eq("terminal_id", terminalId)
        .order("idx", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as LaneRow[];
    },
  });
}

/** ---- Realtime lane_state (con filtro por los lanes de ese terminal si los tenemos) ---- */
export function useLanesRealtime(terminalId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!terminalId) return;

    // intenta usar los ids actuales para filtrar el canal y reducir ruido
    const current = qc.getQueryData<LaneRow[]>(["lanes", terminalId]) ?? [];
    const laneIds = current.map((l) => l.id);

    const filter =
      laneIds.length > 0 ? `lane_id=in.(${laneIds.join(",")})` : undefined;

    const ch = supabase
      .channel(`lane_state:${terminalId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT/UPDATE/DELETE
          schema: "public",
          table: "lane_state",
          ...(filter ? { filter } : {}),
        },
        () => {
          // refresca la query de lanes de ese terminal
          qc.invalidateQueries({ queryKey: ["lanes", terminalId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [terminalId, qc]);
}

/** ---- Mutaciones (RPCs) ---- */
async function callOrFallback<TArgs extends object>(
  name: string,
  args: TArgs,
  fallback?: () => Promise<void>
) {
  const { error } = await supabase.rpc(name, args as any);
  if (error) {
    // si no existe ese RPC en tu DB, intenta fallback (por ej. inc_lane con delta)
    if (fallback) {
      await fallback();
      return;
    }
    throw error;
  }
}

export async function incLane(laneId: string) {
  // tu RPC principal
  await callOrFallback("inc_lane_if_not_full", { p_lane_id: laneId }, async () => {
    // fallback opcional si solo tienes `inc_lane(lane_id, delta)`
    await supabase.rpc("inc_lane", { p_lane_id: laneId, p_delta: 1 });
  });
}

export async function decLane(laneId: string) {
  await callOrFallback("dec_lane_if_not_empty", { p_lane_id: laneId }, async () => {
    await supabase.rpc("inc_lane", { p_lane_id: laneId, p_delta: -1 });
  });
}

export async function resetLane(laneId: string) {
  await callOrFallback("reset_lane", { p_lane_id: laneId });
}
