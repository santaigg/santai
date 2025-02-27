import { DatabaseService } from "./DatabaseService";
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
}

export const dbClient = new DatabaseService(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
).getClient();

// Export the DatabaseService
export { DatabaseService, DatabaseError } from './DatabaseService';

// Export all domain models
export * from './models';
