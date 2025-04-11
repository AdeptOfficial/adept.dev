// lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user?.email;
      if (!email) return false;

      const { data, error } = await supabaseAdmin
        .from('admins')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        console.error('[Auth] Supabase error on signIn:', error.message);
      }

      return !!data;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email.toLowerCase();

        const { data, error } = await supabaseAdmin
          .from('admins')
          .select('email')
          .eq('email', token.email)
          .single();

        token.role = data ? 'admin' : 'user';

        if (error) {
          console.error('[Auth] Supabase error in jwt callback:', error.message);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = session.user ?? {};
      session.user.email = token.email;
      session.user.role = token.role;
      return session;
    },
  },
};
