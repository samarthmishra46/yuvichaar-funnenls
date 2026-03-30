import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'admin' | 'client';
      orgId?: string;
      name: string;
      email: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'admin' | 'client';
    orgId?: string;
    name: string;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'client';
    orgId?: string;
    name: string;
    email: string;
  }
}
