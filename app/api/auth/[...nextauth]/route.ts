import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user?.email?.toLowerCase();
      console.log("Logging in user with email:", email);
      if (!email) return false;

      const { data } = await supabaseAdmin
        .from("admins")
        .select("email")
        .eq("email", email)
        .single();

      return !!data;
    },

    async jwt({ token, user }) {
      if (user?.email) token.email = user.email.toLowerCase();

      if (!token.email) return token;

      const { data } = await supabaseAdmin
        .from("admins")
        .select("email")
        .eq("email", token.email)
        .single();

      token.role = data ? "admin" : "user";

      return token;
    },

    async session({ session, token }) {
      session.user = session.user ?? {};
      session.user.role = token.role;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
