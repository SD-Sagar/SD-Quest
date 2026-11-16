"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { GlobalWorkoutHost } from "@/components/gym/GlobalWorkoutHost";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <GlobalWorkoutHost />
    </Provider>
  );
}

