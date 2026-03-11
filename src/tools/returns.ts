import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SendCloudClient } from "../sendcloud/client.js";

export function registerReturnTools(
  server: McpServer,
  client: SendCloudClient
): void {
  server.registerTool(
    "sendcloud_list_returns",
    {
      description: "List all returns",
    },
    async () => {
      try {
        const data = await client.get<{ returns: unknown[] }>("/returns");
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data.returns, null, 2),
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

  server.registerTool(
    "sendcloud_create_return",
    {
      description: "Create a return parcel",
      inputSchema: {
        name: z.string().describe("Sender (returner) full name"),
        address: z.string().describe("Sender street address"),
        house_number: z.string().optional().describe("House number"),
        city: z.string().describe("Sender city"),
        postal_code: z.string().describe("Sender postal code"),
        country: z
          .string()
          .length(2)
          .describe("Sender country ISO-2 code"),
        shipment_id: z.number().describe("Return shipping method ID"),
        weight: z.string().describe("Weight in kg"),
      },
    },
    async (args) => {
      try {
        const parcelData: Record<string, unknown> = {
          name: args.name,
          address: args.address,
          city: args.city,
          postal_code: args.postal_code,
          country: args.country,
          shipment: { id: args.shipment_id },
          weight: args.weight,
          is_return: true,
          request_label: true,
        };
        if (args.house_number) parcelData.house_number = args.house_number;

        const data = await client.post<{ parcel: unknown }>("/parcels", {
          parcel: parcelData,
        });
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data.parcel, null, 2),
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
