import loadSession from "@/utils/session";
import {Session} from "next-auth"
import { initTRPC, TRPCError } from "@trpc/server";

export const createContext = async (opts: any) => {
  const session = await loadSession();
  return {
    session: session as Session & { user: { role: "admin" | "user" } },
  };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createContext>>>()
  .create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (ctx.session?.user) {
    return next({
      ctx,
    });
  } else {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session?.user?.role  === "admin") {
    return next({
      ctx,
    });
  } else {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be an admin to access this resource",
    });
  }
});
