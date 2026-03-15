import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find expired shares
    const { data: expired, error: fetchError } = await supabase
      .from("shares")
      .select("id, file_path, code")
      .lt("expires_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (expired && expired.length > 0) {
      // Delete files from storage
      const filePaths = expired
        .filter((s) => s.file_path)
        .map((s) => s.file_path!);

      if (filePaths.length > 0) {
        await supabase.storage.from("shares").remove(filePaths);
      }

      // Delete records
      const ids = expired.map((s) => s.id);
      await supabase.from("shares").delete().in("id", ids);
    }

    return new Response(
      JSON.stringify({ deleted: expired?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
