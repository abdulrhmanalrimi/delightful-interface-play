import { useState } from "react";
import HMILayout from "./HMILayout";

interface Props {
  userLevel: string;
  onNavigate: (screen: string) => void;
}

const PrintReportScreen = ({ userLevel, onNavigate }: Props) => {
  const [operatorName, setOperatorName] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [productName, setProductName] = useState("");
  const [productQty, setProductQty] = useState(0);
  const [printEnabled, setPrintEnabled] = useState(false);

  return (
    <HMILayout
      title="Print Report"
      userLevel={userLevel}
      onNavigateLeft={() => onNavigate("pid")}
      onNavigateRight={() => onNavigate("machine-operation")}
      bottomButtons={
        <div className="flex gap-2">
          <button className={`hmi-btn ${printEnabled ? "hmi-btn-primary" : ""}`} onClick={() => setPrintEnabled(!printEnabled)}>
            {printEnabled ? "Disable" : "Enable"}
          </button>
          <button className="hmi-btn hmi-btn-primary" disabled={!printEnabled}>🖨️ Print</button>
          <button className="hmi-btn" onClick={() => onNavigate("process-operation")}>Process Operation</button>
        </div>
      }
    >
      <div className="space-y-4 max-w-md mx-auto">
        {[
          { label: "Operator Name", value: operatorName, onChange: setOperatorName, type: "text" },
          { label: "Batch No", value: batchNo, onChange: setBatchNo, type: "text" },
          { label: "Recipe Name", value: recipeName, onChange: setRecipeName, type: "text" },
          { label: "Product Name", value: productName, onChange: setProductName, type: "text" },
        ].map((field) => (
          <div key={field.label} className="flex items-center gap-4">
            <label className="text-sm font-semibold w-40 text-right">{field.label}:</label>
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              maxLength={20}
              className="flex-1 bg-input border border-border rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-hmi-green"
            />
          </div>
        ))}
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold w-40 text-right">Product Qty:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={productQty}
              onChange={(e) => setProductQty(Number(e.target.value))}
              step={0.001}
              max={999.999}
              className="w-28 bg-input border border-border rounded-sm px-3 py-2 font-mono text-sm text-center focus:outline-none focus:border-hmi-green"
            />
            <span className="text-sm text-muted-foreground">Kg</span>
          </div>
        </div>
      </div>
    </HMILayout>
  );
};

export default PrintReportScreen;
