import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CycleData {
  id: string;
  mac_address: string;
  location_lat: number;
  location_lng: number;
  status: "available" | "in-use" | "maintenance";
  battery_percentage: number;
  last_ping: string;
}

export const useCycleData = () => {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchCycles = async () => {
      const { data, error } = await supabase.from("cycles").select("*");
      if (data) setCycles(data as CycleData[]);
      setLoading(false);
      
      if (error) console.error("Error fetching cycles", error);
    };

    fetchCycles();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("cycle_tracking")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cycles",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCycles((prev) => [...prev, payload.new as CycleData]);
          } else if (payload.eventType === "UPDATE") {
            setCycles((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as CycleData) : c))
            );
          } else if (payload.eventType === "DELETE") {
            setCycles((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { cycles, loading };
};
