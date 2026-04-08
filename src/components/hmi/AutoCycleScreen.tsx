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
  { name: "Hot Water", relay: [true, false, false, false, false], duration: 30 },
  { name: "Hot + Dosing", relay: [true, false, true, false, false], duration: 20 },
  { name: "Hot Water", relay: [true, false, false, false, false], duration: 30 },
  { name: "Hot + Dosing", relay: [true, false, true, false, false], duration: 20 },
  { name: "Cold Water", relay: [false, true, false, false, false], duration: 25 },
  { name: "DM Water", relay: [false, false, true, false, false], duration: 15 },
];

const cycleOptions = ["Hot Water", "Hot + Dosing", "Cold Water", "DM Water", "Rinse", "Drain", "Dry"];

const initialRecipes: Recipe[] = [
  {
    id: "R001",
    name: "Standard WIP",
    steps: defaultSteps,
    createdBy: "Manager",
    createdAt: "01/01/25",
  },
  {
    id: "R002",
    name: "Quick Rinse",
    steps: [
      { name: "Hot Water", relay: [true, false, false, false, false], duration: 15 },
      { name: "Cold Water", relay: [false, true, false, false, false], duration: 15 },
      { name: "DM Water", relay: [false, false, true, false, false], duration: 10 },
    ],
    createdBy: "Supervisor",
    createdAt: "15/02/25",
  },
];

type ViewMode = "cycle" | "recipes" | "edit-recipe";

const AutoCycleScreen = ({ userLevel, onNavigate }: Props) => {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleSteps, setCycleSteps] = useState<CycleStep[]>(defaultSteps);
  const [timeLeft, setTimeLeft] = useState(defaultSteps[0].duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("cycle");
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [activeRecipe, setActiveRecipe] = useState<string>("R001");
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
  }, [running, cycleSteps]);

  const handleToggle = () => {
    if (!running) {
      setCurrentStep(0);
      setTimeLeft(cycleSteps[0].duration);
    }
    setRunning(!running);
  };

  const handleRecall = (recipe: Recipe) => {
    setCycleSteps(recipe.steps);
    setActiveRecipe(recipe.id);
    setTimeLeft(recipe.steps[0].duration);
    setCurrentStep(0);
    setRunning(false);
    setViewMode("cycle");
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      if (activeRecipe === id) {
        setActiveRecipe("");
      }
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const handleStartNewRecipe = () => {
    const newId = `R${String(recipes.length + 1).padStart(3, "0")}`;
    setEditingRecipe({
      id: newId,
      name: "",
      steps: [{ name: "Hot Water", relay: [true, false, false, false, false], duration: 30 }],
      createdBy: userLevel,
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }),
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
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
    setViewMode("recipes");
    setEditingRecipe(null);
  };

  const updateStep = (index: number, field: string, value: any) => {
    if (!editingRecipe) return;
    const steps = [...editingRecipe.steps];
    if (field === "name") {
      steps[index] = { ...steps[index], name: value };
    } else if (field === "duration") {
      steps[index] = { ...steps[index], duration: Math.max(1, Number(value)) };
    } else if (field.startsWith("relay-")) {
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
      steps: [...editingRecipe.steps, { name: "Hot Water", relay: [false, false, false, false, false], duration: 15 }],
    });
  };

  const removeStep = (index: number) => {
    if (!editingRecipe || editingRecipe.steps.length <= 1) return;
    setEditingRecipe({
      ...editingRecipe,
      steps: editingRecipe.steps.filter((_, i) => i !== index),
    });
  };

  // ─── EDIT RECIPE VIEW ───
  if (viewMode === "edit-recipe" && editingRecipe) {
    return (
      <HMILayout
        title={`Recipe Editor — ${editingRecipe.id}`}
        userLevel={userLevel}
        onNavigateLeft={() => setViewMode("recipes")}
        bottomButtons={
          <div className="flex gap-2">
            <button className="hmi-btn hmi-btn-primary" onClick={handleSaveRecipe} disabled={!newRecipeName.trim()}>
              💾 Save
            </button>
            <button className="hmi-btn" onClick={() => setViewMode("recipes")}>Cancel</button>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Recipe Name */}
          <div className="flex items-center gap-3 p-2 bg-secondary/30 border border-border rounded-sm">
            <span className="text-xs text-muted-foreground w-24">Recipe Name:</span>
            <input
              className="flex-1 bg-background border border-border rounded-sm px-2 py-1 text-sm font-semibold text-foreground focus:outline-none focus:border-accent"
              value={newRecipeName}
              onChange={(e) => setNewRecipeName(e.target.value)}
              placeholder="Enter recipe name..."
            />
          </div>

          {/* Steps Table */}
          <div className="overflow-x-auto">
            <table className="w-full hmi-table text-xs">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Cycle</th>
                  <th className="w-16">Sec</th>
                  <th className="w-8">R1</th>
                  <th className="w-8">R2</th>
                  <th className="w-8">R3</th>
                  <th className="w-8">R4</th>
                  <th className="w-8">R5</th>
                  <th className="w-8">✕</th>
                </tr>
              </thead>
              <tbody>
                {editingRecipe.steps.map((step, i) => (
                  <tr key={i}>
                    <td className="font-mono">{i + 1}</td>
                    <td>
                      <select
                        className="w-full bg-background border border-border rounded-sm px-1 py-0.5 text-xs text-foreground"
                        value={step.name}
                        onChange={(e) => updateStep(i, "name", e.target.value)}
                      >
                        {cycleOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="w-full bg-background border border-border rounded-sm px-1 py-0.5 text-xs text-center font-mono text-foreground"
                        value={step.duration}
                        onChange={(e) => updateStep(i, "duration", e.target.value)}
                        min={1}
                      />
                    </td>
                    {step.relay.map((r, j) => (
                      <td key={j}>
                        <button
                          className={`w-5 h-5 rounded-sm border mx-auto block ${r ? "bg-hmi-green border-hmi-green" : "bg-secondary border-border"}`}
                          onClick={() => updateStep(i, `relay-${j}`, null)}
                        />
                      </td>
                    ))}
                    <td>
                      <button
                        className="text-destructive hover:text-destructive/80 text-sm font-bold"
                        onClick={() => removeStep(i)}
                        disabled={editingRecipe.steps.length <= 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="hmi-btn text-xs w-full" onClick={addStep}>
            + Add Step
          </button>
        </div>
      </HMILayout>
    );
  }

  // ─── RECIPES LIST VIEW ───
  if (viewMode === "recipes") {
    return (
      <HMILayout
        title="Recipe Management"
        userLevel={userLevel}
        onNavigateLeft={() => setViewMode("cycle")}
        bottomButtons={
          <div className="flex gap-2">
            <button className="hmi-btn hmi-btn-primary" onClick={handleStartNewRecipe}>+ New Recipe</button>
            <button className="hmi-btn" onClick={() => setViewMode("cycle")}>Back to Cycle</button>
          </div>
        }
      >
        <div className="space-y-2">
          <div className="text-center p-2 bg-secondary/30 border border-border rounded-sm">
            <p className="text-xs text-muted-foreground">
              Active Recipe: <span className="text-accent font-semibold">{recipes.find((r) => r.id === activeRecipe)?.name || "None"}</span>
            </p>
          </div>

          <table className="w-full hmi-table text-xs">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Steps</th>
                <th>By</th>
                <th>Date</th>
                <th colSpan={3}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe) => (
                <tr key={recipe.id} className={recipe.id === activeRecipe ? "bg-hmi-green/10" : ""}>
                  <td className="font-mono">{recipe.id}</td>
                  <td className="font-semibold">{recipe.name}</td>
                  <td className="font-mono">{recipe.steps.length}</td>
                  <td className="text-muted-foreground">{recipe.createdBy}</td>
                  <td className="font-mono text-muted-foreground">{recipe.createdAt}</td>
                  <td>
                    <button className="hmi-btn hmi-btn-primary text-[10px] px-2 py-0.5" onClick={() => handleRecall(recipe)}>
                      📂 Recall
                    </button>
                  </td>
                  <td>
                    <button className="hmi-btn text-[10px] px-2 py-0.5" onClick={() => handleEditExisting(recipe)}>
                      ✏️ Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className={`hmi-btn text-[10px] px-2 py-0.5 ${confirmDelete === recipe.id ? "hmi-btn-danger" : ""}`}
                      onClick={() => handleDelete(recipe.id)}
                    >
                      {confirmDelete === recipe.id ? "Confirm?" : "🗑 Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {recipes.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted-foreground py-6">No recipes saved</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </HMILayout>
    );
  }

  // ─── MAIN CYCLE VIEW ───
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
          <button className="hmi-btn" onClick={() => setViewMode("recipes")}>📋 Recipes</button>
          <button className="hmi-btn" onClick={() => onNavigate("main-menu")}>Main Menu</button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Status */}
        <div className="text-center p-3 bg-secondary/30 border border-border rounded-sm">
          <p className="text-xs text-muted-foreground mb-1">
            Recipe: <span className="text-accent font-semibold">{recipes.find((r) => r.id === activeRecipe)?.name || "—"}</span>
          </p>
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
