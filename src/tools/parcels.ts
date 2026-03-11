import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SendCloudClient } from "../sendcloud/client.js";

export function registerParcelTools(
  server: McpServer,
  client: SendCloudClient
): void {
  server.registerTool(
    "sendcloud_list_parcels",
    {
      description:
        "List parcels with optional search, pagination, and ordering",
      inputSchema: {
        cursor: z
          .string()
          .optional()
          .describe(
            "Pagination cursor from previous response's 'next' field"
          ),
        limit: z
          .number()
          .optional()
          .default(25)
          .describe("Number of parcels per page (default 25)"),
        search: z
          .string()
          .optional()
          .describe("Search by order number, tracking number, or name"),
        ordering: z
          .string()
          .optional()
          .describe(
            "Sort field, e.g. '-created_at' for newest first"
          ),
      },
    },
    async ({ cursor, limit, search, ordering }) => {
      try {
        const params: Record<string, string> = {};
        if (limit) params.limit = String(limit);
        if (search) params.search = search;
        if (ordering) params.ordering = ordering;
        if (cursor) {
          const cursorUrl = new URL(cursor);
          cursorUrl.searchParams.forEach((v, k) => {
            params[k] = v;
          });
        }

        const data = await client.get<{
          parcels: unknown[];
          next: string | null;
        }>("/parcels", params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  parcels: data.parcels,
                  next: data.next,
                  count: data.parcels.length,
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

  server.registerTool(
    "sendcloud_get_parcel",
    {
      description:
        "Get full parcel details including items, status, tracking info, and label URLs",
      inputSchema: {
        parcel_id: z.number().describe("SendCloud parcel ID"),
      },
    },
    async ({ parcel_id }) => {
      try {
        const data = await client.get<{ parcel: unknown }>(
          `/parcels/${parcel_id}`
        );
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

  server.registerTool(
    "sendcloud_create_parcel",
    {
      description:
        "Create a new parcel (announce a shipment to SendCloud)",
      inputSchema: {
        name: z.string().describe("Recipient full name"),
        address: z.string().describe("Street address"),
        house_number: z
          .string()
          .optional()
          .describe("House number (if separate from address)"),
        city: z.string().describe("City"),
        postal_code: z.string().describe("Postal code"),
        country: z
          .string()
          .length(2)
          .describe("Country ISO-2 code (e.g. ES, NL, DE)"),
        shipment_id: z
          .number()
          .describe(
            "Shipping method ID (from sendcloud_list_shipping_methods)"
          ),
        weight: z.string().describe("Weight in kg (e.g. '1.500')"),
        order_number: z
          .string()
          .optional()
          .describe("Order reference number"),
        parcel_items: z
          .array(
            z.object({
              description: z.string(),
              quantity: z.number(),
              weight: z.string(),
              value: z.string(),
              hs_code: z.string().optional(),
              origin_country: z.string().length(2).optional(),
              sku: z.string().optional(),
            })
          )
          .optional()
          .describe("Items in the parcel"),
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
          request_label: true,
        };
        if (args.house_number) parcelData.house_number = args.house_number;
        if (args.order_number) parcelData.order_number = args.order_number;
        if (args.parcel_items) parcelData.parcel_items = args.parcel_items;

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

  server.registerTool(
    "sendcloud_update_parcel",
    {
      description:
        "Update a parcel's details (name, address, weight, etc.)",
      inputSchema: {
        id: z.number().describe("Parcel ID to update"),
        name: z.string().optional(),
        address: z.string().optional(),
        house_number: z.string().optional(),
        city: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().length(2).optional(),
        weight: z.string().optional(),
        order_number: z.string().optional(),
      },
    },
    async ({ id, ...fields }) => {
      try {
        const data = await client.put<{ parcel: unknown }>("/parcels", {
          parcel: { id, ...fields },
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

  server.registerTool(
    "sendcloud_cancel_parcel",
    {
      description:
        "Cancel a parcel that hasn't been handed to the carrier yet",
      inputSchema: {
        parcel_id: z.number().describe("Parcel ID to cancel"),
      },
    },
    async ({ parcel_id }) => {
      try {
        const data = await client.post<{ status: string; message: string }>(
          `/parcels/${parcel_id}/cancel`,
          {}
        );
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
