import { Session } from '@supabase/supabase-js';

export function getSession(): Promise<Session | null>;
export function getUserId(): Promise<string | undefined>; 