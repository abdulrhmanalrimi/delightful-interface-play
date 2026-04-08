import { useState, useEffect, useRef } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

interface CycleStep {
  name: string;
  relay: boolean[];
  duration: number;
}

interface Recipe {
  id: string;
  name: string;
  steps: CycleStep[];
  createdBy: string;
  createdAt: string;
}

const defaultSteps: CycleStep[] = [
  { name: "Pre-Mixing / Drying", relay: [true, true, true, false, false], duration: 60 },
  { name: "Shaking Cycle", relay: [false, false, false, true, true], duration: 20 },
  { name: "Cooling Cycle", relay: [true, true, false, false, false], duration: 45 },
];

const cycleOptions = [
  "Pre-Mixing / Drying", "Shaking Cycle", "Cooling Cycle",
  "Hot Water", "Cold Water", "DM Water", "Rinse", "Drain",
];

const initialRecipes: Recipe[] = [
  { id: "R001", name: "Standard Drying", steps: defaultSteps, createdBy: "Manager", createdAt: "01/01/25" },
  {
    id: "R002", name: "Quick Cycle", createdBy: "Supervisor", createdAt: "15/02/25",
    steps: [
      { name: "Pre-Mixing / Drying", relay: [true, true, true, false, false], duration: 30 },
      { name: "Cooling Cycle", relay: [true, true, false, false, false], duration: 20 },
    ],
  },
];

type CycleState = "stopped" | "running" | "halted";
type ViewMode = "main" | "recipes" | "edit-recipe" | "recall-list" | "delete-list";

const AutoCycleScreen = ({ userLevel, onNavigate }: Props) => {
  // ─── Cycle State ───
  const [cycleState, setCycleState] = useState<CycleState>("stopped");
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleSteps, setCycleSteps] = useState<CycleStep[]>(defaultSteps);
  const [timeLeft, setTimeLeft] = useState(defaultSteps[0].duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Controls ───
  const [steamBypassOpen, setSteamBypassOpen] = useState(false);
  const [blowerCurrent, setBlowerCurrent] = useState(0.0);

  // ─── Recipe State ───
  const [viewMode, setViewMode] = useState<ViewMode>("main");
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [activeRecipe, setActiveRecipe] = useState<string>("R001");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ─── Cycle Timer ───
  useEffect(() => {
    if (cycleState !== "running") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCurrentStep((step) => {
            const next = step + 1;
            if (next >= cycleSteps.length) {
              setCycleState("stopped");
              setBlowerCurrent(0);
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
  }, [cycleState, cycleSteps]);

  // Simulate blower current when running
  useEffect(() => {
    if (cycleState === "running") {
      const id = setInterval(() => {
        setBlowerCurrent(+(3.5 + Math.random() * 1.5).toFixed(2));
      }, 2000);
      return () => clearInterval(id);
    } else if (cycleState === "stopped") {
      setBlowerCurrent(0);
    }
  }, [cycleState]);

  const handleStart = () => {
    if (cycleState === "stopped") {
      setCurrentStep(0);
      setTimeLeft(cycleSteps[0].duration);
    }
    // Resume from halt or start fresh
    setCycleState("running");
  };

  const handleHalt = () => {
    if (cycleState === "running") setCycleState("halted");
  };

  const handleReset = () => {
    setCycleState("stopped");
    setCurrentStep(0);
    setTimeLeft(cycleSteps[0].duration);
    setBlowerCurrent(0);
  };

  // ─── Recipe handlers ───
  const handleRecall = (recipe: Recipe) => {
    setCycleSteps(recipe.steps);
    setActiveRecipe(recipe.id);
    setTimeLeft(recipe.steps[0].duration);
    setCurrentStep(0);
    setCycleState("stopped");
    setViewMode("main");
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      if (activeRecipe === id) setActiveRecipe("");
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const handleStartNewRecipe = () => {
    const newId = `R${String(recipes.length + 1).padStart(3, "0")}`;
    setEditingRecipe({
      id: newId, name: "", createdBy: userLevel,
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
      steps: [{ name: "Pre-Mixing / Drying", relay: [true, false, false, false, false], duration: 30 }],
    });
    setNewRecipeName("");
    setViewMode("edit-recipe");
  };

  const handleEditExisting = (recipe: Recipe) => {
    setEditingRecipe({ ...recipe, steps: recipe.steps.map((s) => ({ ...s, relay: [...s.relay] })) });
    setNewRecipeName(recipe.name);
    setViewMode("edit-recipe");
  };

  const handleSaveRecipe = () => {
    if (!editingRecipe || !newRecipeName.trim()) return;
    const saved: Recipe = { ...editingRecipe, name: newRecipeName.trim() };
    setRecipes((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = saved; return u; }
      return [...prev, saved];
    });
    setViewMode("main");
    setEditingRecipe(null);
  };

  const updateStep = (index: number, field: string, value: any) => {
    if (!editingRecipe) return;
    const steps = [...editingRecipe.steps];
    if (field === "name") steps[index] = { ...steps[index], name: value };
    else if (field === "duration") steps[index] = { ...steps[index], duration: Math.max(1, Number(value)) };
    else if (field.startsWith("relay-")) {
      const ri = Number(field.split("-")[1]);
      const relay = [...steps[index].relay];
      relay[ri] = !relay[ri];
      steps[index] = { ...steps[index], relay };
    }
    setEditingRecipe({ ...editingRecipe, steps });
  };

  const addStep = () => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      steps: [...editingRecipe.steps, { name: "Pre-Mixing / Drying", relay: [false, false, false, false, false], duration: 15 }],
    });
  };

  const removeStep = (index: number) => {
    if (!editingRecipe || editingRecipe.steps.length <= 1) return;
    setEditingRecipe({ ...editingRecipe, steps: editingRecipe.steps.filter((_, i) => i !== index) });
  };

  // ═══════════════════════════════════════
  // EDIT RECIPE VIEW
  // ═══════════════════════════════════════
  if (viewMode === "edit-recipe" && editingRecipe) {
    return (
      <HMILayout title={`Recipe Editor — ${editingRecipe.id}`} userLevel={userLevel}
        onNavigateLeft={() => setViewMode("main")}
        bottomButtons={
          <div className="flex gap-2">
            <button className="hmi-btn hmi-btn-primary" onClick={handleSaveRecipe} disabled={!newRecipeName.trim()}>💾 Save</button>
            <button className="hmi-btn" onClick={() => setViewMode("main")}>Cancel</button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 bg-secondary/30 border border-border rounded-sm">
            <span className="text-xs text-muted-foreground w-24">Recipe Name:</span>
            <input className="flex-1 bg-background border border-border rounded-sm px-2 py-1 text-sm font-semibold text-foreground focus:outline-none focus:border-accent" value={newRecipeName} onChange={(e) => setNewRecipeName(e.target.value)} placeholder="Enter recipe name..." />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full hmi-table text-xs">
              <thead><tr><th className="w-8">#</th><th>Cycle</th><th className="w-16">Sec</th><th className="w-8">R1</th><th className="w-8">R2</th><th className="w-8">R3</th><th className="w-8">R4</th><th className="w-8">R5</th><th className="w-8">✕</th></tr></thead>
              <tbody>
                {editingRecipe.steps.map((step, i) => (
                  <tr key={i}>
                    <td className="font-mono">{i + 1}</td>
                    <td>
                      <select className="w-full bg-background border border-border rounded-sm px-1 py-0.5 text-xs text-foreground" value={step.name} onChange={(e) => updateStep(i, "name", e.target.value)}>
                        {cycleOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td><input type="number" className="w-full bg-background border border-border rounded-sm px-1 py-0.5 text-xs text-center font-mono text-foreground" value={step.duration} onChange={(e) => updateStep(i, "duration", e.target.value)} min={1} /></td>
                    {step.relay.map((r, j) => (
                      <td key={j}><button className={`w-5 h-5 rounded-sm border mx-auto block ${r ? "bg-hmi-green border-hmi-green" : "bg-secondary border-border"}`} onClick={() => updateStep(i, `relay-${j}`, null)} /></td>
                    ))}
                    <td><button className="text-destructive hover:text-destructive/80 text-sm font-bold" onClick={() => removeStep(i)} disabled={editingRecipe.steps.length <= 1}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="hmi-btn text-xs w-full" onClick={addStep}>+ Add Step</button>
        </div>
      </HMILayout>
    );
  }

  // ═══════════════════════════════════════
  // RECALL LIST VIEW
  // ═══════════════════════════════════════
  if (viewMode === "recall-list") {
    return (
      <HMILayout title="Recall Recipe" userLevel={userLevel}
        onNavigateLeft={() => setViewMode("main")}
        bottomButtons={<button className="hmi-btn" onClick={() => setViewMode("main")}>Back</button>}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center p-2 bg-secondary/30 border border-border rounded-sm">
            Select a recipe to load into Auto Cycle
          </p>
          {recipes.map((recipe) => (
            <button key={recipe.id} onClick={() => handleRecall(recipe)}
              className={`w-full flex items-center justify-between p-3 border rounded-sm text-left transition-colors ${recipe.id === activeRecipe ? "border-accent bg-hmi-green/10" : "border-border bg-secondary/20 hover:bg-secondary/40"}`}
            >
              <div>
                <span className="font-mono text-xs text-muted-foreground mr-2">{recipe.id}</span>
                <span className="font-semibold text-sm text-foreground">{recipe.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {recipe.steps.length} steps · {recipe.createdBy} · {recipe.createdAt}
              </div>
            </button>
          ))}
          {recipes.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No saved recipes</p>}
        </div>
      </HMILayout>
    );
  }

  // ═══════════════════════════════════════
  // DELETE LIST VIEW
  // ═══════════════════════════════════════
  if (viewMode === "delete-list") {
    return (
      <HMILayout title="Delete Recipe" userLevel={userLevel}
        onNavigateLeft={() => setViewMode("main")}
        bottomButtons={<button className="hmi-btn" onClick={() => { setConfirmDelete(null); setViewMode("main"); }}>Back</button>}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center p-2 bg-secondary/30 border border-border rounded-sm">
            Select a recipe to delete. Press again to confirm.
          </p>
          {recipes.map((recipe) => (
            <div key={recipe.id} className="flex items-center justify-between p-3 border border-border rounded-sm bg-secondary/20">
              <div>
                <span className="font-mono text-xs text-muted-foreground mr-2">{recipe.id}</span>
                <span className="font-semibold text-sm text-foreground">{recipe.name}</span>
                <span className="text-xs text-muted-foreground ml-2">({recipe.steps.length} steps)</span>
              </div>
              <button
                className={`hmi-btn text-xs px-3 py-1 ${confirmDelete === recipe.id ? "hmi-btn-danger" : ""}`}
                onClick={() => handleDelete(recipe.id)}
              >
                {confirmDelete === recipe.id ? "Press OK to Confirm" : "🗑 Delete"}
              </button>
            </div>
          ))}
          {recipes.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No saved recipes</p>}
        </div>
      </HMILayout>
    );
  }

  // ═══════════════════════════════════════
  // RECIPES MANAGEMENT VIEW
  // ═══════════════════════════════════════
  if (viewMode === "recipes") {
    return (
      <HMILayout title="Recipe Management" userLevel={userLevel}
        onNavigateLeft={() => setViewMode("main")}
        bottomButtons={
          <div className="flex gap-2">
            <button className="hmi-btn hmi-btn-primary" onClick={handleStartNewRecipe}>+ New Recipe</button>
            <button className="hmi-btn" onClick={() => setViewMode("main")}>Back</button>
          </div>
        }
      >
        <div className="space-y-2">
          <div className="text-center p-2 bg-secondary/30 border border-border rounded-sm">
            <p className="text-xs text-muted-foreground">
              Active: <span className="text-accent font-semibold">{recipes.find((r) => r.id === activeRecipe)?.name || "None"}</span>
            </p>
          </div>
          <table className="w-full hmi-table text-xs">
            <thead><tr><th>ID</th><th>Name</th><th>Steps</th><th>By</th><th>Date</th><th>Edit</th></tr></thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className={recipe.id === activeRecipe ? "bg-hmi-green/10" : ""}>
                  <td className="font-mono">{recipe.id}</td>
                  <td className="font-semibold">{recipe.name}</td>
                  <td className="font-mono">{recipe.steps.length}</td>
                  <td className="text-muted-foreground">{recipe.createdBy}</td>
                  <td className="font-mono text-muted-foreground">{recipe.createdAt}</td>
                  <td><button className="hmi-btn text-[10px] px-2 py-0.5" onClick={() => handleEditExisting(recipe)}>✏️ Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HMILayout>
    );
  }

  // ═══════════════════════════════════════
  // MAIN AUTO CYCLE VIEW (matches catalog)
  // ═══════════════════════════════════════
  const activeRecipeName = recipes.find((r) => r.id === activeRecipe)?.name || "—";
  const isRunning = cycleState === "running";
  const isHalted = cycleState === "halted";
  const isStopped = cycleState === "stopped";

  return (
    <HMILayout title="Auto Cycle" userLevel={userLevel}
      onNavigateLeft={() => onNavigate("pid")}
      onNavigateRight={() => onNavigate("process-operation")}
      bottomButtons={
        <div className="flex gap-2">
          <button className="hmi-btn" onClick={() => onNavigate("machine-operation")}>Mode Operation</button>
          <button className="hmi-btn" onClick={() => onNavigate("device-status")}>Device Status</button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Row 1: Start / Halt / Reset */}
        <div className="flex items-center gap-3 justify-center">
          <button
            className={`hmi-btn hmi-btn-primary flex-1 max-w-[140px] py-2 text-sm font-bold ${isRunning ? "opacity-50" : ""}`}
            onClick={handleStart}
            disabled={isRunning}
          >
            ▶ Start
          </button>
          <button
            className={`hmi-btn flex-1 max-w-[140px] py-2 text-sm font-bold ${!isRunning ? "opacity-50" : ""}`}
            style={isRunning ? { background: "hsl(var(--hmi-amber))", color: "#000" } : {}}
            onClick={handleHalt}
            disabled={!isRunning}
          >
            ⏸ Halt
          </button>
          <button
            className={`hmi-btn flex-1 max-w-[140px] py-2 text-sm font-bold ${!(isRunning || isHalted) ? "opacity-50" : ""}`}
            onClick={handleReset}
            disabled={isStopped}
          >
            ↺ Reset
          </button>
        </div>

        {/* Row 2: Interlock + PID */}
        <div className="flex items-center justify-end gap-3">
          <button className="hmi-btn text-xs px-4 py-1.5" onClick={() => onNavigate("interlock")}>
            Interlock
          </button>
          <button className="hmi-btn hmi-btn-primary text-xs px-4 py-1.5" onClick={() => onNavigate("pid")}>
            PID
          </button>
        </div>

        {/* Row 3: Steam Bypass Valve */}
        <div className="flex items-center gap-4 p-3 bg-secondary/30 border border-border rounded-sm">
          <span className="text-sm font-semibold text-foreground w-36">Steam Bypass Valve</span>
          <button
            className={`hmi-btn text-xs px-4 py-1 ${steamBypassOpen ? "hmi-btn-primary" : ""}`}
            onMouseDown={() => setSteamBypassOpen(true)}
            onMouseUp={() => setSteamBypassOpen(false)}
            onMouseLeave={() => setSteamBypassOpen(false)}
          >
            {steamBypassOpen ? "■ Open" : "Open"}
          </button>
          <button
            className={`hmi-btn text-xs px-4 py-1 ${!steamBypassOpen ? "" : ""}`}
            onClick={() => setSteamBypassOpen(false)}
          >
            Close
          </button>
          <div className={`ml-2 w-3 h-3 rounded-full ${steamBypassOpen ? "bg-hmi-green shadow-[0_0_6px_hsl(var(--hmi-green))]" : "bg-secondary border border-border"}`} />
        </div>

        {/* Row 4: Blower Current */}
        <div className="flex items-center gap-4 p-3 bg-secondary/30 border border-border rounded-sm">
          <span className="text-sm font-semibold text-foreground w-36">Blower Current</span>
          <span className="font-mono text-lg text-accent font-bold">{blowerCurrent.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">Amp.</span>
        </div>

        {/* Row 5: Recipe buttons */}
        <div className="flex items-center gap-3 justify-center">
          <button className="hmi-btn text-xs px-4 py-1.5" onClick={() => setViewMode("recall-list")}>
            📂 Recall
          </button>
          <button className="hmi-btn text-xs px-4 py-1.5" onClick={() => setViewMode("delete-list")}>
            ✕ Delete
          </button>
          <button className="hmi-btn text-xs px-4 py-1.5" onClick={() => setViewMode("recipes")}>
            💾 Save / Manage
          </button>
        </div>

        {/* Status bar */}
        <div className="text-center p-2 bg-secondary/20 border border-border rounded-sm">
          <p className="text-[10px] text-muted-foreground mb-0.5">
            Recipe: <span className="text-accent font-semibold">{activeRecipeName}</span>
          </p>
          <p className="text-xs text-foreground font-mono">
            {isRunning && `▶ ${cycleSteps[currentStep]?.name} — ${timeLeft}s remaining`}
            {isHalted && `⏸ Halted at ${cycleSteps[currentStep]?.name} — ${timeLeft}s left`}
            {isStopped && "Auto Cycle Completed / Ready"}
          </p>
        </div>
      </div>
    </HMILayout>
  );
};

export default AutoCycleScreen;
