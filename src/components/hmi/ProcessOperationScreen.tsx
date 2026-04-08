import { useState, useEffect } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

interface ProcessParam {
  name: string;
  set: number;
  actual: number;
  unit: string;
  min: number;
  max: number;
}

const ProcessOperationScreen = ({ userLevel, onNavigate }: Props) => {
  const [page, setPage] = useState(1);
  const [processRunning, setProcessRunning] = useState(false);

  const [params, setParams] = useState<ProcessParam[]>([
    { name: "Blower RPM", set: 1500, actual: 0, unit: "RPM", min: 300, max: 3000 },
    { name: "Inlet Temperature", set: 60, actual: 0, unit: "°C", min: 0, max: 85 },
    { name: "Exhaust Temperature", set: 45, actual: 0, unit: "°C", min: 0, max: 85 },
    { name: "Bed Temperature", set: 40, actual: 0, unit: "°C", min: 0, max: 85 },
    { name: "DP Across HEPA", set: 0, actual: 0, unit: "MMWC", min: 0, max: 100 },
    { name: "Inlet Air Velocity", set: 0, actual: 0, unit: "M/S", min: 0, max: 10 },
  ]);

  const [rhSet, setRhSet] = useState(45);
  const [rhActual, setRhActual] = useState(0);
  const [blowerCurrent, setBlowerCurrent] = useState(0);

  useEffect(() => {
    if (!processRunning) return;
    const interval = setInterval(() => {
      setParams((prev) =>
        prev.map((p) => ({
          ...p,
          actual: p.actual + (p.set - p.actual) * 0.05 + (Math.random() - 0.5) * 2,
        }))
      );
      setRhActual((prev) => prev + (rhSet - prev) * 0.05 + (Math.random() - 0.5));
      setBlowerCurrent(12.5 + (Math.random() - 0.5) * 2);
    }, 1000);
    return () => clearInterval(interval);
  }, [processRunning, rhSet]);

  const updateSet = (index: number, value: number) => {
    setParams((prev) => prev.map((p, i) => (i === index ? { ...p, set: Math.min(p.max, Math.max(p.min, value)) } : p)));
  };

  if (page === 2) {
    return (
      <HMILayout
        title="Process Operation 2/2"
        userLevel={userLevel}
        onNavigateLeft={() => setPage(1)}
        onNavigateRight={() => onNavigate("time-setting")}
        bottomButtons={
          <div className="flex gap-2">
            <button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>
            <button className="hmi-btn" onClick={() => onNavigate("time-setting")}>Time Setting</button>
          </div>
        }
      >
        <div className="space-y-4">
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
              <tr>
                <td className="font-semibold">Inlet Air RH</td>
                <td>
                  <input type="number" value={rhSet} onChange={(e) => setRhSet(Number(e.target.value))}
                    className="w-16 bg-input border border-border rounded-sm px-2 py-1 font-mono text-sm text-center" />
                </td>
                <td className="hmi-value">{rhActual.toFixed(1)}</td>
                <td className="text-muted-foreground">%</td>
              </tr>
              <tr>
                <td className="font-semibold">Blower Current</td>
                <td className="text-muted-foreground">—</td>
                <td className="hmi-value">{processRunning ? blowerCurrent.toFixed(2) : "0.00"}</td>
                <td className="text-muted-foreground">Amp.</td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Process On/Off</p>
              <button
                className={`hmi-btn text-lg px-8 py-3 ${processRunning ? "hmi-btn-danger" : "hmi-btn-primary"}`}
                onClick={() => setProcessRunning(!processRunning)}
              >
                {processRunning ? "⏹ STOP" : "▶ START"}
              </button>
            </div>
            <button className="hmi-btn" onClick={() => onNavigate("interlock")}>Interlock</button>
          </div>
        </div>
      </HMILayout>
    );
  }

  return (
    <HMILayout
      title="Process Operation 1/2"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("machine-operation")}
      onNavigateRight={() => setPage(2)}
      bottomButtons={
        <button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>
      }
    >
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
          {params.map((p, i) => (
            <tr key={p.name}>
              <td className="font-semibold">{p.name}</td>
              <td>
                <input
                  type="number"
                  value={p.set}
                  onChange={(e) => updateSet(i, Number(e.target.value))}
                  className="w-20 bg-input border border-border rounded-sm px-2 py-1 font-mono text-sm text-center"
                />
              </td>
              <td className="hmi-value">{processRunning ? p.actual.toFixed(1) : "0.0"}</td>
              <td className="text-muted-foreground">{p.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </HMILayout>
  );
};

export default ProcessOperationScreen;
