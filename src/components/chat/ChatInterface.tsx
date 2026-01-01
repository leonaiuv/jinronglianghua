'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isTextUIPart, isToolUIPart } from 'ai';
import type { UIMessagePart, UITools, UIDataTypes } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFlowStore } from '@/store/flow-store';
import { getLayoutedElements } from '@/lib/layout';
import { Node, Edge } from '@xyflow/react';

type AnyMessagePart = UIMessagePart<UIDataTypes, UITools>;

const ChatInterface = () => {
  const transport = useMemo(() => new DefaultChatTransport(), []);
  const { messages, sendMessage, status } = useChat({ transport });
  const { setNodes, setEdges, addNode, onConnect } = useFlowStore();
  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';
  
  // Ref to track processed tool calls to avoid re-execution
  const processedToolCalls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const toolParts = messages.flatMap((message) =>
      message.parts.filter(isToolUIPart)
    );

    for (const toolPart of toolParts) {
      if (toolPart.state !== 'output-available') continue;

      const callId = toolPart.toolCallId;
      if (processedToolCalls.current.has(callId)) continue;
      processedToolCalls.current.add(callId);

      const toolName =
        toolPart.type === 'dynamic-tool'
          ? toolPart.toolName
          : toolPart.type.replace(/^tool-/, '');

      if (toolName === 'set_flow_content') {
        const output = toolPart.output as { nodes?: Node[]; edges?: Edge[] } | undefined;
        if (!output?.nodes || !output?.edges) continue;

        const layouted = getLayoutedElements(output.nodes, output.edges);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
      }

      if (toolName === 'add_node') {
        const node = toolPart.output as Node;
        addNode(node);
      }

      if (toolName === 'connect_nodes') {
        const edge = toolPart.output as { source?: string; target?: string } | undefined;
        if (!edge?.source || !edge?.target) continue;

        onConnect({
          source: edge.source,
          target: edge.target,
          sourceHandle: null,
          targetHandle: null,
        });
      }
    }
  }, [messages, setNodes, setEdges, addNode, onConnect]);

  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    await sendMessage({ text });
  };

  const getMessageText = (parts: AnyMessagePart[]) =>
    parts
      .filter(isTextUIPart)
      .map((part) => part.text)
      .join('');

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-3 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div>{getMessageText(m.parts)}</div>
                {m.parts.filter(isToolUIPart).map((t) => {
                  const toolName =
                    t.type === 'dynamic-tool' ? t.toolName : t.type.replace(/^tool-/, '');

                  const label =
                    toolName === 'set_flow_content'
                      ? 'Canvas Updated'
                      : toolName === 'add_node'
                        ? 'Node Added'
                        : toolName === 'connect_nodes'
                          ? 'Nodes Connected'
                          : toolName;

                  const stateText =
                    t.state === 'output-available'
                      ? 'done'
                      : t.state === 'output-error'
                        ? 'error'
                        : t.state;

                  return (
                    <div
                      key={t.toolCallId}
                      className="mt-2 text-xs italic opacity-70 border-t pt-1 border-black/10 dark:border-white/10"
                    >
                      {label} · {stateText}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-sm text-gray-500 animate-pulse">Thinking...</div>
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a flow or action..."
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
