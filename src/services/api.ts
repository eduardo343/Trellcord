import { Board, User } from '../types';
import { API_BASE_URL } from '../config/api';

interface ApiAuthResponse {
  token: string;
  user: User;
}

interface ApiUserResponse {
  user: User;
}

export interface ApiSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  boardUpdates: boolean;
  mentions: boolean;
  profileVisibility: boolean;
  activityVisibility: boolean;
}

export interface ApiBoard extends Omit<Board, 'createdAt' | 'updatedAt'> {
  archived?: boolean;
  inviteCode?: string;
  color?: string;
  progress?: number;
  teamName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBoardChannel {
  id: string;
  name: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiChannelMessage {
  id: string;
  content: string;
  channelId: string;
  author: User;
  createdAt: string;
}

type RequestOptions = RequestInit & {
  includeAuth?: boolean;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { includeAuth = true, headers, ...rest } = options;
  const token = localStorage.getItem('trellcord_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && includeAuth) {
      localStorage.removeItem('trellcord_token');
    }

    const errorMessage =
      data.error ||
      (Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
      'Request failed';
    throw new Error(errorMessage);
  }

  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<ApiAuthResponse>('/auth/login', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ email, password })
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<ApiAuthResponse>('/auth/register', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ name, email, password, password_confirmation: password })
    }),

  me: () => apiRequest<ApiUserResponse>('/auth/me'),

  updateMe: (updates: { name: string; email: string }) =>
    apiRequest<ApiUserResponse>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    }),

  requestPasswordReset: (email: string) =>
    apiRequest<{ message: string; resetToken?: string; resetUrl?: string }>('/auth/forgot-password', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ email })
    }),

  validateResetToken: (token: string) =>
    apiRequest<{ valid: boolean }>('/auth/validate-reset-token', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ token })
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ token, new_password: newPassword })
    })
};

export const boardsApi = {
  list: () => apiRequest<ApiBoard[]>('/boards'),

  create: (board: { title: string; description?: string; color?: string; progress?: number; teamName?: string }) =>
    apiRequest<ApiBoard>('/boards', {
      method: 'POST',
      body: JSON.stringify({
        title: board.title,
        description: board.description,
        color: board.color,
        progress: board.progress,
        team_name: board.teamName
      })
    }),

  join: (inviteCode: string) =>
    apiRequest<ApiBoard>('/boards/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode })
    }),

  update: (
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      isStarred: boolean;
      archived: boolean;
      color: string;
      progress: number;
      teamName: string;
    }>
  ) =>
    apiRequest<ApiBoard>(`/boards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        is_starred: updates.isStarred,
        archived: updates.archived,
        color: updates.color,
        progress: updates.progress,
        team_name: updates.teamName
      })
    }),

  delete: (id: string) =>
    apiRequest<void>(`/boards/${id}`, {
      method: 'DELETE'
    })
};

export const chatApi = {
  listChannels: (boardId: string) =>
    apiRequest<ApiBoardChannel[]>(`/boards/${boardId}/channels`),

  createChannel: (boardId: string, name: string) =>
    apiRequest<ApiBoardChannel>(`/boards/${boardId}/channels`, {
      method: 'POST',
      body: JSON.stringify({ name })
    }),

  listMessages: (boardId: string, channelId: string, limit = 50) =>
    apiRequest<ApiChannelMessage[]>(`/boards/${boardId}/channels/${channelId}/messages?limit=${limit}`),

  createMessage: (boardId: string, channelId: string, content: string) =>
    apiRequest<ApiChannelMessage>(`/boards/${boardId}/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
};

export const settingsApi = {
  get: () => apiRequest<ApiSettings>('/settings'),

  update: (settings: Partial<ApiSettings>) =>
    apiRequest<ApiSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        email_notifications: settings.emailNotifications,
        push_notifications: settings.pushNotifications,
        board_updates: settings.boardUpdates,
        mentions: settings.mentions,
        profile_visibility: settings.profileVisibility,
        activity_visibility: settings.activityVisibility
      })
    })
};
