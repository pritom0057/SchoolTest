"use client"

import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/auth-slice"
import assessmentReducer from "./slices/assessment-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assessment: assessmentReducer,
  },
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
