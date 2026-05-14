import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyTasks, getTasksByProject, updateTaskStatus, approveTask } from "../api/tasksApi.js";
import { useAuth } from "../auth/AuthContext.jsx";

export function useMyTasks() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["tasks", "mine"],
    queryFn: () => getMyTasks(token),
    enabled: !!token,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (taskId) => approveTask(taskId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    updateStatus: updateStatusMutation.mutate,
    approve: approveMutation.mutate,
  };
}

export function useProjectTasks(projectId) {
  const { token } = useAuth();

  const tasksQuery = useQuery({
    queryKey: ["tasks", "project", projectId],
    queryFn: () => getTasksByProject(projectId, token),
    enabled: !!token && !!projectId,
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
  };
}
