"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore, AppStoreInstance } from "@/redux/store";

interface StoreProviderProps {
  children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  // Store instance configuration structural check
  const storeRef = useRef<AppStoreInstance | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current.store}>
      {/* PersistGate without full-page blocking loader prevents destroying SSR HTML */}
      <PersistGate
        loading={null}
        persistor={storeRef.current.persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}