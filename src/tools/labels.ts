import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SendCloudClient } from "../sendcloud/client.js";

export function registerLabelTools(
  server: McpServer,
  client: SendCloudClient
): void {
  server.registerTool(
    "sendcloud_get_label",
    {
      description: "Get shipping label download URLs for a parcel",
      inputSchema: {
        parcel_id: z.number().describe("Parcel ID"),
      },
    },
    async ({ parcel_id }) => {
      try {
        const data = await client.get<{
          parcel: {
            id: number;
            label: {
              normal_printer: string[];
              label_printer: string;
            } | null;
            tracking_number: string;
          };
        }>(`/parcels/${parcel_id}`);

        const label = data.parcel.label;
        if (!label) {
          return {
            content: [
              {
                type: "text" as const,
                text: "No label available for this parcel. The parcel may not have been announced yet.",
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  parcel_id: data.parcel.id,
                  tracking_number: data.parcel.tracking_number,
                  normal_printer: label.normal_printer,
                  label_printer: label.label_printer,
                },
                null,
                2
              ),
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
