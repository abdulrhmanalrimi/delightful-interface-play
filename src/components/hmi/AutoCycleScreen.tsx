import { useState, useEffect, useRef } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const cycleSteps = [
  { name: "Hot Water", relay: [true, false, false, false, false], duration: 30 },
  { name: "Hot + Dosing", relay: [true, false, true, false, false], duration: 20 },
  { name: "Hot Water", relay: [true, false, false, false, false], duration: 30 },
  { name: "Hot + Dosing", relay: [true, false, true, false, false], duration: 20 },
  { name: "Cold Water", relay: [false, true, false, false, false], duration: 25 },
  { name: "DM Water", relay: [false, false, true, false, false], duration: 15 },
];

const AutoCycleScreen = ({ userLevel, onNavigate }: Props) => {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cycleSteps[0].duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCurrentStep((step) => {
            const next = step + 1;
            if (next >= cycleSteps.length) {
              setRunning(false);
              return 0;
            }
            setTimeLeft(cycleSteps[next].duration);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleToggle = () => {
    if (!running) {
      setCurrentStep(0);
      setTimeLeft(cycleSteps[0].duration);
    }
    setRunning(!running);
  };

  return (
    <HMILayout
      title="Auto Cycle (WIP Sequence)"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("main-menu")}
      bottomButtons={
        <div className="flex gap-2">
          <button className={`hmi-btn ${running ? "hmi-btn-danger" : "hmi-btn-primary"}`} onClick={handleToggle}>
            {running ? "⏹ STOP" : "▶ START"}
          </button>
          <button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Status */}
        <div className="text-center p-3 bg-secondary/30 border border-border rounded-sm">
          <p className="text-sm text-muted-foreground">
            {running ? `Running: ${cycleSteps[currentStep].name} — ${timeLeft}s remaining` : "Sequence Stop, End of Sequence"}
          </p>
        </div>

        {/* Steps */}
        <table className="w-full hmi-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Cycle</th>
              <th>Duration</th>
              <th>R1</th>
              <th>R2</th>
              <th>R3</th>
              <th>R4</th>
              <th>R5</th>
            </tr>
          </thead>
          <tbody>
            {cycleSteps.map((step, i) => (
              <tr key={i} className={running && i === currentStep ? "bg-hmi-green/10" : ""}>
                <td className="font-mono text-sm">{i + 1}</td>
                <td className="font-semibold">{step.name}</td>
                <td className="font-mono text-sm">{step.duration}s</td>
                {step.relay.map((r, j) => (
                  <td key={j}>
                    <div className={`hmi-indicator mx-auto ${running && i === currentStep && r ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HMILayout>
  );
};

export default AutoCycleScreen;
