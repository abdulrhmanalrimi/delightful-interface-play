import { useState, useEffect } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const MaterialChargingScreen = ({ userLevel, onNavigate }: Props) => {
  const [charging, setCharging] = useState(false);
  const [blowerSpeed, setBlowerSpeed] = useState(1200);

  const [actuals, setActuals] = useState({
    blowerSpeed: 0,
    inletTemp: 0,
    exhaustTemp: 0,
    bedTemp: 0,
    dpHepa: 0,
    velocity: 0,
    rh: 0,
    dewPoint: 0,
  });

  useEffect(() => {
    if (!charging) return;
    const interval = setInterval(() => {
      setActuals((prev) => ({
        blowerSpeed: prev.blowerSpeed + (blowerSpeed - prev.blowerSpeed) * 0.1 + (Math.random() - 0.5) * 10,
        inletTemp: prev.inletTemp + (55 - prev.inletTemp) * 0.03 + (Math.random() - 0.5),
        exhaustTemp: prev.exhaustTemp + (38 - prev.exhaustTemp) * 0.03 + (Math.random() - 0.5),
        bedTemp: prev.bedTemp + (35 - prev.bedTemp) * 0.03 + (Math.random() - 0.5),
        dpHepa: prev.dpHepa + (15 - prev.dpHepa) * 0.05 + (Math.random() - 0.5),
        velocity: prev.velocity + (3.5 - prev.velocity) * 0.05 + (Math.random() - 0.5) * 0.2,
        rh: prev.rh + (42 - prev.rh) * 0.03 + (Math.random() - 0.5),
        dewPoint: prev.dewPoint + (18 - prev.dewPoint) * 0.03 + (Math.random() - 0.5),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [charging, blowerSpeed]);

  const rows = [
    { label: "Blower Speed", set: blowerSpeed, actual: actuals.blowerSpeed, unit: "RPM" },
    { label: "Inlet Air Temp", set: "—", actual: actuals.inletTemp, unit: "°C" },
    { label: "Exhaust Air Temp", set: "—", actual: actuals.exhaustTemp, unit: "°C" },
    { label: "Bed Temp", set: "—", actual: actuals.bedTemp, unit: "°C" },
    { label: "DP Across HEPA", set: "—", actual: actuals.dpHepa, unit: "MMWC" },
    { label: "Inlet Air Velocity", set: "—", actual: actuals.velocity, unit: "M/S" },
    { label: "RH", set: "—", actual: actuals.rh, unit: "%" },
    { label: "Dew Point", set: "—", actual: actuals.dewPoint, unit: "%" },
  ];

  return (
    <HMILayout
      title="Material Charging"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("main-menu")}
      onNavigateRight={() => onNavigate("machine-operation")}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn" onClick={() => onNavigate("interlock")}>Interlock</button>
          <button
            className={`hmi-btn ${charging ? "hmi-btn-danger" : "hmi-btn-primary"}`}
            onClick={() => setCharging(!charging)}
          >
            {charging ? "⏹ STOP" : "▶ START"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-semibold">Blower Speed:</label>
          <input
            type="number"
            value={blowerSpeed}
            onChange={(e) => setBlowerSpeed(Number(e.target.value))}
            className="w-24 bg-input border border-border rounded-sm px-2 py-1 font-mono text-sm text-center"
            min={0}
            max={3000}
          />
          <span className="text-xs text-muted-foreground">RPM</span>
        </div>

        <table className="w-full hmi-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Set</th>
              <th>Actual</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="font-semibold">{r.label}</td>
                <td className="text-muted-foreground font-mono">{typeof r.set === "number" ? r.set : r.set}</td>
                <td className="hmi-value">{charging ? r.actual.toFixed(1) : "0.0"}</td>
                <td className="text-muted-foreground">{r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HMILayout>
  );
};

export default MaterialChargingScreen;
