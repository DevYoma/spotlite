import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmissionResponse } from "@/lib/api/modules/submissions/types";

export function useSubmissionsQuery(projectId: string, formId: string) {
  return useQuery<SubmissionResponse[]>({
    queryKey: ["projects", projectId, "forms", formId, "submissions"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/forms/${formId}/submissions`);
      if (!res.ok) {
        throw new Error("Failed to fetch submissions");
      }
      return res.json();
    },
    enabled: !!projectId && !!formId && formId !== "new",
  });
}

export function useDeleteSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    SubmissionResponse,
    Error,
    { projectId: string; formId: string; submissionId: string }
  >({
    mutationFn: async ({ projectId, formId, submissionId }) => {
      const res = await fetch(
        `/api/projects/${projectId}/forms/${formId}/submissions/${submissionId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete submission");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "forms", variables.formId, "submissions"],
      });
    },
  });
}
