import { useState } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const interlockItems = [
  { name: "Machine in Process Mode", status: true },
  { name: "Emergency Stop Released", status: true },
  { name: "System Air Pressure Healthy", status: true },
  { name: "Filter Bag Sealed", status: true },
  { name: "Product Container Sealed", status: false },
  { name: "Product Container Present", status: true },
  { name: "Blower Motor Healthy", status: true },
  { name: "AHU Door Closed", status: true },
  { name: "Inlet Damper OK", status: true },
  { name: "Exhaust Damper OK", status: true },
  { name: "Solid Flow not Detected", status: true },
  { name: "Explosion Vent Close", status: true },
  { name: "Filter Rail Locked", status: false },
  { name: "Inlet Damper Close", status: true },
  { name: "Material Weight Present", status: true },
  { name: "Charging Process On", status: false },
];

const InterlockScreen = ({ userLevel, onNavigate }: Props) => {
  const [items, setItems] = useState(interlockItems);

  const toggleItem = (index: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, status: !item.status } : item)));
  };

  return (
    <HMILayout
      title="Interlock Status"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("main-menu")}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn" onClick={() => onNavigate("alarm")}>Alarm</button>
          <button className="hmi-btn hmi-btn-amber">🔔 Hooter Reset</button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <button
            key={item.name}
            onClick={() => toggleItem(i)}
            className="flex items-center gap-3 bg-secondary/30 border border-border rounded-sm px-3 py-2 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className={`hmi-indicator ${item.status ? "hmi-indicator-on" : "hmi-indicator-alarm"}`} />
            <span className="text-sm">{item.name}</span>
          </button>
        ))}
      </div>
    </HMILayout>
  );
};

export default InterlockScreen;
