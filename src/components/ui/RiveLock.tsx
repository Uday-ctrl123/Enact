import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect, useState } from "react";

export function RiveLock({ isUnlocked = false, onClick }: { isUnlocked?: boolean; onClick?: () => void }) {
  // Using a community lock animation or just standard Rive
  // Since we don't have a specific .riv file, we will render a stylish fallback 
  // or a placeholder if the .riv file is missing in public dir.
  
  // As a real implementation we would load a custom lock from public/lock.riv
  // For the moment we'll simulate the look and feel
  
  return (
    <button 
      onClick={onClick}
      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
        isUnlocked 
          ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
          : "bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
      } border border-white/10 hover:scale-105 active:scale-95`}
    >
      <div className="flex flex-col items-center">
        {isUnlocked ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        )}
        <span className="text-xs font-bold mt-2 uppercase tracking-widest">{isUnlocked ? "Unlocked" : "Locked"}</span>
      </div>
    </button>
  );
}
