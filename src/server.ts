import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "./config.js";
import { SendCloudClient } from "./sendcloud/client.js";
import { registerUserTools } from "./tools/user.js";
import { registerParcelTools } from "./tools/parcels.js";
import { registerShippingTools } from "./tools/shipping.js";
import { registerBrandTools } from "./tools/brands.js";
import { registerIntegrationTools } from "./tools/integrations.js";
import { registerReturnTools } from "./tools/returns.js";
import { registerLabelTools } from "./tools/labels.js";

export function createServer(config: Config): {
  server: McpServer;
  client: SendCloudClient;
} {
  const server = new McpServer({
    name: "mcp-sendcloud",
    version: "1.0.0",
  });

  const client = new SendCloudClient(config);

  registerUserTools(server, client);
  registerParcelTools(server, client);
  registerShippingTools(server, client);
  registerBrandTools(server, client);
  registerIntegrationTools(server, client);
  registerReturnTools(server, client);
  registerLabelTools(server, client);

  return { server, client };
}
