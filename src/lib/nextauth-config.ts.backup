import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface ExtendedUser extends User {
  role: string;
  hostId?: string;
  guestId?: string;
  accessToken: string;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    hostId?: string;
    guestId?: string;
  };
  accessToken: string;
}

interface ExtendedJWT extends JWT {
  role: string;
  hostId?: string;
  guestId?: string;
  accessToken: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Temporarily disabled social providers until credentials are configured
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phoneNumber: { label: "Phone Number", type: "text" },
        userType: { label: "User Type", type: "text" }, // host or guest
        otpVerified: { label: "OTP Verified", type: "text" }, // 'true' if OTP was verified
        method: { label: "Auth Method", type: "text" } // 'email' or 'otp'
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          // Handle OTP-verified login (no password required)
          if (credentials?.method === 'otp' && credentials?.otpVerified === 'true') {
            const searchField = credentials.email
              ? { email: credentials.email }
              : { phone: credentials.phoneNumber };

            const user = await (prisma as any).user.findFirst({
              where: searchField
            });

            if (!user) {
              return null;
            }

            // Update last login
            await (prisma as any).user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            });

            return {
              id: user.id,
              email: user.email || '',
              name: `${user.firstName} ${user.lastName}`,
              role: user.userType.toLowerCase(),
              accessToken: 'otp-verified-token'
            };
          }

          // Handle regular email/password or phone/password login
          if (!credentials?.password) {
            return null;
          }

          let user;
          if (credentials.email) {
            // Email + password login
            user = await (prisma as any).user.findUnique({
              where: { email: credentials.email }
            });
          } else if (credentials.phoneNumber) {
            // Phone + password login
            user = await (prisma as any).user.findFirst({
              where: { phone: credentials.phoneNumber }
            });
          } else {
            return null;
          }

          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Update last login
          await (prisma as any).user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          });

          return {
            id: user.id,
            email: user.email || '',
            name: `${user.firstName} ${user.lastName}`,
            role: user.userType.toLowerCase(),
            accessToken: 'password-verified-token'
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedJWT> {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.role;
        token.hostId = extendedUser.hostId;
        token.guestId = extendedUser.guestId;
        token.accessToken = extendedUser.accessToken;
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedJWT;
      const extendedSession = session as ExtendedSession;

      extendedSession.user.id = token.sub!;
      extendedSession.user.role = extendedToken.role;
      extendedSession.user.hostId = extendedToken.hostId;
      extendedSession.user.guestId = extendedToken.guestId;
      extendedSession.accessToken = extendedToken.accessToken;

      return extendedSession;
    },
  },
  // Using default NextAuth pages
  // pages: {
  //   signIn: "/auth/signin",
  //   error: "/auth/error",
  // },
  events: {
    async signOut() {
      // Optional: Call logout endpoint to invalidate token
      // await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`, ...)
    },
  },
};

export default NextAuth(authOptions);