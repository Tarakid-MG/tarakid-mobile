import api from "../api/client";

export interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  order: number;
  isLocked?: boolean;
}

export interface Unit {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export const lessonService = {
  async getLessonsByKidAndLevel(
    kidId: string,
    level: string | number,
  ): Promise<Unit[]> {
    const response = await api.get<Unit[]>(
      `/lessons/kid/${kidId}/level/${level}`,
    );
    return response.data;
  },

  async getLesson(id: number): Promise<Lesson> {
    const response = await api.get<Lesson>(`/lessons/${id}`);
    return response.data;
  },
};
