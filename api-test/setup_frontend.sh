#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
mkdir -p "$ROOT/src/store/slices" "$ROOT/src/api" "$ROOT/src/app/admin/login"
cat > "$ROOT/src/store/store.ts" <<'TS'
'use client';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import authReducer from './slices/authSlice';
const rootReducer = combineReducers({ auth: authReducer });
const persistConfig = { key: 'root', storage, whitelist: ['auth'] };
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({ reducer: persistedReducer, middleware: (g)=>g({ serializableCheck:false }) });
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
TS
cat > "$ROOT/src/store/Providers.tsx" <<'TSX'
'use client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
TSX
cat > "$ROOT/src/api/client.ts" <<'TS'
import axios from 'axios';
export const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || 'http://localhost:4000/auth';
export const COURSE_BASE = process.env.NEXT_PUBLIC_COURSE_BASE || 'http://localhost:4002/courses';
export const RECO_BASE = process.env.NEXT_PUBLIC_RECO_BASE || 'http://localhost:4001/recommendations';
let _token: string = '';
if (typeof window !== 'undefined') { _token = localStorage.getItem('jwt') || ''; }
export function setToken(t?: string){ _token = t || ''; if (typeof window !== 'undefined'){ if(t) localStorage.setItem('jwt', t); else localStorage.removeItem('jwt'); } }
export function getToken(){ return _token; }
export const http = axios.create();
http.interceptors.request.use((config)=>{ const tok = getToken(); if(tok){ config.headers = config.headers || {}; (config.headers as any).Authorization = `Bearer ${tok}`; } return config; });
TS
cat > "$ROOT/src/api/auth.ts" <<'TS'
import { http, AUTH_BASE, setToken } from './client';
export async function login(username: string, password: string){
  const { data } = await http.post(`${AUTH_BASE}/login`, { username, password });
  if (data?.token) setToken(data.token);
  return data;
}
TS
cat > "$ROOT/src/api/courses.ts" <<'TS'
import { http, COURSE_BASE } from './client';
export async function searchCourses(q: string){
  const { data } = await http.get(`${COURSE_BASE}/search`, { params: { q } });
  return data;
}
TS
cat > "$ROOT/src/api/recommendations.ts" <<'TS'
import { http, RECO_BASE } from './client';
export async function getRecommendations(topics: string[] = [], skillLevel = 'beginner'){
  const { data } = await http.post(`${RECO_BASE}`, { topics, skillLevel });
  return data;
}
TS
cat > "$ROOT/src/store/slices/authSlice.ts" <<'TS'
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
TS
if grep -q "import Providers from '@/src/store/Providers'" "$ROOT/src/app/layout.tsx" 2>/dev/null; then
  sed -i '' "s#@/src/store/Providers#@/store/Providers#g" "$ROOT/src/app/layout.tsx"
fi
if ! grep -q "import Providers from '@/store/Providers';" "$ROOT/src/app/layout.tsx"; then
  perl -0777 -i -pe "s|(import Header from '@/components/header';\n)|\$1import Providers from '@/store/Providers';\n|s" "$ROOT/src/app/layout.tsx"
fi
perl -0777 -i -pe "s#\{children\}#<Providers>{children}</Providers>#s" "$ROOT/src/app/layout.tsx"
cat > "$ROOT/src/app/admin/login/page.tsx" <<'TSX'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Compass, LogIn } from 'lucide-react';
import { useAppDispatch } from '@/store/store';
import { loginThunk } from '@/store/slices/authSlice';
export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const username = email.includes('@') ? email.split('@')[0] : email;
      const action = await dispatch(loginThunk({ username, password }));
      if (action.meta.requestStatus === 'fulfilled') {
        toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
        router.push('/admin/dashboard');
      } else {
        const msg = (action as any).payload || 'Invalid credentials';
        toast({ variant: 'destructive', title: 'Login Failed', description: msg });
      }
    } catch (err:any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: err?.message || 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin} noValidate>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Compass className="h-10 w-10 text-accent" />
              <h1 className="font-headline text-3xl font-bold text-primary">Course Compass</h1>
            </div>
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username or Email</Label>
              <Input id="email" type="text" placeholder="admin or admin@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} required disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
TSX
if [ ! -f "$ROOT/.env.local" ]; then
cat > "$ROOT/.env.local" <<ENV
NEXT_PUBLIC_AUTH_BASE=http://localhost:4000/auth
NEXT_PUBLIC_COURSE_BASE=http://localhost:4002/courses
NEXT_PUBLIC_RECO_BASE=http://localhost:4001/recommendations
ENV
fi
npm i @reduxjs/toolkit react-redux redux-persist axios
rm -rf "$ROOT/.next"
echo "DONE"
echo "Run: npm run dev"
