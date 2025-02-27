import { SeedPostgres  } from "@snaplet/seed/adapter-postgres";
import { defineConfig } from "@snaplet/seed/config";
import postgres from "postgres";

// Safety check function to prevent accidental production database operations
const validateDatabaseUrl = (url: string) => {
  // Check if the URL contains production indicators
  const isProductionUrl = url.includes("production") || 
                         url.includes("prod") || 
                         url.includes("supabase.co") ||
                         !url.includes("localhost");
  
  // Check if we're in a production environment
  const isProduction = process.env.NODE_ENV === "production";
  
  if ((isProduction || isProductionUrl) && process.env.FORCE_SEED !== "true") {
    throw new Error(
      "⛔ DANGER: Attempting to connect to what appears to be a production database!\n" +
      "If you are ABSOLUTELY SURE this is what you want, set FORCE_SEED=true in your environment."
    );
  }
  
  return url;
};

export default defineConfig({
  adapter: () => {
    const databaseUrl = process.env.DATABASE_URL || "DATABASE_URL_HERE";
    
    // Validate the database URL before connecting
    const validatedUrl = validateDatabaseUrl(databaseUrl);
    
    const client = postgres(validatedUrl);
    return new SeedPostgres(client);
  },
  select: [
    // We don't alter any extensions tables that might be owned by extensions
    "!*",
    // We want to alter all the tables under public schema
    "public*",
    // We also want to alter some of the tables under the auth schema
    "auth.users",
    "auth.identities",
    "auth.sessions",
  ],
})