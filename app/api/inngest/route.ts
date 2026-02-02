import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processMessage } from "@/features/conversations/inngest/process-message";

// Create an API that serves functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processMessage,
        // Add other functions here as they are migrated
    ],
});
