import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, tool } from 'ai';
import type { UIMessage } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

type FlowNodeType = 'start' | 'end' | 'llm';

type FlowNode = {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data?: Record<string, unknown>;
};

type FlowEdge = {
  id: string;
  source: string;
  target: string;
};

function normalizeNode(node: FlowNode): FlowNode & { data: Record<string, unknown> } {
  const data = node.data ?? {};

  if (node.type === 'llm') {
    return {
      ...node,
      data: {
        model: 'gpt-4o',
        prompt: '',
        ...data,
      },
    };
  }

  return { ...node, data };
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai('gpt-4o'),
    messages: modelMessages,
    system: `You are an AI Copilot for a React Flow based editor.
    You help users build workflows by creating nodes and edges.
    
    Node Types:
    - 'start': The starting point.
    - 'end': The ending point.
    - 'llm': A generic LLM processing node. Data: { model: 'gpt-4o', prompt: '...' }
    
    When the user asks to create a flow, generate the nodes and edges and call the 'set_flow_content' tool.
    Generate valid IDs (e.g., '1', '2', 'e1-2').
    Connect nodes logically.

    If the user asks to add a specific node, use 'add_node'.
    If the user asks to connect nodes, use 'connect_nodes'.
    `,
    tools: {
      set_flow_content: tool({
        description: 'Update the flow canvas with new nodes and edges',
        inputSchema: z.object({
          nodes: z.array(z.object({
            id: z.string(),
            type: z.enum(['start', 'end', 'llm']),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional().default({}),
          })),
          edges: z.array(z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
          })),
        }),
        execute: async ({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
          const normalizedNodes = nodes.map(normalizeNode);

          return {
            message: 'Flow updated successfully',
            nodes: normalizedNodes,
            edges,
          };
        },
      }),
      add_node: tool({
        description: 'Add a new node to the canvas',
        inputSchema: z.object({
          type: z.enum(['start', 'end', 'llm']),
          label: z.string().optional(),
          data: z.record(z.string(), z.any()).optional().default({}),
        }),
        execute: async ({ type, label, data }: { type: FlowNodeType; label?: string; data: Record<string, unknown> }) => {
          const nodeData = { ...data };

          if (label != null && nodeData.label == null) {
            nodeData.label = label;
          }

          return normalizeNode({
            id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type,
            data: nodeData,
            position: { x: 100, y: 100 },
          });
        },
      }),
      connect_nodes: tool({
        description: 'Connect two nodes',
        inputSchema: z.object({
          source: z.string(),
          target: z.string(),
        }),
        execute: async ({ source, target }: { source: string; target: string }): Promise<FlowEdge> => {
          return {
            id: `e-${source}-${target}`,
            source,
            target,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
