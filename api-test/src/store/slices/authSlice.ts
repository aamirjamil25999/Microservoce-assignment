'use client';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as apiLogin } from '@/api/auth';
type AuthState = { token: string | null; status: 'idle' | 'loading' | 'succeeded' | 'failed'; error?: string | null; };
const initialState: AuthState = { token: null, status: 'idle', error: null };
export const loginThunk = createAsyncThunk('auth/login', async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
  try { const res = await apiLogin(username, password); return res?.token as string; }
  catch(e:any){ return rejectWithValue(e?.response?.data?.msg || 'Login failed'); }
});
const authSlice = createSlice({
  name:'auth', initialState,
  reducers:{ logout(s){s.token=null;}, setToken(s,a){s.token=a.payload;} },
  extraReducers:(b)=>{
    b.addCase(loginThunk.pending,(s)=>{s.status='loading'; s.error=null;});
    b.addCase(loginThunk.fulfilled,(s,a)=>{s.status='succeeded'; s.token=a.payload;});
    b.addCase(loginThunk.rejected,(s,a)=>{s.status='failed'; s.error=(a.payload as string)||'Login failed';});
  }
});
export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
