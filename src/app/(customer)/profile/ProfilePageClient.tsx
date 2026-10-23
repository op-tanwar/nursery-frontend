"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { userService } from "@/services/userService";
import {
  setUserLoading,
  setUserProfile,
  setUserError,
} from "@/redux/slices/userSlice";

export default function UserProfilePage() {
  const dispatch = useAppDispatch();

  // Safe selector extraction matching RootState
  const userState = useAppSelector((state) => state?.user);
  const profile = userState?.profile || null;
  const isLoading = userState?.isLoading || false;
  const globalError = userState?.error || null;

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarBase64, setAvatarBase64] = useState<string>("");

  // Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Status Alerts
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const hasFetched = useRef(false);

  // Fetch Logged-in User Profile
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchProfile = async () => {
      dispatch(setUserLoading(true));
      try {
        const response = await userService.getUserProfile();

        // Handling both response structures safely
        const userData = response?.user || (response as any)?.data?.user;

        if (userData) {
          dispatch(setUserProfile(userData));
          hasFetched.current = true;
        } else {
          dispatch(setUserError("Profile data could not be parsed from API."));
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch user profile.";
        dispatch(setUserError(message));
      }
    };

    fetchProfile();
  }, [dispatch]);

  // Sync state data to input fields
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAvatarPreview(
        profile.avatar?.url ||
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
      );
    }
  }, [profile]);

  // Image Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          const result = reader.result as string;
          setAvatarPreview(result);
          setAvatarBase64(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Profile Updates
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    dispatch(setUserError(""));
    setIsUpdatingProfile(true);

    try {
      const payload: { name: string; email: string; avatar?: string } = {
        name,
        email,
      };

      if (avatarBase64) {
        payload.avatar = avatarBase64;
      }

      const response = await userService.updateUserProfile(payload);
      const updatedUser = response?.user || (response as any)?.data?.user;

      if (updatedUser) {
        dispatch(setUserProfile(updatedUser));
        setProfileSuccessMsg("Profile updated successfully!");
        setAvatarBase64("");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile.";
      dispatch(setUserError(message));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Submit Password Updates
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg("");
    setPasswordErrorMsg("");

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await userService.updatePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordSuccessMsg(
        response?.message || "Password updated successfully!"
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password.";
      setPasswordErrorMsg(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-12 pt-32 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* HERO SECTION */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4 select-none">
              👤 Account Settings • Role: {profile?.role || "User"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">
              My Profile
            </h1>
            <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed opacity-90">
              Manage your personal information, profile photo, and password securely.
            </p>
          </div>
        </div>

        {/* LOADING SHIMMER */}
        {isLoading && (
          <div className="bg-panel border border-line rounded-2xl p-8 space-y-6 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-line rounded-full shrink-0"></div>
              <div className="space-y-3 flex-1">
                <div className="h-5 bg-line rounded w-1/3"></div>
                <div className="h-4 bg-line rounded w-1/4"></div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AVATAR & USER SUMMARY CARD */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-panel border border-line rounded-2xl p-6 text-center shadow-xs">
                <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-2 border-brand-primary shadow-sm group">
                  <Image
                    src={
                      avatarPreview ||
                      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
                    }
                    alt={name || "User Avatar"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/50 text-white text-xs font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Change
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <h3 className="text-lg font-bold text-foreground m-0 truncate">
                  {profile?.name || "User Name"}
                </h3>
                <p className="text-xs text-muted-text mt-1 mb-3 truncate">
                  {profile?.email}
                </p>

                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-light text-brand-dark border border-brand-light/50 capitalize mb-6">
                  {profile?.role || "user"}
                </span>

                {/* QUICK LINKS SECTION */}
                <div className="border-t border-line pt-4 space-y-2 text-left">
                  <p className="text-[11px] font-bold text-muted-text uppercase tracking-wider mb-2 px-2">
                    Quick Navigation
                  </p>

                  <Link
                    href="/cart"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-background hover:bg-line/40 text-xs font-medium text-foreground transition-colors border border-line/50"
                  >
                    <span className="flex items-center gap-2">
                      🛒 My Cart
                    </span>
                    <span className="text-muted-text">→</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-background hover:bg-line/40 text-xs font-medium text-foreground transition-colors border border-line/50"
                  >
                    <span className="flex items-center gap-2">
                      ❤️ Wishlist
                    </span>
                    <span className="text-muted-text">→</span>
                  </Link>

                  <Link
                    href="/orders/me"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-background hover:bg-line/40 text-xs font-medium text-foreground transition-colors border border-line/50"
                  >
                    <span className="flex items-center gap-2">
                      📦 My Orders
                    </span>
                    <span className="text-muted-text">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* UPDATE FORMS */}
            <div className="lg:col-span-2 space-y-8">
              {/* EDIT PROFILE */}
              <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Personal Details
                </h2>

                {globalError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs mb-6">
                    {globalError}
                  </div>
                )}

                {profileSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs mb-6">
                    {profileSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-line text-sm text-foreground focus:outline-none focus:border-brand-primary"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-line text-sm text-foreground focus:outline-none focus:border-brand-primary"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              </div>

              {/* UPDATE PASSWORD */}
              <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Change Password
                </h2>

                {passwordErrorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs mb-6">
                    {passwordErrorMsg}
                  </div>
                )}

                {passwordSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs mb-6">
                    {passwordSuccessMsg}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-background border border-line text-sm text-foreground focus:outline-none focus:border-brand-primary"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-background border border-line text-sm text-foreground focus:outline-none focus:border-brand-primary"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-background border border-line text-sm text-foreground focus:outline-none focus:border-brand-primary"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingPassword
                        ? "Updating..."
                        : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}