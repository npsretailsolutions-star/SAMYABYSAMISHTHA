import MigrateDb from "@/components/admin/MigrateDb";

export const dynamic = "force-dynamic";

export default function MigrateDbPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-2">Move Database to Supabase</h1>
      <p className="text-sm text-brand-teal/70 mb-6">
        Copies all products, orders, customers, coupons, reviews, banners etc. from the old database to
        Supabase. Safe to run more than once — the second run only updates/adds what changed.
      </p>
      <MigrateDb />
    </div>
  );
}
