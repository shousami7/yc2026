"use client";

import { useState } from "react";
import Upload from "@/components/bim/Upload";
import Viewer3D from "@/components/bim/Viewer3D";
import type { LayoutJSON } from "@/components/bim/types";

type AppState = "idle" | "extracting" | "preview" | "error";

export default function BIMPage() {
  const [state, setState] = useState<AppState>("idle");
  const [layout, setLayout] = useState<LayoutJSON | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setState("extracting");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Extraction failed");
      }

      const data = await res.json();
      setLayout(data.layout);
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setLayout(null);
    setError(null);
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-sm font-medium tracking-wide">BIM AI</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>floor plan → 3D → IFC</span>
        </div>
        {state !== "idle" && (
          <button
            onClick={handleReset}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            reset
          </button>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {(state === "idle" || state === "extracting" || state === "error") && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-xl px-6">
              <Upload
                onUpload={handleUpload}
                isLoading={state === "extracting"}
              />
              {state === "error" && error && (
                <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
              )}
            </div>
          </div>
        )}

        {state === "preview" && layout && (
          <div className="flex-1 flex overflow-hidden">
            {/* 3D Viewport */}
            <div className="flex-1 relative">
              <Viewer3D layout={layout} />
            </div>

            {/* Side Panel */}
            <aside className="w-72 border-l border-white/10 flex flex-col shrink-0">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-widest">
                  Layout
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-xs text-white/60">
                <Section label="Walls" count={layout.walls.length} />
                <Section label="Doors" count={layout.doors.length} />
                <Section label="Windows" count={layout.windows.length} />
                <Section label="Rooms" count={layout.rooms.length} />
                <div className="pt-2 border-t border-white/10">
                  {layout.rooms.map((r, i) => (
                    <div key={i} className="py-1 flex justify-between">
                      <span>{r.name || `Room ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 py-4 border-t border-white/10">
                <button
                  onClick={() => exportIFC(layout)}
                  className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-xs font-medium transition-colors"
                >
                  Export IFC
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-white/30">{count}</span>
    </div>
  );
}

async function exportIFC(layout: LayoutJSON) {
  const res = await fetch("/api/export-ifc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "model.ifc";
  a.click();
  URL.revokeObjectURL(url);
}
