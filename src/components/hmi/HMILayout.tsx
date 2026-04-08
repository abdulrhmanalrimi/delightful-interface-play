import { useState, useEffect } from "react";

interface HMILayoutProps {
  title: string;
  userLevel: string;
  children: React.ReactNode;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  bottomButtons?: React.ReactNode;
}

const HMILayout = ({ title, userLevel, children, onNavigateLeft, onNavigateRight, bottomButtons }: HMILayoutProps) => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dateStr = dateTime.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const timeStr = dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="hmi-screen w-full max-w-4xl mx-auto relative overflow-hidden">
      <div className="scanline z-10" />
      {/* Header */}
      <div className="hmi-header flex items-center justify-between">
        <span className="font-mono text-sm text-muted-foreground">{dateStr}</span>
        <span className="text-sm font-semibold text-accent">{userLevel}</span>
        <span className="font-mono text-sm text-muted-foreground">{timeStr}</span>
      </div>

      {/* Title */}
      <div className="bg-secondary/50 px-4 py-2 border-b border-border">
        <h2 className="text-lg font-bold tracking-wide text-center" style={{ color: "hsl(var(--hmi-green))" }}>
          {title}
        </h2>
      </div>

      {/* Content */}
      <div className="p-4 min-h-[400px]">
        {children}
      </div>

      {/* Bottom navigation */}
      <div className="hmi-header flex items-center justify-between gap-2 flex-wrap">
        <button className="hmi-btn" onClick={onNavigateLeft} disabled={!onNavigateLeft}>
          ◀ Back
        </button>
        <div className="flex gap-2 flex-wrap justify-center">
          {bottomButtons}
        </div>
        <button className="hmi-btn" onClick={onNavigateRight} disabled={!onNavigateRight}>
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default HMILayout;
