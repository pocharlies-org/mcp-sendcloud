import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SendCloudClient } from "../sendcloud/client.js";

export function registerShippingTools(
  server: McpServer,
  client: SendCloudClient
): void {
  server.registerTool(
    "sendcloud_list_shipping_methods",
    {
      description:
        "List available shipping methods with carrier, weight limits, and supported countries",
    },
    async () => {
      try {
        const data = await client.get<{ shipping_methods: unknown[] }>(
          "/shipping_methods"
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data.shipping_methods, null, 2),
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
