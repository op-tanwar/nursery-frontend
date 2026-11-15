"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MapPin, AlertCircle, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openPincodeModal, closePincodeModal } from "@/redux/slices/uiSlice";

interface PincodeModalProps {
  readonly showPincodeModal?: boolean;
  readonly setShowPincodeModal?: (val: boolean) => void;
}

export default function PincodeModal({
  showPincodeModal: controlledOpen,
  setShowPincodeModal: setControlledOpen,
}: PincodeModalProps = {}) {
  const dispatch = useAppDispatch();
  const reduxOpen = useAppSelector((state) => state.ui?.isPincodeModalOpen ?? false);

  // If controlled via props, respect that; otherwise respect global Redux state
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : reduxOpen;

  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();

  // 🛡️ Idempotent dismissal: persists across this session
  const handleCloseModal = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pincode_prompt_dismissed", "true");
      sessionStorage.setItem("pincode_prompt_shown", "true");
    }
    if (isControlled && setControlledOpen) {
      setControlledOpen(false);
    }
    dispatch(closePincodeModal());
  }, [dispatch, isControlled, setControlledOpen]);

  // 1. Universal window event listener so any button can trigger open
  useEffect(() => {
    const handleOpen = () => {
      if (isControlled && setControlledOpen) {
        setControlledOpen(true);
      }
      dispatch(openPincodeModal());
    };
    window.addEventListener("open-pincode-modal", handleOpen);
    return () => window.removeEventListener("open-pincode-modal", handleOpen);
  }, [dispatch, isControlled, setControlledOpen]);

  // 2. Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleCloseModal]);

  // 3. Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // 4. Auto-open on scroll: AT MOST ONCE per session if no pincode is saved
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPincode = localStorage.getItem("hyperlocal_pincode");
    const isDismissed = sessionStorage.getItem("pincode_prompt_dismissed");
    const hasShown = sessionStorage.getItem("pincode_prompt_shown");

    // If pincode is already set or user has already dismissed/seen prompt this session, NEVER auto-open
    if (savedPincode || isDismissed || hasShown) {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 300) {
        sessionStorage.setItem("pincode_prompt_shown", "true");
        if (isControlled && setControlledOpen) {
          setControlledOpen(true);
        }
        dispatch(openPincodeModal());
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, dispatch, isControlled, setControlledOpen]);

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("hyperlocal_pincode", pincode);
      sessionStorage.setItem("pincode_prompt_shown", "true");
      sessionStorage.setItem("pincode_prompt_dismissed", "true");
      window.dispatchEvent(new CustomEvent("pincode-changed", { detail: pincode }));
    }

    if (isControlled && setControlledOpen) {
      setControlledOpen(false);
    }
    dispatch(closePincodeModal());
    setError("");
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleCloseModal}
      role="dialog"
      aria-modal="true"
      aria-label="Enter Delivery Pincode"
    >
      <div
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseModal}
          type="button"
          className="absolute top-4 right-4 bg-transparent border-none text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1 transition-colors rounded-lg flex items-center justify-center"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold tracking-tight m-0 mb-1 text-slate-900">
            Enter Delivery Pincode
          </h2>
          <p className="text-slate-500 text-xs m-0 mb-5 leading-relaxed font-medium">
            Enter your pincode to explore fresh stock near you from Indore's certified nurseries, or skip to view all products.
          </p>
        </div>

        <form onSubmit={handlePincodeSubmit} className="flex flex-col gap-3">
          <div>
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ""));
                if (error) setError("");
              }}
              placeholder="e.g. 452001"
              autoFocus
              className="w-full text-center tracking-widest bg-emerald-50/50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal"
            />
            {error && (
              <p className="text-rose-600 text-[11px] font-semibold mt-1.5 text-center m-0 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 active:scale-95"
          >
            Search and Proceed
          </button>

          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full bg-transparent text-slate-500 hover:text-slate-800 py-1.5 px-4 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all mt-1"
          >
            Continue without Pincode (View all products)
          </button>
        </form>
      </div>
    </div>
  );
}
