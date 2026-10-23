import React from "react";
const announcements = [
  "🌿 Buy Any 4 Plants @ ₹1,199",
  "🎉 Get 10% OFF Above ₹1,499 | Code: URBANNURSERY10",
  "🚚 Free Express Shipping Above ₹499",
  "🏡 Fresh Plants Delivered From Local Nurseries",
  "🛡️ 14-Day Healthy Plant Guarantee",
  "🎁 FREE Ceramic Pot on Orders Above ₹1,999",
];

export const TopBar = () => {
  return (
    <div className="w-full bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-emerald-50 text-xs sm:text-sm py-2 overflow-hidden border-b border-emerald-700/50 select-none">
      <div className="flex w-full overflow-hidden">
        {/* Track 1 */}
        <div className="animate-marquee whitespace-nowrap flex items-center shrink-0 w-full justify-around">
          {announcements.map((text, index) => (
            <span key={index} className="mx-4 sm:mx-5 font-medium inline-flex items-center shrink-0">
              {text}
            </span>
          ))}
        </div>

        {/* Track 2 (Duplicate for Seamless Loop) */}
        <div className="animate-marquee whitespace-nowrap flex items-center shrink-0 w-full justify-around" aria-hidden="true">
          {announcements.map((text, index) => (
            <span key={`dup-${index}`} className="mx-4 sm:mx-5 font-medium inline-flex items-center shrink-0">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
//   --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
//   --font-mono: var(--font-geist-mono), ui-monospace, monospace;

//   /* Tailwind Utility Animation Binding */
//   --animate-marquee: marquee 25s linear infinite;
// }

// /* Standard CSS Keyframes for Marquee */
// @keyframes marquee {
//   0% {
//     transform: translateX(0%);
//   }

//   100% {
//     transform: translateX(-100%);
//   }
// }

// .animate-marquee {
//   animation: marquee 25s linear infinite;
//   will-change: transform;
// }

// .animate-marquee:hover {
//   animation-play-state: paused;
// }
