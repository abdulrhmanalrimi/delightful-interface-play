import { useState } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const MachineOperationScreen = ({ userLevel, onNavigate }: Props) => {
  const [inletDamper, setInletDamper] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [bagLock, setBagLock] = useState(true);
  const [filterSeal, setFilterSeal] = useState(false);
  const [containerSeal, setContainerSeal] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgingInterval, setPurgingInterval] = useState(0);
  const [page, setPage] = useState(1);

  // Page 2 states
  const [exhaustDamper, setExhaustDamper] = useState(false);
  const [filterBagUp, setFilterBagUp] = useState(false);

  if (page === 2) {
    return (
      <HMILayout
        title="Machine Operation 2/2"
        userLevel={userLevel}
        onNavigateLeft={() => setPage(1)}
        onNavigateRight={() => onNavigate("process-operation")}
        bottomButtons={
          <div className="flex gap-2">
            <button className="hmi-btn" onClick={() => onNavigate("time-setting")}>Time Setting</button>
            <button className="hmi-btn" onClick={() => onNavigate("device-status")}>Device Status</button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Filter Bag */}
          <div className="bg-secondary/30 border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Filter Bag</span>
              <div className={`hmi-indicator ${filterBagUp ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
            </div>
            <div className="flex gap-2">
              <button className="hmi-btn hmi-btn-primary text-xs" onMouseDown={() => setFilterBagUp(true)} onMouseUp={() => setFilterBagUp(false)}>▲ Up</button>
              <button className="hmi-btn text-xs" onMouseDown={() => setFilterBagUp(false)}>▼ Down</button>
              <button className="hmi-btn text-xs" onClick={() => onNavigate("interlock")}>Interlock</button>
            </div>
          </div>

          {/* Exhaust Damper */}
          <div className="bg-secondary/30 border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Exhaust Damper</span>
              <div className={`hmi-indicator ${exhaustDamper ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
            </div>
            <div className="flex gap-2">
              <button className={`hmi-btn text-xs ${exhaustDamper ? "hmi-btn-primary" : ""}`} onClick={() => setExhaustDamper(!exhaustDamper)}>
                {exhaustDamper ? "Close" : "Open"}
              </button>
              <button className="hmi-btn text-xs" onClick={() => onNavigate("interlock")}>Interlock</button>
            </div>
          </div>

          {/* Steam Bypass */}
          <div className="bg-secondary/30 border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Steam Bypass Valve</span>
              <div className="hmi-indicator hmi-indicator-off" />
            </div>
            <div className="flex gap-2">
              <button className="hmi-btn text-xs">Open</button>
            </div>
          </div>
        </div>
      </HMILayout>
    );
  }

  return (
    <HMILayout
      title="Machine Operation 1/2"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("main-menu")}
      onNavigateRight={() => setPage(2)}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn" onClick={() => onNavigate("process-operation")}>Process Operation</button>
          <button className="hmi-btn" onClick={() => onNavigate("device-status")}>Device Status</button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Inlet Damper */}
        <div className="bg-secondary/30 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Inlet Damper</span>
            <div className={`hmi-indicator ${inletDamper ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
          </div>
          <div className="flex flex-col gap-2">
            <button className={`hmi-btn text-xs ${inletDamper ? "hmi-btn-primary" : ""}`} onClick={() => setInletDamper(!inletDamper)}>
              {inletDamper ? "Close" : "Open"}
            </button>
            <button className="hmi-btn text-xs" onClick={() => onNavigate("interlock")}>Interlock</button>
          </div>
        </div>

        {/* Shaking */}
        <div className="bg-secondary/30 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Shaking</span>
            <div className={`hmi-indicator ${shaking ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
          </div>
          <div className="flex flex-col gap-2">
            <button className={`hmi-btn text-xs ${shaking ? "hmi-btn-primary" : ""}`} onClick={() => setShaking(!shaking)}>
              {shaking ? "Off" : "On"}
            </button>
            <button className="hmi-btn text-xs" onClick={() => onNavigate("interlock")}>Interlock</button>
          </div>
        </div>

        {/* Bag Lock */}
        <div className="bg-secondary/30 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Bag Lock</span>
            <div className={`hmi-indicator ${bagLock ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
          </div>
          <div className="flex flex-col gap-2">
            <button className={`hmi-btn text-xs ${bagLock ? "hmi-btn-primary" : ""}`} onClick={() => setBagLock(!bagLock)}>
              {bagLock ? "Unlock" : "Lock"}
            </button>
          </div>
        </div>

        {/* Filter Seal */}
        <div className="bg-secondary/30 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Filter Seal</span>
            <div className={`hmi-indicator ${filterSeal ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
          </div>
          <div className="flex flex-col gap-2">
            <button className={`hmi-btn text-xs ${filterSeal ? "hmi-btn-primary" : ""}`} onClick={() => setFilterSeal(!filterSeal)}>
              {filterSeal ? "Unseal" : "Seal"}
            </button>
            <button className="hmi-btn text-xs" onClick={() => onNavigate("interlock")}>Interlock</button>
          </div>
        </div>

        {/* Container Seal */}
        <div className="bg-secondary/30 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Container Seal</span>
            <div className={`hmi-indicator ${containerSeal ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
          </div>
          <div className="flex flex-col gap-2">
            <button className={`hmi-btn text-xs ${containerSeal ? "hmi-btn-primary" : ""}`} onClick={() => setContainerSeal(!containerSeal)}>
              {containerSeal ? "Unseal" : "Seal"}
            </button>
            <button className="hmi-btn text-xs" onClick={() => onNavigate("interlock")}>Interlock</button>
          </div>
        </div>

        {/* Purging */}
        <div className="bg-secondary/30 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Purging</span>
            <div className={`hmi-indicator ${purging ? "hmi-indicator-on" : "hmi-indicator-off"}`} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={purgingInterval}
                onChange={(e) => setPurgingInterval(Number(e.target.value))}
                className="w-16 bg-input border border-border rounded-sm px-2 py-1 font-mono text-xs text-center"
                min={0}
                max={999}
              />
              <span className="text-xs text-muted-foreground">Sec</span>
            </div>
            <button className={`hmi-btn text-xs ${purging ? "hmi-btn-primary" : ""}`} onClick={() => setPurging(!purging)}>
              {purging ? "Off" : "On"}
            </button>
            <button className="hmi-btn text-xs" onClick={() => onNavigate("interlock")}>Interlock</button>
          </div>
        </div>
      </div>
    </HMILayout>
  );
};

export default MachineOperationScreen;
