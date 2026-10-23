This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


src/
├── app/                            # 🚀 NEXT.JS APP ROUTER CORE
│   ├── (customer)/                 # 🛒 CUSTOMER WEBSITE ROUTE GROUP (URL mein show nahi hoga)
│   │   ├── layout.tsx              # Customer site ka global header/footer layout
│   │   ├── page.tsx                # Customer Home Landing Page
│   │   ├── plants/                 # Product Archive
│   │   │   ├── page.tsx
│   │   │   └── [slug]/             # Dynamic Single Product Page
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   └── blogs/
│   │       ├── page.tsx
│   │       └── [slug]/
│   │
│   ├── (auth)/                     # 🛡️ AUTHENTICATION SYSTEM (Shared across all)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── nursery/                    # 🏡 NURSERY SELLER DASHBOARD (URL: /nursery/dashboard)
│   │   ├── layout.tsx              # Nursery specific Sidebar + Navbar Layout
│   │   ├── page.tsx                # Nursery Dashboard Overview (Analytics Charts)
│   │   ├── products/               # Nursery Specific Plants Management
│   │   │   ├── page.tsx            # View own products list
│   │   │   └── add/                # Add new plant form
│   │   └── orders/                 # Customer orders assigned to this nursery
│   │       └── page.tsx
│   │
│   └── admin/                      # 👑 SUPER ADMIN DASHBOARD (URL: /admin/dashboard)
│       ├── layout.tsx              # Admin specific Sidebar + Master Layout
│       ├── page.tsx                # Business intelligence metrics main panel
│       ├── applications/           # Nursery onboarding requests review panel
│       │   └── page.tsx
│       ├── users/                  # All users database view
│       │   └── page.tsx
│       └── coupons/                # Create/Manage Coupons system
│           └── page.tsx
│
├── components/                     # 🧱 REUSABLE UI BLOCKS SYSTEM
│   ├── ui/                         # Atoms: Global basic design elements (Figma tokens)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Spinner.tsx
│   ├── customer/                   # Molecules/Organisms: Only for Customer view
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ProductCard.tsx
│   ├── nursery/                    # Molecules/Organisms: Only for Nursery Panel
│   │   ├── NurserySidebar.tsx
│   │   └── StockUpdateModal.tsx
│   └── admin/                      # Molecules/Organisms: Only for Super Admin Panel
│       ├── AdminSidebar.tsx
│       └── ApplicationRow.tsx
│
├── config/                         # ⚙️ GLOBAL NETWORK INTERFACE
│   └── api.ts                      # Axios instance with credentials configuration
│
├── context/                        # 🗄️ GLOBAL STATES MANAGEMENTS (Or use Redux Slices)
│   ├── AuthContext.tsx             # Shared Session management (User/Nursery/Admin hooks)
│   ├── CartContext.tsx             # Client-side cart sync stack
│   └── ThemeContext.tsx            # Optional Look & Feel manager
│
├── hooks/                          # 🎣 CUSTOM CORE TRIGGERS
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useRazorpay.ts              # Custom hook to load payment trigger script seamlessly
│
├── middleware.tsx                  # 🛡️ SECURITY GUARD: Route Protection (Admin/Nursery Authorization checks)
│
├── services/                       # 📡 API LAYER (Clean queries decoupling)
│   ├── authService.ts
│   ├── productService.ts
│   └── adminService.ts
│
└── types/                          #  STRICT TYPESCRIPT DATA TYPE DEFINITIONS
    ├── index.ts                    # Global shared entities
    ├── product.types.ts
    └── order.types.ts