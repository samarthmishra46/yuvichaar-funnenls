import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          throw new Error('Admin credentials not configured');
        }

        if (
          credentials.email !== adminEmail ||
          credentials.password !== adminPassword
        ) {
          throw new Error('Invalid admin credentials');
        }

        return {
          id: 'admin',
          name: 'Admin',
          email: adminEmail,
          role: 'admin' as const,
        };
      },
    }),

    CredentialsProvider({
      id: 'client-login',
      name: 'Client Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        const org = await Organization.findOne({ email: credentials.email });

        if (!org) {
          throw new Error('No account found with this email');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          org.password
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: org._id.toString(),
          name: org.name,
          email: org.email,
          role: 'client' as const,
          orgId: org._id.toString(),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.orgId = user.orgId;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      session.user.orgId = token.orgId;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
  },

  pages: {
    signIn: '/login', // default sign-in page (client)
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
};
