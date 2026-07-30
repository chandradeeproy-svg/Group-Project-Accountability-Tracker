import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyTasks as getMyTasksApi, updateTaskStatus as updateTaskStatusApi, approveTask as approveTaskApi } from '../api/tasksApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const MY_TASKS_QUERY_KEY = ['tasks', 'mine'];

export function useMyTasks() {
  const { token } = useAuth();
  return useQuery({
    queryKey: MY_TASKS_QUERY_KEY,
    queryFn: () => getMyTasksApi(token),
    enabled: !!token,
  });
}

export function useUpdateTaskStatusMutation() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatusApi(taskId, status, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      addToast('Task updated!', 'success');
    },
    onError: (error) => addToast(error.message || 'Failed', 'error'),
  });
}

export function useApproveTaskMutation() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }) => approveTaskApi(taskId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      addToast('Task approved!', 'success');
    },
    onError: (error) => addToast(error.message || 'Failed', 'error'),
  });
}
