import { useState } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const sampleAlarms = [
  { time: "9:45:47 AM", date: "04/08/2026", status: "C", text: "System started successfully." },
  { time: "9:45:48 AM", date: "04/08/2026", status: "C", text: "Password list import successfully." },
  { time: "9:46:10 AM", date: "04/08/2026", status: "A", text: "Emergency Stop Released" },
  { time: "9:47:22 AM", date: "04/08/2026", status: "A", text: "System Air Pressure Low" },
  { time: "9:48:05 AM", date: "04/08/2026", status: "C", text: "Filter Bag Sealed" },
  { time: "9:50:12 AM", date: "04/08/2026", status: "A", text: "Bed Temperature High" },
];

const AlarmScreen = ({ userLevel, onNavigate }: Props) => {
  const [alarms, setAlarms] = useState(sampleAlarms);

  const acknowledgeAll = () => {
    setAlarms((prev) => prev.map((a) => ({ ...a, status: "C" })));
  };

  return (
    <HMILayout
      title="Alarm"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("main-menu")}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn hmi-btn-amber" onClick={acknowledgeAll}>ACK All</button>
          <button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full hmi-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Date</th>
              <th>Status</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm, i) => (
              <tr key={i} className={alarm.status === "A" ? "bg-destructive/10" : ""}>
                <td className="font-mono text-sm">{alarm.time}</td>
                <td className="font-mono text-sm">{alarm.date}</td>
                <td>
                  <span className={`inline-flex items-center gap-1`}>
                    <div className={`hmi-indicator ${alarm.status === "A" ? "hmi-indicator-alarm" : "hmi-indicator-on"}`} />
                    <span className="text-xs">{alarm.status === "A" ? "Active" : "Cleared"}</span>
                  </span>
                </td>
                <td className="text-sm">{alarm.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HMILayout>
  );
};

export default AlarmScreen;
