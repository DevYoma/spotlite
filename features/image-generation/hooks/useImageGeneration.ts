import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GeneratedImage {
  id: string;
  submissionId: string;
  templateId: string;
  imageUrl: string;
  createdAt: string;
}

// ─── Generate a graphic ───────────────────────────────────────────────────────
export function useGenerateMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      submissionId,
      templateId,
    }: {
      submissionId: string;
      templateId: string;
    }): Promise<GeneratedImage> => {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, templateId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Generation failed");
      }
      return res.json();
    },
    onSuccess: (_data, { submissionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["generated-images", projectId, submissionId],
      });
    },
  });
}

// ─── List generated images for a submission ───────────────────────────────────
export function useGeneratedImagesQuery(projectId: string, submissionId: string) {
  return useQuery<GeneratedImage[]>({
    queryKey: ["generated-images", projectId, submissionId],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/${projectId}/generated-images?submissionId=${submissionId}`
      );
      if (!res.ok) throw new Error("Failed to fetch generated images");
      return res.json();
    },
    enabled: !!projectId && !!submissionId,
  });
}

// ─── Delete a generated image ─────────────────────────────────────────────────
export function useDeleteGeneratedImageMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      imageId,
      submissionId,
    }: {
      imageId: string;
      submissionId: string;
    }) => {
      const res = await fetch(
        `/api/projects/${projectId}/generated-images/${imageId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete image");
      return { imageId, submissionId };
    },
    onSuccess: (_data, { submissionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["generated-images", projectId, submissionId],
      });
    },
  });
}
