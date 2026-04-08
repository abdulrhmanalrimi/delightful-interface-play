import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const devices = [
  { name: "Blower Motor", status: "OFF", healthy: true },
  { name: "Inlet Damper", status: "CLOSED", healthy: true },
  { name: "Exhaust Damper", status: "CLOSED", healthy: true },
  { name: "Filter Shaking", status: "OFF", healthy: true },
  { name: "Filter Bag Seal", status: "SEALED", healthy: true },
  { name: "Container Seal", status: "UNSEALED", healthy: false },
  { name: "Bag Lock", status: "LOCKED", healthy: true },
  { name: "Purging Valve", status: "CLOSED", healthy: true },
  { name: "Steam Valve", status: "CLOSED", healthy: true },
  { name: "Heater", status: "OFF", healthy: true },
];

const DeviceStatusScreen = ({ userLevel, onNavigate }: Props) => {
  return (
    <HMILayout
      title="Device Status"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("main-menu")}
      bottomButtons={<button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>}
    >
      <table className="w-full hmi-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Status</th>
            <th>Health</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.name}>
              <td className="font-semibold">{d.name}</td>
              <td className="font-mono text-sm">{d.status}</td>
              <td>
                <div className="flex items-center gap-2">
                  <div className={`hmi-indicator ${d.healthy ? "hmi-indicator-on" : "hmi-indicator-alarm"}`} />
                  <span className="text-xs">{d.healthy ? "OK" : "FAULT"}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </HMILayout>
  );
};

export default DeviceStatusScreen;
