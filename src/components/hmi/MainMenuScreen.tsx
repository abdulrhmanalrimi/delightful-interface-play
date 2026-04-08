import HMILayout from "./HMILayout";

interface MainMenuScreenProps {
  userLevel: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { label: "Machine Operation", screen: "machine-operation", icon: "⚙️" },
  { label: "Process Operation", screen: "process-operation", icon: "▶️" },
  { label: "Material Charging", screen: "material-charging", icon: "📦" },
  { label: "Time Setting", screen: "time-setting", icon: "⏱️" },
  { label: "Auto Cycle", screen: "auto-cycle", icon: "🔄" },
  { label: "Alarm", screen: "alarm", icon: "🔔" },
  { label: "PID Control", screen: "pid", icon: "📊" },
  { label: "Print Report", screen: "print-report", icon: "🖨️" },
  { label: "Password Setup", screen: "password-setup", icon: "🔒" },
  { label: "Device Status", screen: "device-status", icon: "📡" },
];

const MainMenuScreen = ({ userLevel, onNavigate, onLogout }: MainMenuScreenProps) => {
  return (
    <HMILayout
      title="Main Menu"
      userLevel={userLevel}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn hmi-btn-amber" onClick={() => {}}>🔔 Hooter Reset</button>
          <button className="hmi-btn" onClick={() => {}}>💡 Machine Light</button>
          <button className="hmi-btn hmi-btn-danger" onClick={onLogout}>Logout</button>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {menuItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="hmi-btn flex flex-col items-center gap-2 py-6 text-center"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </HMILayout>
  );
};

export default MainMenuScreen;
