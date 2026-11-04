import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import nurseryReducer from "./slices/nurserySlice";
import adminProductReducer from "./slices/adminProductSlice";
import userReducer from "./slices/userSlice";
import nurseryProfileReducer from "./slices/nurseryProfileSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import orderReducer from "./slices/orderSlice";
import paymentReducer from "./slices/paymentSlice";
import dashboardReducer from "./slices/dashboardSlice";
import blogReducer from "./slices/blogSlice";
import vendorReducer from "./slices/vendorSlice";

// 🌿 UNIFIED CATALOG REDUCER
import productReducer from "./slices/productSlice";

// 1. Root Reducer combining unified store
const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  adminProduct: adminProductReducer,
  nursery: nurseryReducer,
  user: userReducer,
  nurseryProfile: nurseryProfileReducer,
  // 🌟 Unified polymorphic product store
  product: productReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  order: orderReducer,
  payment: paymentReducer,
  dashboard: dashboardReducer,
  blog: blogReducer,
  vendor: vendorReducer,
});

// 2. Persist Configuration Setup
const persistConfig = {
  key: "urban_nursery_root",
  storage,
  whitelist: ["auth"], // Dynamically fetched data components remain unpersisted
};

// 3. Persisted Reducer build-up
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configured Store Initialization Engine
export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: process.env.NODE_ENV !== "production",
  });

  const persistor = persistStore(store);
  return { store, persistor };
};

// Types definitions mapping for enterprise scale access controllers
export type AppStoreInstance = ReturnType<typeof makeStore>;
export type AppStore = AppStoreInstance["store"];

// 👑 RootState mapped directly to rootReducer to retain underlying types accurately
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
