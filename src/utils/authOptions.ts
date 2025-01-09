import { SessionUser } from './../app/types/index';
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions, User as NextAuthUser } from "next-auth";
import User from "@/models/User";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET as string;
interface ExtendedUser extends NextAuthUser {
  designation?: string;
  token?: string;
}
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
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        user.token = token;
        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
        const userCopy = user as ExtendedUser;
        token.access_token = userCopy.token;
        token.userId = user?.id;
      }
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.designation;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser: SessionUser = {
          name: session.user.name as string,
          email: session.user.email as string,
          image: session.user.image as string,
          accessToken: token.access_token as string,
          id: token.userId as string,
          role: token.role as string,
        };
        session.user = sessionUser;
      }
      return session;
    },
  },
};

export default authOptions;
