import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const defaultName = (wallet: string) =>
  `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

export const getByWallet = query({
  args: { wallet: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_wallet", (q) => q.eq("wallet", args.wallet))
      .unique();
  },
});

export const listRandom = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("profiles").collect();
    const shuffled = profiles.sort(() => 0.5 - Math.random());
    const limit = Math.min(args.limit ?? 6, shuffled.length);
    return shuffled.slice(0, limit).map((profile) => ({
      id: profile.wallet,
      name: profile.name,
      image: profile.image,
    }));
  },
});

export const searchByName = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.query.trim().toLowerCase();
    if (!normalized) return [];

    const profiles = await ctx.db.query("profiles").collect();
    return profiles
      .filter((profile) => profile.name.toLowerCase().includes(normalized))
      .slice(0, 10)
      .map((profile) => ({
        id: profile.wallet,
        name: profile.name,
        image: profile.image,
      }));
  },
});

export const ensure = mutation({
  args: {
    wallet: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_wallet", (q) => q.eq("wallet", args.wallet))
      .unique();

    const now = Date.now();
    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      wallet: args.wallet,
      name: args.name?.trim() || defaultName(args.wallet),
      bio: "",
      image: args.image ?? "/images/placeholder-user.jpg",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    wallet: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_wallet", (q) => q.eq("wallet", args.wallet))
      .unique();

    if (!existing) {
      throw new Error("Profile not found.");
    }

    const updatedAt = Date.now();
    await ctx.db.patch(existing._id, {
      name: args.name ?? existing.name,
      bio: args.bio ?? existing.bio,
      image: args.image ?? existing.image,
      updatedAt,
    });

    return updatedAt;
  },
});
