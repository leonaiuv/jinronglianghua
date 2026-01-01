import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const LLMNode = ({ data, isConnectable }: NodeProps) => {
  return (
    <Card className="w-64 border-2 border-purple-500">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
      <CardHeader className="p-3 bg-purple-50 rounded-t-lg">
        <CardTitle className="text-sm font-bold text-purple-700">LLM Generation</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Model</Label>
          <Input 
            defaultValue={data.model as string || 'gpt-4o'} 
            className="h-7 text-xs" 
            readOnly
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">System Prompt</Label>
          <Textarea 
            defaultValue={data.prompt as string || ''} 
            className="min-h-[60px] text-xs resize-none" 
            placeholder="You are a helpful assistant..."
          />
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
    </Card>
  );
};

export default memo(LLMNode);
