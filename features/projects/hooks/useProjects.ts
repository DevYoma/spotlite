import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProjectInput, UpdateProjectInput, ProjectResponse } from "@/lib/api/modules/projects/types";

const PROJECTS_QUERY_KEY = ["projects"];

export function useProjectsQuery() {
  return useQuery<ProjectResponse[]>({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      return res.json();
    },
  });
}

export function useProjectDetailsQuery(id: string) {
  return useQuery<ProjectResponse>({
    queryKey: ["projects", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch project details");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponse, Error, CreateProjectInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create project");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponse, Error, { id: string; input: UpdateProjectInput }>({
    mutationFn: async ({ id, input }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update project");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponse, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete project");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
    },
  });
}
