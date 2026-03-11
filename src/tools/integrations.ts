import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SendCloudClient } from "../sendcloud/client.js";

export function registerIntegrationTools(
  server: McpServer,
  client: SendCloudClient
): void {
  server.registerTool(
    "sendcloud_list_integrations",
    {
      description:
        "List connected integrations: shop name, system (shopify/lightspeed/etc), last fetch, webhook status",
    },
    async () => {
      try {
        // Integrations endpoint returns a raw array, not wrapped
        const data = await client.get<unknown[]>("/integrations");
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
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
