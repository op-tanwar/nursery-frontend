import { api } from "@/config/api";
import {
  NurseryProfileResponse,
  NurseryActionResponse,
  AllNurseryApplicationsResponse,
  NurseryDocumentsUploadResponse,
  INurseryApplyInput,
  INurseryUpdateInput,
  IReviewApplicationInput,
} from "@/types/index";

export const nurseryProfileService = {
  // 📝 यूजर नर्सरी बनने के लिए अप्लाई करे
  requestNurseryOnboarding: async (data: INurseryApplyInput): Promise<NurseryProfileResponse> => {
    const res: any = await api.post("/nursery-profile/apply", data);
    return res?.data ?? res;
  },

  // 🔍 खुद की नर्सरी प्रोफाइल देखना (Dashboard View)
  getMyNurseryProfile: async (): Promise<NurseryProfileResponse> => {
    const res: any = await api.get("/nursery-profile/profile/me");
    return res?.data ?? res;
  },

  // 🏡 अप्रूव्ड नर्सरी ओनर अपनी डिटेल्स अपडेट करे
  updateNurseryProfileDetails: async (data: INurseryUpdateInput): Promise<NurseryProfileResponse> => {
    const res: any = await api.put("/nursery-profile/profile/me", data);
    return res?.data ?? res;
  },

  // 📄 नर्सरी डॉक्यूमेंट अपलोड करे (KYC / Onboarding)
  uploadNurseryDocuments: async (formData: FormData): Promise<NurseryDocumentsUploadResponse> => {
    const res: any = await api.post("/nursery/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return res?.data ?? res;
  },

  // 🛡️ [ADMIN] स्टेटस के हिसाब से सभी एप्लिकेशन्स देखना (?status=Pending/Approved/Rejected)
  getAllNurseryApplications: async (status: string = "Pending"): Promise<AllNurseryApplicationsResponse> => {
    const res: any = await api.get(`/nursery-profile/admin/applications?status=${status}`);
    return res?.data ?? res;
  },

  // 🛡️ [ADMIN] एप्लीकेशन को अप्रूव या रिजेक्ट करना
  reviewNurseryApplication: async (id: string, reviewData: IReviewApplicationInput): Promise<NurseryActionResponse> => {
    const res: any = await api.put(`/nursery-profile/admin/application/review/${id}`, reviewData);
    return res?.data ?? res;
  },
};