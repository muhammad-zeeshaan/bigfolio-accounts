import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import User from "@/models/User";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTHCLINTID as string,
      clientSecret: process.env.AUTHCLINTSECRETID as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing credentials");
        }

        const { email, password } = credentials;

        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }

        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      const userExists = await User.findOne({ email: user.email });

      if (!userExists) {
        await User.create({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          token: account?.access_token,
          provider: account?.provider,
          role: "user",
        });
      } else {
        await User.findOneAndUpdate(
          { email: user.email },
          { token: account?.access_token },
          { new: true }
        );
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.access_token = account.access_token;
        token.userId = user?.id;
      }
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.access_token;
        session.user.id = token.userId;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export default authOptions;
