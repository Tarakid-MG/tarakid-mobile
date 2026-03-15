export interface Booking {
  id: string;
  subscriptionId: string;
  kidId: string;
  userId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  isRecurring: boolean;
  status:
    | "SCHEDULED"
    | "COMPLETED"
    | "CANCELLED"
    | "MISSED"
    | "ABSENT"
    | "REPORTED"
    | "DONE_BUT_MISSING";
  teacherId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FreeTrialSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedSlots: number;
  type: "FREE_TRIAL" | "REGULAR";
}

export interface FreeTrialBooking {
  id: number;
  userId: number;
  kidId?: string;
  sessionId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  session?: FreeTrialSession;
}

export interface Subscription {
  id: string;
  userId: number;
  kidId?: string;
  planName: string;
  frequency: number;
  commitmentType: "MONTHLY" | "THREE_MONTHS" | "SIX_MONTHS";
  creditsPerMonth: number;
  totalCredits: number;
  remainingCredits: number;
  pricePerMonth: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  role: "PARENT" | "ADMIN" | "TEACHER";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  credits?: number;
  kids?: Kid[];
}

export interface Kid {
  id: string;
  userId: number;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  motherTongueProficiency: string;
  englishReadingLevel: string;
  englishSpeakingLevel: string;
  learningDuration: string;
  hobbies: string[];
  avatarUrl?: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}
