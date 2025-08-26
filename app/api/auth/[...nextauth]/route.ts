// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

// ✅ Export the actual handler functions, not the object
export const { GET, POST } = handlers;
