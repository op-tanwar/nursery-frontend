import { api } from "@/config/api";

export interface Subscriber {
  _id: string;
  email: string;
  status: "active" | "unsubscribed";
  isActive: boolean;
  subscribedAt: string;
}

export interface SubscribersResponse {
  success: boolean;
  count: number;
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedSubscribers: number;
  currentPage: number;
  totalPages: number;
  subscribers: Subscriber[];
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  alreadySubscribed?: boolean;
  message: string;
}

export const newsletterService = {
  /**
   * Subscribe an email address to the newsletter
   */
  subscribe: async (email: string): Promise<NewsletterSubscribeResponse> => {
    const res: any = await api.post("/newsletter/subscribe", { email: email.trim().toLowerCase() });
    return res?.data ?? res;
  },

  /**
   * Unsubscribe from the newsletter
   */
  unsubscribe: async (email: string, token?: string): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.post("/newsletter/unsubscribe", { email, token });
    return res?.data ?? res;
  },

  /**
   * Get paginated subscribers for Admin Panel with search and filters
   */
  getSubscribers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<SubscribersResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.status && params.status !== "all") query.append("status", params.status);

    const queryString = query.toString();
    const url = queryString ? `/newsletter/subscribers?${queryString}` : "/newsletter/subscribers";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  /**
   * Delete subscriber by ID (Admin)
   */
  deleteSubscriber: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.delete(`/newsletter/subscribers/${id}`);
    return res?.data ?? res;
  },

  /**
   * Toggle or set status (active / unsubscribed) for subscriber (Admin)
   */
  toggleSubscriberStatus: async (
    id: string,
    status?: "active" | "unsubscribed"
  ): Promise<{ success: boolean; message: string; subscriber: Subscriber }> => {
    const res: any = await api.patch(`/newsletter/subscribers/${id}`, { status });
    return res?.data ?? res;
  },

  /**
   * Download CSV export file
   */
  exportSubscribersCSV: async (search?: string, status?: string) => {
    const query = new URLSearchParams();
    query.append("export", "csv");
    if (search) query.append("search", search);
    if (status && status !== "all") query.append("status", status);

    const url = `/newsletter/subscribers?${query.toString()}`;
    const res: any = await api.get(url, { responseType: "blob" });

    // Handle blob download in browser
    const blob = new Blob([res], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `urban-nursery-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Submit Contact Us inquiry
   */
  submitContactInquiry: async (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.post("/users/contact", payload);
    return res?.data ?? res;
  },
};

export default newsletterService;
