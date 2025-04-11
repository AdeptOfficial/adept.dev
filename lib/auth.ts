import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { createClient } from '@supabase/supabase-js';

// Supabase server client
const supabase = createClient(
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

      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();

      return !!data;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email.toLowerCase();

        const { data } = await supabase
          .from('admins')
          .select('email')
          .eq('email', token.email)
          .single();

        token.role = data ? 'admin' : 'user';
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
