import { api } from "@/config/api";

interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}

interface LoginPayload {
  email: string;
  password?: string;
}

export interface SocialLoginPayload {
  provider: "google";
  token: string;
  role?: string;
}

export const authService = {
  /**
   * 1. Register User Endpoint
   * URL: /users/register
   */
  registerUser: async (payload: RegisterPayload) => {
    return await api.post("/users/register", payload);
  },

  /**
   * 2. Login User Endpoint
   * URL: /users/login
   */
  loginUser: async (payload: LoginPayload) => {
    return await api.post("/users/login", payload);
  },

  /**
   * 3. Forgot Password Link Trigger
   * URL: /users/password/forgot
   */
  forgotPassword: async (email: string) => {
    return await api.post("/users/password/forgot", { email });
  },

  /**
   * 4. Reset Password Token Endpoint
   * URL: /users/password/reset/:token
   */
  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    return await api.put(`/users/password/reset/${token}`, { password, confirmPassword });
  },

  /**
   * 5. Logout Session Endpoint
   * URL: /users/logout
   */
  logoutUser: async () => {
    return await api.post("/users/logout");
  },

  /**
   * 6. Google OAuth Login Endpoint
   * URL: /auth/social-login
   */
  socialLogin: async (payload: SocialLoginPayload) => {
    return await api.post("/auth/social-login", payload);
  },
};
