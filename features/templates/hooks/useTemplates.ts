import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateTemplateInput,
  TemplateResponse,
  UpdateTemplateLayoutInput,
} from "@/lib/api/modules/templates/types";

export function useTemplatesQuery(projectId: string) {
  return useQuery<TemplateResponse[]>({
    queryKey: ["projects", projectId, "templates"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/templates`);
      if (!res.ok) {
        throw new Error("Failed to fetch templates");
      }
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useTemplateQuery(projectId: string, templateId: string) {
  return useQuery<TemplateResponse>({
    queryKey: ["projects", projectId, "templates", templateId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/templates/${templateId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch template");
      }
      return res.json();
    },
    enabled: !!projectId && !!templateId,
  });
}

export function useCreateTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    TemplateResponse,
    Error,
    { projectId: string; input: CreateTemplateInput }
  >({
    mutationFn: async ({ projectId, input }) => {
      const res = await fetch(`/api/projects/${projectId}/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create template");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "templates"] });
    },
  });
}

export function useUpdateTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    TemplateResponse,
    Error,
    { projectId: string; templateId: string; layoutJson: UpdateTemplateLayoutInput["layoutJson"] }
  >({
    mutationFn: async ({ projectId, templateId, layoutJson }) => {
      const res = await fetch(`/api/projects/${projectId}/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutJson }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save template layout");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "templates"],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "templates", variables.templateId],
      });
    },
  });
}

export function useDeleteTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation<TemplateResponse, Error, { projectId: string; templateId: string }>({
    mutationFn: async ({ projectId, templateId }) => {
      const res = await fetch(`/api/projects/${projectId}/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete template");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "templates"] });
    },
  });
}
