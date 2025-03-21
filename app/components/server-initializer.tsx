import { initializeServer } from "@/lib/server-init";

export async function ServerInitializer() {
  // This will run during build time on Vercel or on server startup
  await initializeServer();

  // Return null as this is just for initialization, not rendering
  return null;
}
