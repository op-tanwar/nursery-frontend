"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setNurseryLoading,
  setNurseryError,
  setMyNurseryProfileData,
  updateMyNurseryProfileSuccess,
  clearNurseryMutationFlags,
} from "@/redux/slices/nurseryProfileSlice";
import { nurseryProfileService } from "@/services/nurseryProfileService";
import { INurseryUpdateInput } from "@/types";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ShieldCheck,
  Globe,
  Truck,
} from "lucide-react";

export default function MyNurseryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { myProfile, isLoading, error, mutationSuccess, actionMessage } =
    useAppSelector((state) => state.nurseryProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<INurseryUpdateInput>({});

  useEffect(() => {
    const initProfileFetch = async () => {
      try {
        dispatch(setNurseryLoading(true));
        const res = await nurseryProfileService.getMyNurseryProfile();
        if (res.success) {
          dispatch(setMyNurseryProfileData(res.profile));
        }
      } catch (err: any) {
        dispatch(
          setNurseryError(
            err?.response?.data?.message ||
            "Downstream cluster connectivity error."
          )
        );
      }
    };

    initProfileFetch();

    return () => {
      dispatch(clearNurseryMutationFlags());
    };
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      setFormData({
        businessName: myProfile.businessName || "",
        businessEmail: myProfile.businessEmail || "",
        businessPhone: myProfile.businessPhone || "",
        gstin: myProfile.gstin || "",
        panNumber: myProfile.panNumber || "",
        businessAddress: {
          address: myProfile.businessAddress?.address || "",
          city: myProfile.businessAddress?.city || "",
          state: myProfile.businessAddress?.state || "",
          pinCode: myProfile.businessAddress?.pinCode || "",
          country: myProfile.businessAddress?.country || "India",
        },
        bankDetails: {
          accountHolderName: myProfile.bankDetails?.accountHolderName || "",
          accountNumber: "",
          ifscCode: "",
          bankName: myProfile.bankDetails?.bankName || "",
        },
      });
    }
  }, [myProfile, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedInputChange = (
    section: "businessAddress" | "bankDetails",
    field: string,
    value: string
  ) => {
    const nextValue =
      section === "businessAddress" && field === "pinCode"
        ? value.replace(/\D/g, "").slice(0, 6)
        : value;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, string> | undefined),
        [field]: nextValue,
      },
    }));
  };

  const handleProfileSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    const pinCode = formData.businessAddress?.pinCode?.trim() || "";
    if (pinCode && !/^[1-9][0-9]{5}$/.test(pinCode)) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    const loadingToast = toast.loading("Updating profile details...");

    try {
      dispatch(setNurseryLoading(true));

      // 1. Create a shallow copy of the formData
      const payload: INurseryUpdateInput = { ...formData };

      // 2. Safely structure bank details
      if (payload.bankDetails) {
        payload.bankDetails = {
          accountHolderName: payload.bankDetails.accountHolderName || "",
          bankName: payload.bankDetails.bankName || "",
          accountNumber: payload.bankDetails.accountNumber || "",
          ifscCode: payload.bankDetails.ifscCode || "",
        };
      }

      const res = await nurseryProfileService.updateNurseryProfileDetails(
        payload
      );

      if (res.success) {
        dispatch(
          updateMyNurseryProfileSuccess({
            profile: res.profile,
            message: res.message || "Profile updated successfully.",
          })
        );
        toast.success("Nursery profile updated live!", { id: loadingToast });
        setIsEditing(false);
      }
    } catch (err: any) {
      const targetErr =
        err?.response?.data?.message || "Failed to update nursery profile.";
      dispatch(setNurseryError(targetErr));
      toast.error(targetErr, { id: loadingToast });
    }
  };

  if (isLoading && !myProfile) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-slate-500">
            Loading Nursery Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 text-center bg-white border border-slate-200/90 rounded-3xl shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          Nursery Profile Not Found
        </h3>
        <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
          No registered nursery profile associated with this account. Please complete your onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all">
        <div className="flex items-center gap-4">
          <Link
            href="/nursery/dashboard"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl transition-all cursor-pointer active:scale-95"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                {isEditing ? "Edit Nursery Profile" : myProfile.businessName}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${myProfile.approvalStatus === "Approved"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  : myProfile.approvalStatus === "Rejected"
                    ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                    : "bg-amber-50 text-amber-700 border border-amber-200/80"
                  }`}
              >
                {myProfile.approvalStatus === "Approved" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {myProfile.approvalStatus}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1 m-0">
              Manage core business details, compliance numbers, and delivery coverage.
            </p>
          </div>
        </div>

        {myProfile.approvalStatus === "Approved" && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 ${isEditing
              ? "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/20"
              }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" /> Cancel Edit
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" /> Edit Profile
              </>
            )}
          </button>
        )}
      </div>

      {/* Rejection Alert Banner */}
      {myProfile.approvalStatus === "Rejected" && myProfile.rejectionReason && (
        <div className="flex items-start gap-3.5 bg-rose-50/80 border border-rose-200/90 p-4 sm:p-5 rounded-2xl text-rose-800 text-xs font-semibold shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="uppercase tracking-wider font-extrabold text-rose-900 block">
              Application Status Notice:
            </span>
            <p className="m-0 text-rose-800/90 font-medium leading-relaxed">
              {myProfile.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Profile Form Container */}
      <form onSubmit={handleProfileSubmission}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Contact Information */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3.5 m-0">
                <Building2 className="w-4 h-4 text-emerald-600" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    Business / Nursery Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    disabled={!isEditing}
                    value={
                      isEditing ? formData.businessName : myProfile.businessName
                    }
                    onChange={handleInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    Business Email
                  </label>
                  <input
                    type="email"
                    name="businessEmail"
                    required
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.businessEmail
                        : myProfile.businessEmail
                    }
                    onChange={handleInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    name="businessPhone"
                    required
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.businessPhone
                        : myProfile.businessPhone
                    }
                    onChange={handleInputChange}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3.5 m-0">
                <MapPin className="w-4 h-4 text-emerald-600" /> Physical Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600">
                    Street Address
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.businessAddress?.address
                        : myProfile.businessAddress?.address
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "businessAddress",
                        "address",
                        e.target.value
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    City
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.businessAddress?.city
                        : myProfile.businessAddress?.city
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "businessAddress",
                        "city",
                        e.target.value
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    State
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.businessAddress?.state
                        : myProfile.businessAddress?.state
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "businessAddress",
                        "state",
                        e.target.value
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-emerald-800">
                    Primary PIN Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.businessAddress?.pinCode
                        : myProfile.businessAddress?.pinCode
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "businessAddress",
                        "pinCode",
                        e.target.value
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-emerald-200 text-xs bg-emerald-50/30 font-mono font-bold text-emerald-900 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:border-slate-200 disabled:text-slate-800 transition-all"
                  />
                  {isEditing && (
                    <p className="text-[10px] text-slate-400 m-0">
                      Modifying this regenerates service coverage pincodes automatically.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value={myProfile.businessAddress?.country || "India"}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100/80 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Banking Settlement Details */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3.5 m-0">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Bank Payout Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.bankDetails?.accountHolderName
                        : myProfile.bankDetails?.accountHolderName
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bankDetails",
                        "accountHolderName",
                        e.target.value
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.bankDetails?.bankName
                        : myProfile.bankDetails?.bankName
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bankDetails",
                        "bankName",
                        e.target.value
                      )
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-600 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    Account Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.bankDetails?.accountNumber
                        : myProfile.bankDetails?.accountNumber
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bankDetails",
                        "accountNumber",
                        e.target.value
                      )
                    }
                    placeholder={
                      isEditing ? "Enter new account number..." : "•••• •••• ••••"
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tracking-wider bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-800 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.bankDetails?.ifscCode
                        : myProfile.bankDetails?.ifscCode
                    }
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bankDetails",
                        "ifscCode",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder={
                      isEditing ? "e.g. SBIN0001234" : "••••••••"
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase tracking-widest bg-slate-50/50 text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-80 disabled:bg-slate-50/80 disabled:text-slate-800 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Side Right Column */}
          <div className="space-y-6">
            {/* Compliance Protocols Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 m-0">
                <FileText className="w-4 h-4 text-emerald-600" /> GST & PAN Compliance
              </h2>

              <div className="space-y-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    GSTIN Identifier
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.gstin
                        : myProfile.gstin || "Not Provided"
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gstin: e.target.value.toUpperCase(),
                      }))
                    }
                    className="px-3 py-2 border border-slate-200 text-xs font-mono uppercase tracking-wider rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50/80 disabled:text-slate-700 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={
                      isEditing
                        ? formData.panNumber
                        : myProfile.panNumber || "Not Provided"
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        panNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    className="px-3 py-2 border border-slate-200 text-xs font-mono uppercase tracking-wider rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50/80 disabled:text-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Service Area & Coverage Pincodes */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
                  <Truck className="w-4 h-4 text-emerald-600" /> Delivery Coverage
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 m-0">
                  Automatically generated from primary PIN code.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide m-0">
                    Base Pincode
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-800 m-0 mt-0.5">
                    {myProfile.businessAddress?.pinCode || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide m-0">
                    Service Radius
                  </p>
                  <p className="text-xs font-bold text-slate-800 m-0 mt-0.5">
                    {myProfile.serviceRadiusKm ?? 12} km
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider m-0">
                  Active Service PIN Codes ({myProfile.deliveryPincodes?.length || 0})
                </p>

                {myProfile.deliveryPincodes &&
                  myProfile.deliveryPincodes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {myProfile.deliveryPincodes.map((pincode) => (
                      <span
                        key={pincode}
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 border rounded-lg shadow-2xs ${pincode === myProfile.businessAddress?.pinCode
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-white border-slate-200/90 text-slate-700"
                          }`}
                      >
                        {pincode}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-[11px] text-slate-400 font-medium leading-relaxed">
                    No coverage pincodes generated yet. Enter a valid primary PIN code and save changes.
                  </div>
                )}
              </div>
            </div>

            {/* Commit Form Action Button */}
            {isEditing && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl border-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all duration-150 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}