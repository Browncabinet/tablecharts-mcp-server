#!/usr/bin/env node
/**
 * @tablecharts/mcp-server
 *
 * MCP server that exposes TableCharts' dashboard generation as a tool
 * for Claude Desktop, Cursor, VS Code, and any other MCP client.
 *
 * Set TABLECHARTS_API_KEY in your MCP client config. Get one at
 * https://tablecharts.co/api-keys
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const API_BASE =
  process.env.TABLECHARTS_API_BASE?.replace(/\/+$/, "") ||
  "https://tablecharts.co";
const API_KEY = process.env.TABLECHARTS_API_KEY;

const CHART_TYPES = [
  "bar",
  "line",
  "area",
  "pie",
  "scatter",
  "radar",
] as const;

const GenerateDashboardInput = z
  .object({
    data: z
      .array(z.record(z.any()))
      .optional()
      .describe("Array of row objects, e.g. [{month:'Jan',sales:100}, ...]"),
    csv: z
      .string()
      .optional()
      .describe("Raw CSV text. Use this OR `data` OR `source_url`."),
    source_url: z
      .string()
      .url()
      .optional()
      .describe(
        "Public Notion page, Google Sheets, or Salesforce report URL to pull data from.",
      ),
    title: z.string().optional().describe("Dashboard title."),
    chart_type: z
      .enum(CHART_TYPES)
      .optional()
      .describe("Force a chart type. Omit to let TableCharts auto-recommend."),
    ai_clean: z
      .boolean()
      .optional()
      .describe("Pro: AI-clean the data (dedupe, fix types) before charting."),
    ai_recommend: z
      .boolean()
      .optional()
      .describe("Pro: AI picks the most insightful chart type."),
  })
  .refine(
    (v) => v.data || v.csv || v.source_url,
    "Provide one of: data, csv, or source_url",
  );

const server = new Server(
  { name: "tablecharts", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_dashboard",
      description:
        "Turn tabular data into a shareable interactive TableCharts dashboard. Accepts JSON rows, raw CSV, or a public Notion / Google Sheets / Salesforce URL. Returns a dashboard URL and an embeddable iframe.",
      inputSchema: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { type: "object" },
            description: "Array of row objects.",
          },
          csv: { type: "string", description: "Raw CSV text." },
          source_url: {
            type: "string",
            description:
              "Public Notion / Google Sheets / Salesforce report URL.",
          },
          title: { type: "string" },
          chart_type: { type: "string", enum: [...CHART_TYPES] },
          ai_clean: { type: "boolean" },
          ai_recommend: { type: "boolean" },
        },
      },
    },
    {
      name: "list_chart_types",
      description:
        "List the chart types TableCharts supports. Use this before calling generate_dashboard with an explicit chart_type.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  if (name === "list_chart_types") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { chart_types: CHART_TYPES, note: "Omit chart_type to auto-pick." },
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name !== "generate_dashboard") {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  if (!API_KEY) {
    return {
      content: [
        {
          type: "text",
          text: "TABLECHARTS_API_KEY is not set. Get a free key at https://tablecharts.co/api-keys and add it to your MCP client config under `env`.",
        },
      ],
      isError: true,
    };
  }

  const parsed = GenerateDashboardInput.safeParse(args);
  if (!parsed.success) {
    return {
      content: [
        { type: "text", text: `Invalid input: ${parsed.error.message}` },
      ],
      isError: true,
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/generate-dashboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "User-Agent": "tablecharts-mcp/0.1.0",
      },
      body: JSON.stringify(parsed.data),
    });

    const text = await res.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }

    if (!res.ok) {
      return {
        content: [
          {
            type: "text",
            text: `TableCharts API error (${res.status}): ${
              body?.error || body?.message || text
            }`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(body, null, 2) }],
    };
  } catch (err: any) {
    return {
      content: [
        { type: "text", text: `Request failed: ${err?.message || String(err)}` },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("tablecharts-mcp ready (stdio)");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
