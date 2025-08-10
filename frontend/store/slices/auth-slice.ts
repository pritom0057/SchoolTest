import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import * as api from "@/lib/api"
import { hydrateAssessment, setLockedStep1 } from "@/store/slices/assessment-slice"

export type Role = "STUDENT" | "ADMIN" | "SUPERVISOR"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  verified: boolean
}

type AuthState = {
  user: User | null
  accessToken?: string | null
  refreshToken?: string | null
  isAuthenticated: boolean
  emailJustRegistered?: string | null
  status?: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  emailJustRegistered: null,
  status: 'idle',
  error: null,
}

// Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email: string; password: string; phone?: string }, { rejectWithValue }) => {
    try {
      const res = await api.registerUser(payload)
      return { email: payload.email, server: res }
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Registration failed')
    }
  }
)

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await api.verifyOtp(payload.email, payload.otp)
      return { email: payload.email, server: res }
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Verification failed')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.login(payload.email, payload.password)
      // Fetch profile after login
      const me = await api.me()
      try {
        const locked = !!me?.data?.step1LockedAt
        // @ts-ignore
        dispatch(setLockedStep1(locked))
        const eligibleStep = (me?.data?.assessment?.eligibleStep as any) ?? 1
        const highestLevel = (me?.data?.assessment?.highestLevel as any) ?? undefined
        dispatch(hydrateAssessment({
          progress: { lockedStep1: locked, eligibleStep },
          highestLevel,
        } as any))
      } catch { }
      return { accessToken: res.accessToken as string, me }
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Login failed')
    }
  }
)

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue, dispatch }) => {
  try {
    const me = await api.me()
    try {
      const locked = !!me?.data?.step1LockedAt
      // @ts-ignore
      dispatch(setLockedStep1(locked))
      const eligibleStep = (me?.data?.assessment?.eligibleStep as any) ?? 1
      const highestLevel = (me?.data?.assessment?.highestLevel as any) ?? undefined
      dispatch(hydrateAssessment({
        progress: { lockedStep1: locked, eligibleStep },
        highestLevel,
      } as any))
    } catch { }
    return me
  } catch (e: any) {
    return rejectWithValue(e?.message ?? 'Failed to fetch profile')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.logout()
  return true
})

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<Partial<AuthState>>) {
      return { ...state, ...action.payload }
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.accessToken = null
      state.refreshToken = null
      state.error = null
      state.status = 'idle'
    },
    setRole(state, action: PayloadAction<Role>) {
      if (state.user) {
        state.user.role = action.payload
      }
    },
    updateProfile(state, action: PayloadAction<{ name?: string }>) {
      if (state.user && action.payload.name) {
        state.user.name = action.payload.name
      }
    },
  },
  extraReducers: (builder) => {
    // register
    builder.addCase(registerUser.pending, (state) => {
      state.status = 'loading'
      state.error = null
    })
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.emailJustRegistered = action.payload.email
      state.isAuthenticated = false
      state.user = null
    })
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed'
      state.error = (action.payload as string) ?? 'Registration failed'
    })

    // verify otp
    builder.addCase(verifyOtp.pending, (state) => {
      state.status = 'loading'
      state.error = null
    })
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.status = 'succeeded'
      // After verification, user can login; clear the prompt flag
      state.emailJustRegistered = null
    })
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.status = 'failed'
      state.error = (action.payload as string) ?? 'Verification failed'
    })

    // login
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading'
      state.error = null
    })
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.isAuthenticated = true
      state.accessToken = action.payload.accessToken
      state.user = action.payload.me?.data
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed'
      state.error = (action.payload as string) ?? 'Login failed'
      state.isAuthenticated = false
    })

    // fetchMe
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload?.data ?? null
    })

    // logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.isAuthenticated = false
      state.accessToken = null
      state.refreshToken = null
      state.status = 'idle'
      state.error = null
    })
  },
})

export const { hydrateAuth, logout, setRole, updateProfile } = authSlice.actions
export default authSlice.reducer
