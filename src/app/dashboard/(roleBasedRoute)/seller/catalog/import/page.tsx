"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FaFileUpload, FaDownload, FaCheckCircle, FaTimesCircle,
  FaTable, FaSpinner, FaInfoCircle
} from "react-icons/fa";

interface ParsedRow {
  name: string; description: string; price: string; stock: string;
  manufacturer: string; categoryId: string; image?: string;
  valid: boolean; error?: string;
}

const CSV_TEMPLATE_HEADERS = [
  "name", "description", "price", "stock", "manufacturer", "categoryId", "image"
];

const REQUIRED = ["name", "description", "price", "stock", "manufacturer", "categoryId"];

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: any = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    const missingFields = REQUIRED.filter(r => !row[r]);
    const priceNum = parseFloat(row.price);
    const stockNum = parseInt(row.stock);
    let error = "";
    if (missingFields.length) error = `Missing: ${missingFields.join(", ")}`;
    else if (isNaN(priceNum) || priceNum <= 0) error = "Price must be a positive number";
    else if (isNaN(stockNum) || stockNum < 0) error = "Stock must be a non-negative integer";
    return { ...row, valid: !error, error } as ParsedRow;
  });
}

export default function SellerCatalogImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  const downloadTemplate = () => {
    const csv = [
      CSV_TEMPLATE_HEADERS.join(","),
      `Paracetamol 500mg,"Pain relief tablet",5.99,100,ABC Pharma,CATEGORY_ID_HERE,https://example.com/img.jpg`,
      `Amoxicillin 250mg,"Antibiotic capsule",12.50,50,XYZ Labs,CATEGORY_ID_HERE,`,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "medicine_import_template.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { toast.error("Please upload a .csv file"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setResults(null);
      toast.success(`Parsed ${parsed.length} rows — ${parsed.filter(r => r.valid).length} valid`);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r.valid);
    if (!validRows.length) { toast.error("No valid rows to import"); return; }
    setImporting(true);
    let success = 0;
    const errors: string[] = [];
    for (const row of validRows) {
      try {
        const res = await fetch("/api/seller/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            stock: parseInt(row.stock),
            manufacturer: row.manufacturer,
            categoryId: row.categoryId,
            image: row.image || null,
          }),
        });
        if (res.ok) success++;
        else {
          const d = await res.json();
          errors.push(`${row.name}: ${d.message || "Failed"}`);
        }
      } catch {
        errors.push(`${row.name}: Network error`);
      }
    }
    setResults({ success, errors });
    setImporting(false);
    if (success) toast.success(`${success} medicines imported successfully!`);
    if (errors.length) toast.error(`${errors.length} rows failed`);
  };

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  return (
    <div className="medi-page">
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#1B3A5C" }}>
            <FaFileUpload className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>Bulk CSV Import</h1>
            <p className="text-sm" style={{ color: "#8A6650" }}>Upload multiple medicines at once from a CSV file</p>
          </div>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition"
          style={{ background: "#1B3A5C20", color: "#1B3A5C" }}>
          <FaDownload /> Download Template
        </button>
      </div>

      {/* Instructions */}
      <div className="medi-card p-5 mb-6 flex items-start gap-3">
        <FaInfoCircle style={{ color: "#3A6EA5", flexShrink: 0, marginTop: 2 }} />
        <div className="text-sm" style={{ color: "#1B3A5C" }}>
          <p className="font-semibold mb-2">How to Import</p>
          <ol className="list-decimal pl-4 space-y-1 text-xs" style={{ color: "#5C4033" }}>
            <li>Download the CSV template and fill in your medicine data</li>
            <li>Required columns: <strong>{REQUIRED.join(", ")}</strong></li>
            <li>Upload the completed file and preview the parsed data</li>
            <li>Fix any validation errors shown in red, then click Import</li>
            <li><strong>categoryId</strong> must be a valid category ID from your platform</li>
          </ol>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer mb-6 transition-all hover:border-opacity-100"
        style={{ borderColor: "#C2703A", background: "#FFF8F2" }}>
        <FaFileUpload className="mx-auto text-4xl mb-3" style={{ color: "#C2703A" }} />
        <p className="font-semibold mb-1" style={{ color: "#1B3A5C" }}>Click to upload CSV file</p>
        <p className="text-xs" style={{ color: "#8A6650" }}>Only .csv files are accepted</p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </div>

      {/* Import Results */}
      {results && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="medi-card p-5 mb-6">
          <h3 className="font-bold mb-3" style={{ color: "#1B3A5C" }}>Import Results</h3>
          <div className="flex gap-6 mb-3">
            <div className="flex items-center gap-2">
              <FaCheckCircle style={{ color: "#2E7D32" }} />
              <span className="font-bold" style={{ color: "#2E7D32" }}>{results.success} succeeded</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTimesCircle style={{ color: "#C62828" }} />
              <span className="font-bold" style={{ color: "#C62828" }}>{results.errors.length} failed</span>
            </div>
          </div>
          {results.errors.length > 0 && (
            <div className="space-y-1">
              {results.errors.map((e, i) => (
                <p key={i} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#FFEBEE", color: "#C62828" }}>{e}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="medi-card overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: "#EEE4D9" }}>
            <div className="flex items-center gap-3">
              <FaTable style={{ color: "#1B3A5C" }} />
              <h3 className="font-bold" style={{ color: "#1B3A5C" }}>Preview ({rows.length} rows)</h3>
              <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                {validCount} valid
              </span>
              {invalidCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: "#FFEBEE", color: "#C62828" }}>
                  {invalidCount} invalid
                </span>
              )}
            </div>
            <button onClick={handleImport} disabled={importing || validCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition"
              style={{ background: "#1B3A5C", color: "#FFF" }}>
              {importing ? <FaSpinner className="animate-spin" /> : <FaFileUpload />}
              Import {validCount} Valid Rows
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead style={{ background: "#F5EDE3" }}>
                <tr>
                  {["Status", "Name", "Price", "Stock", "Manufacturer", "Category ID", "Error"].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold" style={{ color: "#8A6650" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{
                    background: row.valid ? "transparent" : "#FFF5F5",
                    borderBottom: "1px solid #F5EDE3"
                  }}>
                    <td className="py-3 px-4">
                      {row.valid
                        ? <FaCheckCircle style={{ color: "#2E7D32" }} />
                        : <FaTimesCircle style={{ color: "#C62828" }} />
                      }
                    </td>
                    <td className="py-3 px-4 font-medium" style={{ color: "#1B3A5C" }}>{row.name}</td>
                    <td className="py-3 px-4" style={{ color: "#5C4033" }}>${row.price}</td>
                    <td className="py-3 px-4" style={{ color: "#5C4033" }}>{row.stock}</td>
                    <td className="py-3 px-4" style={{ color: "#5C4033" }}>{row.manufacturer}</td>
                    <td className="py-3 px-4 font-mono text-[10px]" style={{ color: "#8A6650" }}>{row.categoryId}</td>
                    <td className="py-3 px-4" style={{ color: "#C62828" }}>{row.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
