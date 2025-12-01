import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { Slot, useRouter } from 'expo-router';


type Ctx = { session: any };
const AuthCtx = createContext<Ctx>({ session: null });
export const useAuth = () => useContext(AuthCtx);


export function AuthProvider({ children }: any) {
const [session, setSession] = useState<any>(null);
const router = useRouter();


useEffect(() => {
supabase.auth.getSession().then(({ data }) => setSession(data.session));
const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
setSession(sess);
if (!sess) router.replace('/login');
});
return () => sub.subscription.unsubscribe();
}, []);


return <AuthCtx.Provider value={{ session }}>{children}</AuthCtx.Provider>;
}