import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Scene3D } from "@/components/ui/Scene3D";
import { CycleMap } from "@/components/ui/CycleMap";
import { RiveLock } from "@/components/ui/RiveLock";
import { useCycleData } from "@/hooks/useCycleData";
import { Battery, MapPin, Activity, ShieldCheck, Zap } from "lucide-react";

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  const { cycles, loading } = useCycleData();
  const [locked, setLocked] = useState(true);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
      
      gsap.from(cardsRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.3
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const handleSimulateLock = () => {
    setLocked(!locked);
    // In reality this would trigger an API call to the ESP32 / Supabase to toggle status
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30">
      
      {/* Header section */}
      <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            NEXUS<span className="text-white">RIDE</span>
          </h1>
          <p className="text-zinc-400 mt-2 font-medium tracking-wide">Smart Fleet Management Dashboard</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 p-[2px]">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <span className="font-bold text-sm">US</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">User Profile</p>
            <p className="text-xs text-emerald-400 font-mono">RFID Validated</p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: 3D Scene + Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
              <Zap className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Activity size={20} className="text-emerald-400" /> Hardware Status
            </h2>
            <div className="flex justify-between items-center bg-black/40 rounded-xl p-4 border border-white/5">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">ESP32 Terminal</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                  <span className="font-mono text-sm text-emerald-400 tracking-tight">ONLINE</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">GPS Lock</p>
                <div className="flex items-center gap-2">
                   <span className="font-mono text-sm font-bold">12 Sats</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col items-center pb-4">
              <RiveLock isUnlocked={!locked} onClick={handleSimulateLock} />
              <p className="text-xs text-zinc-500 mt-4 text-center">Tap to simulate RFID card read</p>
            </div>
          </div>

          <div className="shrink-0 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <Scene3D />
          </div>
        </div>

        {/* Right Column: Tracking Map */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5 backdrop-blur-sm flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MapPin size={20} className="text-cyan-400" /> Live Tracking
              </h2>
              <div className="bg-white/5 rounded-full px-4 py-1 text-xs font-mono font-bold text-zinc-300 border border-white/10">
                {cycles.length} Active Cycles
              </div>
            </div>
            
            <div className="flex-1 w-full relative group">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              <div className="absolute inset-y-0 -left-px w-px bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"></div>
              <CycleMap cycles={cycles} />
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
               <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
                 <Battery className="text-amber-400 mb-2" size={24}/>
                 <p className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Fleet Battery</p>
                 <p className="text-xl font-black">92%</p>
               </div>
               <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
                 <ShieldCheck className="text-emerald-400 mb-2" size={24}/>
                 <p className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Geofence</p>
                 <p className="text-xl font-black">Secure</p>
               </div>
               <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
                 <MapPin className="text-cyan-400 mb-2" size={24}/>
                 <p className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Rides Today</p>
                 <p className="text-xl font-black">14</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
