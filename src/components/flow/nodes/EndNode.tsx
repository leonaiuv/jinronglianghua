import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Flag } from 'lucide-react';

const EndNode = ({ isConnectable }: NodeProps) => {
  return (
    <Card className="w-40 border-2 border-red-500 bg-red-50">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500"
      />
      <div className="p-3 flex items-center justify-center gap-2">
        <Flag className="w-4 h-4 text-red-700 fill-red-700" />
        <span className="font-bold text-red-700">End</span>
      </div>
    </Card>
  );
};

export default memo(EndNode);

