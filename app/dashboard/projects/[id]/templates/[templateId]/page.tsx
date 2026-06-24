"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTemplateQuery, useUpdateTemplateMutation } from "@/features/templates/hooks/useTemplates";
import { useFormsQuery } from "@/features/forms/hooks/useForms";
import { FormResponse } from "@/lib/api/modules/forms/types";
import { LayoutElement } from "@/lib/api/modules/templates/types";

// Dynamically import Konva components — canvas APIs only exist in the browser
const KonvaEditor = dynamic(() => import("@/features/templates/components/KonvaEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading canvas...</p>
      </div>
    </div>
  ),
});

export default function TemplateEditorPage() {
  const params = useParams<{ id: string; templateId: string }>();
  const router = useRouter();
  const projectId = params.id;
  const templateId = params.templateId;

  const { data: template, isLoading: templateLoading } = useTemplateQuery(projectId, templateId);
  const { data: forms = [], isLoading: formsLoading } = useFormsQuery(projectId);
  const updateMutation = useUpdateTemplateMutation();

  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [elements, setElements] = useState<LayoutElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [naturalSize, setNaturalSize] = useState({ w: 1080, h: 1080 });

  const handleNaturalSizeLoaded = useCallback((w: number, h: number) => {
    setNaturalSize({ w, h });
  }, []);

  // When template loads, restore existing layout
  useEffect(() => {
    if (template?.layoutJson && "elements" in template.layoutJson) {
      const layout = template.layoutJson as { originalWidth: number; originalHeight: number; elements: LayoutElement[] };
      setElements(layout.elements || []);
    }
  }, [template]);

  // Auto-select first form
  useEffect(() => {
    if (forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0].id);
    }
  }, [forms, selectedFormId]);

  const selectedForm = forms.find((f: FormResponse) => f.id === selectedFormId);
  const selectedElement = elements.find((el) => el.fieldId === selectedElementId);

  const addFieldToCanvas = (field: { id: string; label: string; type: string }) => {
    // Don't add duplicates
    if (elements.find((el) => el.fieldId === field.id)) return;

    const newEl: LayoutElement = {
      fieldId: field.id,
      fieldName: field.label,
      fieldType: field.type,
      x: 50,
      y: 50 + elements.length * 80,
      width: field.type === "image" ? 160 : 320,
      height: field.type === "image" ? 160 : 60,
      fontSize: 24,
      color: "#ffffff",
      alignment: "left",
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(field.id);
  };

  const updateElement = (fieldId: string, updates: Partial<LayoutElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.fieldId === fieldId ? { ...el, ...updates } : el))
    );
  };

  const removeElement = (fieldId: string) => {
    setElements((prev) => prev.filter((el) => el.fieldId !== fieldId));
    if (selectedElementId === fieldId) setSelectedElementId(null);
  };

  const handleSave = async () => {
    if (!template) return;
    setSaveStatus("saving");
    try {
      await updateMutation.mutateAsync({
        projectId,
        templateId,
        layoutJson: {
          originalWidth: naturalSize.w,
          originalHeight: naturalSize.h,
          elements,
        },
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        <p>Template not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-900 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/projects/${projectId}?tab=templates`)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="h-4 w-px bg-gray-700" />
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">{template.name}</h1>
            <p className="text-xs text-gray-500">Canvas Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-400">Save failed</span>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saveStatus === "saving" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Layout
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col overflow-hidden">
          {/* Form Selector */}
          <div className="px-4 py-3 border-b border-gray-800">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Form
            </label>
            {formsLoading ? (
              <div className="h-9 bg-gray-800 animate-pulse rounded-lg" />
            ) : (
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                {forms.length === 0 && (
                  <option value="">No forms yet</option>
                )}
                {forms.map((form: FormResponse) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Field List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Fields
              </p>
              {!selectedForm ? (
                <p className="text-xs text-gray-600 italic">Select a form above</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedForm.schemaJson.fields.map((field) => {
                    const alreadyAdded = elements.some((el) => el.fieldId === field.id);
                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-gray-800 border border-gray-700"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded text-xs
                            ${field.type === "image" ? "bg-purple-900 text-purple-300" : "bg-blue-900 text-blue-300"}`}>
                            {field.type === "image" ? "🖼" : "T"}
                          </span>
                          <span className="text-xs text-gray-200 truncate">{field.label}</span>
                        </div>
                        <button
                          onClick={() => addFieldToCanvas(field)}
                          disabled={alreadyAdded}
                          title={alreadyAdded ? "Already on canvas" : "Add to canvas"}
                          className={`shrink-0 text-xs px-2 py-1 rounded font-medium transition-colors
                            ${alreadyAdded
                              ? "bg-emerald-900 text-emerald-400 cursor-default"
                              : "bg-indigo-700 hover:bg-indigo-600 text-white"
                            }`}
                        >
                          {alreadyAdded ? "✓" : "+"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Element Settings */}
          {selectedElement && (
            <div className="border-t border-gray-800 px-4 py-3 space-y-3 bg-gray-900">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {selectedElement.fieldName}
                </p>
                <button
                  onClick={() => removeElement(selectedElement.fieldId)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>

              {selectedElement.fieldType !== "image" && (
                <>
                  {/* Font Size */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Font size: {selectedElement.fontSize ?? 24}px
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      value={selectedElement.fontSize ?? 24}
                      onChange={(e) =>
                        updateElement(selectedElement.fieldId, { fontSize: Number(e.target.value) })
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Color */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Color</label>
                    <input
                      type="color"
                      value={selectedElement.color ?? "#ffffff"}
                      onChange={(e) =>
                        updateElement(selectedElement.fieldId, { color: e.target.value })
                      }
                      className="w-8 h-7 rounded cursor-pointer border border-gray-700 bg-transparent"
                    />
                    <span className="text-xs text-gray-400">{selectedElement.color ?? "#ffffff"}</span>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Alignment</label>
                    <div className="flex gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => updateElement(selectedElement.fieldId, { alignment: align })}
                          className={`flex-1 py-1 text-xs rounded transition-colors
                            ${selectedElement.alignment === align
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                        >
                          {align === "left" ? "⬅" : align === "center" ? "↔" : "➡"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Width / Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) =>
                      updateElement(selectedElement.fieldId, { width: Number(e.target.value) })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) =>
                      updateElement(selectedElement.fieldId, { height: Number(e.target.value) })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Canvas Workspace */}
        <main className="flex-1 overflow-hidden relative">
          <KonvaEditor
            backgroundImageUrl={template.backgroundImageUrl}
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={updateElement}
            onNaturalSizeLoaded={handleNaturalSizeLoaded}
          />
        </main>
      </div>
    </div>
  );
}
