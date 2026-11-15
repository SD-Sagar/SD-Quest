import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import playerReducer from "./slices/playerSlice";
import questReducer from "./slices/questSlice";
import workoutReducer from "./slices/workoutSlice";
import hydrationReducer from "./slices/hydrationSlice";
import bodyReducer from "./slices/bodySlice";
import nutritionReducer from "./slices/nutritionSlice";
import calendarReducer from "./slices/calendarSlice";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    quests: questReducer,
    workout: workoutReducer,
    hydration: hydrationReducer,
    body: bodyReducer,
    nutrition: nutritionReducer,
    calendar: calendarReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
