import { useState } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const TimeSettingScreen = ({ userLevel, onNavigate }: Props) => {
  const [settings, setSettings] = useState([
    { name: "Machine Runtime", set: 3600, actual: 0, unit: "Sec", min: 0, max: 32000 },
    { name: "Shaking Interval", set: 120, actual: 0, unit: "Sec", min: 30, max: 999 },
    { name: "Shaking Cycle", set: 5, actual: 0, unit: "No", min: 0, max: 15 },
    { name: "Purging Interval", set: 60, actual: 0, unit: "Sec", min: 0, max: 999 },
    { name: "Print Interval", set: 30, actual: 0, unit: "Sec", min: 15, max: 999 },
  ]);

  const updateSet = (index: number, value: number) => {
    setSettings((prev) =>
      prev.map((s, i) => (i === index ? { ...s, set: Math.min(s.max, Math.max(s.min, value)) } : s))
    );
  };

  return (
    <HMILayout
      title="Time Setting"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("process-operation")}
      onNavigateRight={() => onNavigate("pid")}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>
          <button className="hmi-btn" onClick={() => onNavigate("print-report")}>Print Report</button>
        </div>
      }
    >
      <table className="w-full hmi-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Set</th>
            <th>Actual</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((s, i) => (
            <tr key={s.name}>
              <td className="font-semibold">{s.name}</td>
              <td>
                <input
                  type="number"
                  value={s.set}
                  onChange={(e) => updateSet(i, Number(e.target.value))}
                  className="w-20 bg-input border border-border rounded-sm px-2 py-1 font-mono text-sm text-center"
                />
              </td>
              <td className="hmi-value">{s.actual}</td>
              <td className="text-muted-foreground">{s.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-3 bg-secondary/30 border border-border rounded-sm">
        <p className="text-xs text-muted-foreground">
          Machine Runtime: 0-32000 Sec | Shaking Interval: 30-999 Sec | Shaking Cycle: 0-15 | Purging Interval: 0-999 Sec | Print Interval: 15-999 Sec
        </p>
      </div>
    </HMILayout>
  );
};

export default TimeSettingScreen;
