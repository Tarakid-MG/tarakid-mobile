import api from "../api/client";
import {
  type Booking,
  type Subscription,
  type FreeTrialBooking,
  type FreeTrialSession,
} from "../types/auth";

export const kidService = {
  async getLevel(kidId: string): Promise<{ level: string }> {
    const response = await api.get<{ level: string }>(`/kids/${kidId}/level`);
    return response.data;
  },
};

export const bookingService = {
  async getKidBookings(kidId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/kid/${kidId}`);
    return response.data;
  },
  async cancelBooking(id: string): Promise<Booking> {
    const response = await api.delete<Booking>(`/bookings/${id}`);
    return response.data;
  },
};

export const freeTrialService = {
  async getUserBookings(userId: number): Promise<FreeTrialBooking[]> {
    const response = await api.get<FreeTrialBooking[]>(
      `/free-trial/bookings/user/${userId}`,
    );
    return response.data;
  },
  async cancelBooking(bookingId: number, userId: number): Promise<void> {
    await api.delete(`/free-trial/bookings/${bookingId}`, { data: { userId } });
  },
};

export const subscriptionService = {
  async getKidSubscriptions(kidId: string): Promise<Subscription[]> {
    const response = await api.get<Subscription[]>(
      `/subscriptions/kid/${kidId}`,
    );
    return response.data;
  },
};
