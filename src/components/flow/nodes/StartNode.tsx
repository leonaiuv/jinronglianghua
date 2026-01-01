import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';

const StartNode = ({ isConnectable }: NodeProps) => {
  return (
    <Card className="w-40 border-2 border-green-500 bg-green-50">
      <div className="p-3 flex items-center justify-center gap-2">
        <Play className="w-4 h-4 text-green-700 fill-green-700" />
        <span className="font-bold text-green-700">Start</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </Card>
  );
};

export default memo(StartNode);

