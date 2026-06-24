"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField, CreateFormInput } from "@/lib/api/modules/forms/types";
import { useCreateFormMutation, useUpdateFormMutation, useFormDetailsQuery } from "../hooks/useForms";
import { toast } from "sonner";

interface FormBuilderProps {
  projectId: string;
  formId: string; // "new" or a UUID
}

export default function FormBuilder({ projectId, formId }: FormBuilderProps) {
  const router = useRouter();
  const isEditMode = formId !== "new";

  // Mutations/Query
  const { data: existingForm, isLoading } = useFormDetailsQuery(projectId, formId);
  const createMutation = useCreateFormMutation();
  const updateMutation = useUpdateFormMutation();

  // Local state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);

  // Load existing form values
  useEffect(() => {
    if (isEditMode && existingForm) {
      setName(existingForm.name);
      setTitle(existingForm.title);
      setFields(existingForm.schemaJson.fields || []);
    }
  }, [existingForm, isEditMode]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-10 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-card" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-card" />
      </div>
    );
  }

  const addField = (type: "text" | "textarea" | "image" | "radio" | "select") => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: "",
      required: false,
      placeholder: "",
      options: (type === "radio" || type === "select") ? [] : undefined,
    };
    setFields([...fields, newField]);
    toast.success(`Added ${type} field`);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    toast.info("Removed field");
  };

  const updateField = (id: string, key: keyof FormField, value: any) => {
    setFields(
      fields.map((f) => {
        if (f.id === id) {
          return { ...f, [key]: value };
        }
        return f;
      })
    );
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...fields];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, movedItem);
    setFields(reordered);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Form Name is required");
      return;
    }
    if (!title.trim()) {
      toast.error("Form Title is required");
      return;
    }
    if (fields.length === 0) {
      toast.error("Please add at least one field to your form");
      return;
    }

    // Validate that all fields have labels
    const hasEmptyLabels = fields.some((f) => !f.label.trim());
    if (hasEmptyLabels) {
      toast.error("All form fields must have a label");
      return;
    }

    // Validate options for radio/select fields
    const hasEmptyOptions = fields.some(
      (f) => (f.type === "radio" || f.type === "select") && (!f.options || f.options.length === 0)
    );
    if (hasEmptyOptions) {
      toast.error("Radio and Select fields must have at least one option");
      return;
    }

    const payload: CreateFormInput = {
      name: name.trim(),
      title: title.trim(),
      fields,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          projectId,
          formId,
          input: payload,
        });
        toast.success("Form updated successfully!");
      } else {
        await createMutation.mutateAsync({
          projectId,
          input: payload,
        });
        toast.success("Form created successfully!");
      }
      router.push(`/dashboard/projects/${projectId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save form");
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1280px] mx-auto w-full">
      {/* Left Settings Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-card shadow-card space-y-6">
          <h2 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            Form Settings
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark" htmlFor="form-name">
                Form Name (Internal)
              </label>
              <input
                id="form-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Member Registration Form"
                className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
              <p className="text-xs text-text-muted-light">
                Used to identify the form in your dashboard.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark" htmlFor="form-title">
                Form Display Title (Public)
              </label>
              <input
                id="form-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Welcome Class of 2026!"
                className="w-full px-4 py-2.5 text-sm rounded-input border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
              <p className="text-xs text-text-muted-light">
                Visible to users filling out the form.
              </p>
            </div>
          </div>
        </div>

        {/* Component Selector */}
        <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-card shadow-card space-y-4">
          <h3 className="font-heading font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
            Add Form Fields
          </h3>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => addField("text")}
              className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/55 dark:border-zinc-805/50 text-text-primary-light dark:text-text-primary-dark text-sm font-medium rounded-input flex items-center gap-3 transition-colors cursor-pointer"
            >
              <span className="text-brand-primary text-base">✏️</span> Text Input
            </button>
            <button
              type="button"
              onClick={() => addField("textarea")}
              className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/55 dark:border-zinc-805/50 text-text-primary-light dark:text-text-primary-dark text-sm font-medium rounded-input flex items-center gap-3 transition-colors cursor-pointer"
            >
              <span className="text-brand-secondary text-base">📝</span> Long Text Area
            </button>
            <button
              type="button"
              onClick={() => addField("image")}
              className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/55 dark:border-zinc-805/50 text-text-primary-light dark:text-text-primary-dark text-sm font-medium rounded-input flex items-center gap-3 transition-colors cursor-pointer"
            >
              <span className="text-brand-accent text-base">🖼️</span> Image Upload
            </button>
            <button
              type="button"
              onClick={() => addField("radio")}
              className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/55 dark:border-zinc-805/50 text-text-primary-light dark:text-text-primary-dark text-sm font-medium rounded-input flex items-center gap-3 transition-colors cursor-pointer"
            >
              <span className="text-amber-500 text-base">🔘</span> Radio Selection
            </button>
            <button
              type="button"
              onClick={() => addField("select")}
              className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/55 dark:border-zinc-805/50 text-text-primary-light dark:text-text-primary-dark text-sm font-medium rounded-input flex items-center gap-3 transition-colors cursor-pointer"
            >
              <span className="text-violet-500 text-base">👇</span> Dropdown Menu
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="lg:col-span-2 space-y-6 flex flex-col justify-between min-h-[500px]">
        <div className="bg-white dark:bg-surface-dark border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-card shadow-card space-y-6 flex-1">
          <h2 className="font-heading font-bold text-xl text-text-primary-light dark:text-text-primary-dark border-b border-zinc-100 dark:border-zinc-800/80 pb-3 flex items-center justify-between">
            <span>Form Fields Canvas</span>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full text-text-muted-light">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </span>
          </h2>

          {fields.length === 0 ? (
            <div className="py-20 px-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-card flex flex-col items-center justify-center gap-4">
              <span className="text-4xl">🛠️</span>
              <h3 className="font-heading font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
                Your form is empty
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-sm">
                Add text inputs, textareas, and image upload zones from the sidebar to start building your form schema.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <FormFieldCard
                  key={field.id}
                  field={field}
                  index={index}
                  fieldsLength={fields.length}
                  updateField={updateField}
                  removeField={removeField}
                  moveField={moveField}
                />
              ))}
            </div>
          )}
        </div>

        {/* Save Footer Bar */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/projects/${projectId}`)}
            className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-button text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-button text-sm font-semibold shadow-card hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
          >
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create Form Schema"}
          </button>
        </div>
      </div>
    </form>
  );
}

interface FormFieldCardProps {
  field: FormField;
  index: number;
  fieldsLength: number;
  updateField: (id: string, key: keyof FormField, value: any) => void;
  removeField: (id: string) => void;
  moveField: (index: number, direction: "up" | "down") => void;
}

function FormFieldCard({
  field,
  index,
  fieldsLength,
  updateField,
  removeField,
  moveField,
}: FormFieldCardProps) {
  const [optionsText, setOptionsText] = useState(() => (field.options || []).join(", "));

  // Synchronize optionsText with field.options if it changes externally
  useEffect(() => {
    const parentJoined = (field.options || []).join(", ");
    const localParsed = optionsText.split(",").map((s) => s.trim()).filter(Boolean);
    const parentParsed = field.options || [];

    if (JSON.stringify(localParsed) !== JSON.stringify(parentParsed)) {
      setOptionsText(parentJoined);
    }
  }, [field.options]);

  const handleOptionsChange = (val: string) => {
    setOptionsText(val);
    const parsed = val.split(",").map((s) => s.trim()).filter(Boolean);
    updateField(field.id, "options", parsed);
  };

  return (
    <div className="p-5 border border-zinc-200/60 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/30 rounded-card flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-brand-primary/45 transition-colors relative group">
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full uppercase tracking-wider">
            {field.type}
          </span>
          <span className="text-xs text-text-muted-light">ID: {field.id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Label Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              Field Label <span className="text-brand-primary">*</span>
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, "label", e.target.value)}
              placeholder="e.g. Enter field question"
              className="w-full px-3 py-1.5 text-xs rounded-input border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Placeholder (Only for Text and Textarea) */}
          {(field.type === "text" || field.type === "textarea") && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Placeholder text
              </label>
              <input
                type="text"
                value={field.placeholder || ""}
                onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                placeholder="e.g. Type response here..."
                className="w-full px-3 py-1.5 text-xs rounded-input border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          {/* Options Input (Only for Radio and Select) */}
          {(field.type === "radio" || field.type === "select") && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Options (comma-separated) <span className="text-brand-primary">*</span>
              </label>
              <input
                type="text"
                value={optionsText}
                onChange={(e) => handleOptionsChange(e.target.value)}
                placeholder="e.g. Option 1, Option 2, Option 3"
                className="w-full px-3 py-1.5 text-xs rounded-input border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(field.id, "required", e.target.checked)}
              className="rounded border-zinc-300 text-brand-primary focus:ring-brand-primary h-3.5 w-3.5"
            />
            Required field
          </label>
        </div>
      </div>

      {/* Actions (Move & Delete) */}
      <div className="flex items-center md:flex-col gap-1 w-full md:w-auto border-t md:border-t-0 border-zinc-150/60 dark:border-zinc-800 pt-3 md:pt-0 justify-end mt-2 md:mt-0">
        <div className="flex gap-1 mr-auto md:mr-0">
          <button
            type="button"
            onClick={() => moveField(index, "up")}
            disabled={index === 0}
            title="Move Up"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-text-primary-light dark:text-text-primary-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => moveField(index, "down")}
            disabled={index === fieldsLength - 1}
            title="Move Down"
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-text-primary-light dark:text-text-primary-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
          >
            ▼
          </button>
        </div>

        <button
          type="button"
          onClick={() => removeField(field.id)}
          className="px-2 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 text-brand-error text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer mt-0 md:mt-2"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
