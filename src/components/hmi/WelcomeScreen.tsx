import { useState } from "react";

interface WelcomeScreenProps {
  onLogin: (level: string) => void;
}

const WelcomeScreen = ({ onLogin }: WelcomeScreenProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "11111") {
      onLogin("Operator");
    } else if (password === "22222") {
      onLogin("Supervisor");
    } else if (password === "33333") {
      onLogin("Manager");
    } else {
      setError("Invalid Password!");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="hmi-screen w-full max-w-lg relative overflow-hidden">
        <div className="scanline z-10" />

        {/* Logo area */}
        <div className="hmi-header text-center py-6">
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl font-bold" style={{ color: "hsl(var(--hmi-green))" }}>elit®</span>
            <div className="w-px h-8 bg-border" />
            <span className="text-sm text-muted-foreground font-semibold">CHAMUNDA<br />We care...</span>
          </div>
        </div>

        <div className="p-8 text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wide" style={{ color: "hsl(var(--hmi-green))" }}>
              FLUID BED DRYER - 120 Kg
            </h1>
            <p className="text-muted-foreground text-sm mt-1">(GMP Model)</p>
          </div>

          <div className="w-24 h-px bg-border mx-auto" />

          <div className="space-y-4 max-w-xs mx-auto">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                Enter Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-input border border-border rounded-sm px-4 py-3 font-mono text-lg text-center tracking-[0.3em] focus:outline-none focus:border-hmi-green transition-colors"
                placeholder="•••••"
              />
            </div>

            {error && (
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--hmi-red))" }}>
                {error}
              </p>
            )}

            <button className="hmi-btn hmi-btn-primary w-full py-3 text-lg" onClick={handleLogin}>
              LOG IN
            </button>

            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p>Operator: 11111</p>
              <p>Supervisor: 22222</p>
              <p>Manager: 33333</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
