import { useState, useEffect } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const PIDScreen = ({ userLevel, onNavigate }: Props) => {
  const [tempSelection, setTempSelection] = useState<"INLET" | "BED">("INLET");
  const [pidRunning, setPidRunning] = useState(false);
  const [manualOutput, setManualOutput] = useState(0);
  const [gain, setGain] = useState(2.5);
  const [iTime, setITime] = useState(1.2);
  const [dTime, setDTime] = useState(0.3);

  const [inletSet, setInletSet] = useState(60);
  const [bedSet, setBedSet] = useState(40);

  const [actuals, setActuals] = useState({ inlet: 0, exhaust: 0, bed: 0, velocity: 0 });

  useEffect(() => {
    if (!pidRunning) return;
    const interval = setInterval(() => {
      setActuals((prev) => ({
        inlet: prev.inlet + (inletSet - prev.inlet) * 0.04 + (Math.random() - 0.5),
        exhaust: prev.exhaust + (45 - prev.exhaust) * 0.03 + (Math.random() - 0.5),
        bed: prev.bed + (bedSet - prev.bed) * 0.04 + (Math.random() - 0.5),
        velocity: prev.velocity + (3.2 - prev.velocity) * 0.05 + (Math.random() - 0.5) * 0.2,
      }));
      setManualOutput((prev) => Math.min(100, Math.max(0, prev + (Math.random() - 0.3) * 5)));
    }, 1000);
    return () => clearInterval(interval);
  }, [pidRunning, inletSet, bedSet]);

  return (
    <HMILayout
      title="PID Control"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("time-setting")}
      onNavigateRight={() => onNavigate("print-report")}
      bottomButtons={<button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>}
    >
      <div className="space-y-4">
        {/* Temp selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Temp Selection:</span>
          <div className="flex gap-2">
            <button
              className={`hmi-btn text-xs ${tempSelection === "INLET" ? "hmi-btn-primary" : ""}`}
              onClick={() => setTempSelection("INLET")}
            >
              INLET TEMP
            </button>
            <button
              className={`hmi-btn text-xs ${tempSelection === "BED" ? "hmi-btn-primary" : ""}`}
              onClick={() => setTempSelection("BED")}
            >
              BED TEMP
            </button>
          </div>
          <button
            className={`hmi-btn ${pidRunning ? "hmi-btn-danger" : "hmi-btn-primary"}`}
            onClick={() => setPidRunning(!pidRunning)}
          >
            {pidRunning ? "Stop" : "Start"}
          </button>
          <span className="hmi-value text-sm">{manualOutput.toFixed(1)} %</span>
        </div>

        {/* Parameters */}
        <table className="w-full hmi-table">
          <thead>
            <tr><th>Parameter</th><th>Set</th><th>Actual</th><th>Unit</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold">Inlet Air Temp</td>
              <td>
                <input type="number" value={inletSet} onChange={(e) => setInletSet(Number(e.target.value))}
                  className="w-16 bg-input border border-border rounded-sm px-2 py-1 font-mono text-sm text-center" />
              </td>
              <td className="hmi-value">{pidRunning ? actuals.inlet.toFixed(1) : "0.0"}</td>
              <td className="text-muted-foreground">°C</td>
            </tr>
            <tr>
              <td className="font-semibold">Exhaust Air Temp</td>
              <td className="text-muted-foreground">—</td>
              <td className="hmi-value">{pidRunning ? actuals.exhaust.toFixed(1) : "0.0"}</td>
              <td className="text-muted-foreground">°C</td>
            </tr>
            <tr>
              <td className="font-semibold">Bed Temp</td>
              <td>
                <input type="number" value={bedSet} onChange={(e) => setBedSet(Number(e.target.value))}
                  className="w-16 bg-input border border-border rounded-sm px-2 py-1 font-mono text-sm text-center" />
              </td>
              <td className="hmi-value">{pidRunning ? actuals.bed.toFixed(1) : "0.0"}</td>
              <td className="text-muted-foreground">°C</td>
            </tr>
            <tr>
              <td className="font-semibold">Inlet Air Velocity</td>
              <td className="text-muted-foreground">—</td>
              <td className="hmi-value">{pidRunning ? actuals.velocity.toFixed(1) : "0.0"}</td>
              <td className="text-muted-foreground">M/S</td>
            </tr>
          </tbody>
        </table>

        {/* PID Values */}
        <div className="flex gap-4 p-3 bg-secondary/30 border border-border rounded-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">GAIN:</span>
            <input type="number" step="0.01" value={gain} onChange={(e) => setGain(Number(e.target.value))}
              className="w-16 bg-input border border-border rounded-sm px-2 py-1 font-mono text-xs text-center" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">I TIME:</span>
            <input type="number" step="0.01" value={iTime} onChange={(e) => setITime(Number(e.target.value))}
              className="w-16 bg-input border border-border rounded-sm px-2 py-1 font-mono text-xs text-center" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">D TIME:</span>
            <input type="number" step="0.01" value={dTime} onChange={(e) => setDTime(Number(e.target.value))}
              className="w-16 bg-input border border-border rounded-sm px-2 py-1 font-mono text-xs text-center" />
          </div>
        </div>
      </div>
    </HMILayout>
  );
};

export default PIDScreen;
