import { useState } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const PasswordSetupScreen = ({ userLevel, onNavigate }: Props) => {
  const [passwords, setPasswords] = useState({
    operator: "11111",
    supervisor: "22222",
    manager: "33333",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <HMILayout
      title="Password Setup"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("main-menu")}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn hmi-btn-primary" onClick={handleSave}>Save</button>
          <button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>
        </div>
      }
    >
      <div className="space-y-6 max-w-sm mx-auto">
        {saved && (
          <div className="bg-hmi-green/10 border border-hmi-green/30 rounded-sm px-4 py-2 text-center">
            <span className="text-sm font-semibold" style={{ color: "hsl(var(--hmi-green))" }}>
              ✓ Passwords saved successfully
            </span>
          </div>
        )}
        {(["operator", "supervisor", "manager"] as const).map((level) => (
          <div key={level} className="space-y-2">
            <label className="text-sm font-semibold capitalize">{level} Password:</label>
            <input
              type="text"
              value={passwords[level]}
              onChange={(e) => setPasswords({ ...passwords, [level]: e.target.value })}
              maxLength={5}
              className="w-full bg-input border border-border rounded-sm px-4 py-3 font-mono text-lg text-center tracking-[0.3em] focus:outline-none focus:border-hmi-green"
              disabled={userLevel !== "Manager"}
            />
          </div>
        ))}
        {userLevel !== "Manager" && (
          <p className="text-xs text-destructive text-center">Only Manager can change passwords</p>
        )}
      </div>
    </HMILayout>
  );
};

export default PasswordSetupScreen;
