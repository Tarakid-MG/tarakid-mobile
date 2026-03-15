import api from "../api/client";
import type { AuthResponse, LoginDto, RegisterDto } from "../types/auth";

export interface MessageResponse {
  message: string;
}

export const authService = {
  async login(dto: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", dto);
    return response.data;
  },

  async register(dto: any): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>("/auth/register", dto);
    return response.data;
  },

  async resendVerification(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      "/auth/resend-verification",
      { email },
    );
    return response.data;
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  async resetPassword(dto: any): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      "/auth/reset-password",
      dto,
    );
    return response.data;
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      `/auth/verify-email?token=${token}`,
      {},
    );
    return response.data;
  },
};
