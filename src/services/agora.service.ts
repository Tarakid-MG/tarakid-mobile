import api from "../api/client";

export interface AgoraTokenResponse {
  token: string;
  appId: string;
  channel: string;
  uid: number;
}

export const agoraService = {
  async getToken(
    bookingId: string,
    userId: number,
  ): Promise<AgoraTokenResponse> {
    const response = await api.get<AgoraTokenResponse>(
      `/agora/token?channel=class-${bookingId}&uid=${userId}`,
    );
    return response.data;
  },
};
