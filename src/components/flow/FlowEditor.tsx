'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '@/store/flow-store';
import LLMNode from './nodes/LLMNode';
import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';

const FlowEditor = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore();

  const nodeTypes = useMemo<NodeTypes>(() => ({
    llm: LLMNode,
    start: StartNode,
    end: EndNode,
  }), []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default FlowEditor;
