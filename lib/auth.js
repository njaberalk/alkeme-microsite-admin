import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

const allowedEmails = (process.env.ALLOWED_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (allowedEmails.length === 0) return true;
      return allowedEmails.includes(user.email?.toLowerCase());
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
