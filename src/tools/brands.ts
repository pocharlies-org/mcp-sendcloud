import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SendCloudClient } from "../sendcloud/client.js";

export function registerBrandTools(
  server: McpServer,
  client: SendCloudClient
): void {
  server.registerTool(
    "sendcloud_list_brands",
    {
      description:
        "List SendCloud brands: name, logo, colors, website, domain",
    },
    async () => {
      try {
        const data = await client.get<{ brands: unknown[] }>("/brands");
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data.brands, null, 2),
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
