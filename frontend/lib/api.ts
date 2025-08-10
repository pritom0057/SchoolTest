// Simple API client that uses access token in memory and refresh via HttpOnly cookie
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

async function refresh() {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    const res = await fetch(`${base}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    accessToken = data.accessToken;
    return accessToken;
}

export async function apiFetch(input: string, init: RequestInit = {}) {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    const url = input.startsWith('http') ? input : `${base}${input}`;
    const headers = new Headers(init.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    const res = await fetch(url, { ...init, headers, credentials: 'include' });
    if (res.status !== 401) return res;
    // try refresh once
    try {
        await refresh();
    } catch {
        // give up
        return res;
    }
    // retry original request with new access token
    const retryHeaders = new Headers(init.headers || {});
    if (accessToken) retryHeaders.set('Authorization', `Bearer ${accessToken}`);
    return fetch(url, { ...init, headers: retryHeaders, credentials: 'include' });
}

export async function login(email: string, password: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    const res = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
    });
    if (!res.ok) {
        try {
            const err = await res.json();
            const msg = err?.error || err?.message || 'Login failed';
            throw new Error(msg);
        } catch {
            throw new Error('Login failed');
        }
    }
    const data = await res.json();
    accessToken = data.accessToken;
    return data;
}

export async function logout() {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    await fetch(`${base}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    accessToken = null;
}

export async function registerUser(payload: { name: string; email: string; password: string; phone?: string }) {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    const res = await fetch(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Register failed');
    return res.json();
}

export async function verifyOtp(email: string, otp: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE;
    const res = await fetch(`${base}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
    });
    if (!res.ok) throw new Error('OTP verification failed');
    return res.json();
}

export async function me() {
    const res = await apiFetch('/api/users/me');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}
