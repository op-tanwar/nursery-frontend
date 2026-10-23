// 📝 USER PROFILE & ACCOUNT TYPE DEFINITIONS

export interface IUserAvatar {
  public_id: string;
  url: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "user" | "nursery" | "admin";
  avatar?: IUserAvatar;
  isActive?: boolean;
  isBlocked?: boolean;
  status?: "Active" | "Suspended" | "Blocked";
  createdAt?: string;
  updatedAt?: string;
}

// Request Payloads
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string; // Base64 or Cloudinary URL string
}

export interface UpdatePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// API Responses
export interface ProfileApiResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
  data?: any; // Extra safety for axios unwrapped data
}