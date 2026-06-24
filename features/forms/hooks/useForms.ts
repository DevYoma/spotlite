import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateFormInput, UpdateFormInput, FormResponse } from "@/lib/api/modules/forms/types";

export function useFormsQuery(projectId: string) {
  return useQuery<FormResponse[]>({
    queryKey: ["projects", projectId, "forms"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/forms`);
      if (!res.ok) {
        throw new Error("Failed to fetch forms");
      }
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useFormDetailsQuery(projectId: string, formId: string) {
  return useQuery<FormResponse>({
    queryKey: ["projects", projectId, "forms", formId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/forms/${formId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch form details");
      }
      return res.json();
    },
    enabled: !!projectId && !!formId && formId !== "new",
  });
}

export function useCreateFormMutation() {
  const queryClient = useQueryClient();

  return useMutation<FormResponse, Error, { projectId: string; input: CreateFormInput }>({
    mutationFn: async ({ projectId, input }) => {
      const res = await fetch(`/api/projects/${projectId}/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create form");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "forms"] });
    },
  });
}

export function useUpdateFormMutation() {
  const queryClient = useQueryClient();

  return useMutation<FormResponse, Error, { projectId: string; formId: string; input: UpdateFormInput }>({
    mutationFn: async ({ projectId, formId, input }) => {
      const res = await fetch(`/api/projects/${projectId}/forms/${formId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update form");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "forms"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "forms", variables.formId] });
    },
  });
}

export function useDeleteFormMutation() {
  const queryClient = useQueryClient();

  return useMutation<FormResponse, Error, { projectId: string; formId: string }>({
    mutationFn: async ({ projectId, formId }) => {
      const res = await fetch(`/api/projects/${projectId}/forms/${formId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete form");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "forms"] });
    },
  });
}
