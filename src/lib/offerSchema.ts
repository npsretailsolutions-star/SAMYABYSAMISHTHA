import { z } from "zod";

export const offerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    kind: z.enum(["BUNDLE", "PERCENT", "PREPAID_PERCENT"]),
    label: z.string().trim().min(2).max(120),
    isActive: z.boolean().optional(),
    percent: z.number().int().min(0).max(100).optional(),
    minSubtotal: z.number().int().nonnegative().optional(),
    requiresSubscriber: z.boolean().optional(),
    bundleSize: z.number().int().min(2).max(20).optional(),
    bundlePrice: z.number().int().nonnegative().optional(),
    matchType: z.enum(["SKUS", "CATEGORY"]).optional(),
    matchValue: z.string().max(2000).optional(),
    showInPromoBar: z.boolean().optional(),
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
  })
  .superRefine((o, ctx) => {
    if (o.kind === "BUNDLE") {
      if (!o.bundlePrice || o.bundlePrice <= 0)
        ctx.addIssue({ code: "custom", message: "Enter the bundle price" });
      if (!o.matchValue || !o.matchValue.trim())
        ctx.addIssue({ code: "custom", message: "Enter which products are included" });
    } else if (!o.percent || o.percent < 1) {
      ctx.addIssue({ code: "custom", message: "Enter a discount percent" });
    }
  });

export function offerData(o: z.infer<typeof offerSchema>) {
  return {
    ...o,
    startsAt: o.startsAt ? new Date(o.startsAt) : null,
    endsAt: o.endsAt ? new Date(`${o.endsAt}T23:59:59`) : null,
  };
}
