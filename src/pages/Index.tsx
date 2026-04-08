import { useState } from "react";
import WelcomeScreen from "@/components/hmi/WelcomeScreen";
import MainMenuScreen from "@/components/hmi/MainMenuScreen";
import MachineOperationScreen from "@/components/hmi/MachineOperationScreen";
import ProcessOperationScreen from "@/components/hmi/ProcessOperationScreen";
import MaterialChargingScreen from "@/components/hmi/MaterialChargingScreen";
import TimeSettingScreen from "@/components/hmi/TimeSettingScreen";
import AlarmScreen from "@/components/hmi/AlarmScreen";
import PIDScreen from "@/components/hmi/PIDScreen";
import PrintReportScreen from "@/components/hmi/PrintReportScreen";
import InterlockScreen from "@/components/hmi/InterlockScreen";
import DeviceStatusScreen from "@/components/hmi/DeviceStatusScreen";
import PasswordSetupScreen from "@/components/hmi/PasswordSetupScreen";
import AutoCycleScreen from "@/components/hmi/AutoCycleScreen";

const Index = () => {
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState("main-menu");

  if (!userLevel) {
    return <WelcomeScreen onLogin={(level) => { setUserLevel(level); setCurrentScreen("main-menu"); }} />;
  }

  const nav = (screen: string) => setCurrentScreen(screen);
  const logout = () => { setUserLevel(null); setCurrentScreen("main-menu"); };

  const props = { userLevel, onNavigate: nav };

  return (
    <div className="min-h-screen p-4 flex items-start justify-center pt-8">
      <div className="w-full max-w-4xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold" style={{ color: "hsl(var(--hmi-green))" }}>elit®</span>
            <span className="text-xs text-muted-foreground">FLUID BED DRYER - 120 Kg (GMP Model)</span>
          </div>
          <span className="text-xs text-muted-foreground">CHAMUNDA — We care...</span>
        </div>

        {currentScreen === "main-menu" && <MainMenuScreen {...props} onLogout={logout} />}
        {currentScreen === "machine-operation" && <MachineOperationScreen {...props} />}
        {currentScreen === "process-operation" && <ProcessOperationScreen {...props} />}
        {currentScreen === "material-charging" && <MaterialChargingScreen {...props} />}
        {currentScreen === "time-setting" && <TimeSettingScreen {...props} />}
        {currentScreen === "alarm" && <AlarmScreen {...props} />}
        {currentScreen === "pid" && <PIDScreen {...props} />}
        {currentScreen === "print-report" && <PrintReportScreen {...props} />}
        {currentScreen === "interlock" && <InterlockScreen {...props} />}
        {currentScreen === "device-status" && <DeviceStatusScreen {...props} />}
        {currentScreen === "password-setup" && <PasswordSetupScreen {...props} />}
        {currentScreen === "auto-cycle" && <AutoCycleScreen {...props} />}
      </div>
    </div>
  );
};

export default Index;
