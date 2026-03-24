import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ProtocolList } from "@/components/protocols/protocol-list";

export default async function ProtocolsPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("protocol_categories")
    .select("*")
    .order("sort_order");

  const { data: protocols } = await supabase
    .from("protocols")
    .select("*")
    .order("effectiveness_rank");

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Protocols</h1>
          <p className="text-muted-foreground">
            Evidence-based tools ranked by effectiveness
          </p>
        </div>
        <ProtocolList
          categories={categories || []}
          protocols={protocols || []}
        />
      </div>
    </AppShell>
  );
}
