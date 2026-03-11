import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SendCloudClient } from "../sendcloud/client.js";

export function registerUserTools(
  server: McpServer,
  client: SendCloudClient
): void {
  server.registerTool(
    "sendcloud_get_user",
    {
      description:
        "Get SendCloud account info: company name, address, email, invoices",
    },
    async () => {
      try {
        const data = await client.get<{ user: Record<string, unknown> }>(
          "/user"
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data.user, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed: ${(err as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
