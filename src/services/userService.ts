import { api } from "@/config/api";
import {
  ProfileApiResponse,
  UpdatePasswordPayload,
  UpdateProfilePayload,
} from "@/types/user.types";

export const userService = {
  /**
   * 1. Get Logged-in User Profile
   * URL: GET /users/me
   */
  getUserProfile: async (): Promise<ProfileApiResponse> => {
    const res: any = await api.get("/users/me");
    return res?.data ?? res;
  },

  /**
   * 2. Update User Profile Details / Avatar
   * URL: PUT /users/me/update
   */
  updateUserProfile: async (
    payload: UpdateProfilePayload
  ): Promise<ProfileApiResponse> => {
    const res: any = await api.put("/users/me/update", payload);
    return res?.data ?? res;
  },

  /**
   * 3. Update Password
   * URL: PUT /users/password/update
   */
  updatePassword: async (
    payload: UpdatePasswordPayload
  ): Promise<ProfileApiResponse> => {
    const res: any = await api.put("/users/password/update", payload);
    return res?.data ?? res;
  },

  /**
   * 4. Verify Pending Email Change with 6-digit OTP
   * URL: POST /users/verify-email-change
   */
  verifyEmailChange: async (otp: string): Promise<ProfileApiResponse> => {
    const res: any = await api.post("/users/verify-email-change", { otp });
    return res?.data ?? res;
  },

  /**
   * 5. Resend Email Verification Code
   * URL: POST /users/resend-email-otp
   */
  resendEmailChangeOtp: async (): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.post("/users/resend-email-otp");
    return res?.data ?? res;
  },
};