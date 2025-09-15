// src/components/WorkflowCanvas.tsx
import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Circle } from 'react-konva';
import type { Status } from '../types';

interface StatusNode {
  id: string;
  status: Status;
  x: number;
  y: number;
}

interface WorkflowCanvasProps {
  statuses: Status[];
  width?: number;
  height?: number;
  onStatusMove?: (statusId: string, x: number, y: number) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  statuses, 
  width = 800, 
  height = 600,
  onStatusMove 
}) => {
  // Create initial node positions (we'll improve this layout later)
  const [statusNodes, setStatusNodes] = useState<StatusNode[]>(() => {
    return statuses.map((status, index) => ({
      id: status.id,
      status,
      x: 100 + (index * 150), // Spread horizontally for now
      y: 100
    }));
  });

  const stageRef = useRef<any>(null);

  // Handle dragging status nodes
  const handleStatusDrag = (statusId: string, x: number, y: number) => {
    setStatusNodes(prev => 
      prev.map(node => 
        node.id === statusId 
          ? { ...node, x, y }
          : node
      )
    );
    
    if (onStatusMove) {
      onStatusMove(statusId, x, y);
    }
  };

  return (
    <div style={{
      border: '2px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      overflow: 'hidden'
    }}>
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {/* Render each status as a draggable node */}
          {statusNodes.map(node => (
            <StatusNodeComponent
              key={node.id}
              node={node}
              onDrag={handleStatusDrag}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

// Individual Status Node Component
interface StatusNodeComponentProps {
  node: StatusNode;
  onDrag: (statusId: string, x: number, y: number) => void;
}

const StatusNodeComponent: React.FC<StatusNodeComponentProps> = ({ node, onDrag }) => {
  const nodeWidth = 140;
  const nodeHeight = 60;

  return (
    <>
      {/* Node Background */}
      <Rect
        x={node.x}
        y={node.y}
        width={nodeWidth}
        height={nodeHeight}
        fill="white"
        stroke={node.status.color}
        strokeWidth={3}
        cornerRadius={8}
        draggable
        onDragEnd={(e: any) => {
          onDrag(node.id, e.target.x(), e.target.y());
        }}
        // Visual feedback on hover
        onMouseEnter={(e: any) => {
          const target = e.target;
          target.shadowColor('black');
          target.shadowOpacity(0.2);
          target.shadowOffset({ x: 2, y: 2 });
          target.shadowBlur(5);
        }}
        onMouseLeave={(e: any) => {
          const target = e.target;
          target.shadowOpacity(0);
        }}
      />
      
      {/* Status Color Indicator */}
      <Circle
        x={node.x + 15}
        y={node.y + 15}
        radius={8}
        fill={node.status.color}
      />
      
      {/* Status Name */}
      <Text
        x={node.x + 30}
        y={node.y + 8}
        text={node.status.name}
        fontSize={14}
        fontStyle="bold"
        fill="#333"
        width={nodeWidth - 40}
      />
      
      {/* Status Description (truncated) */}
      <Text
        x={node.x + 30}
        y={node.y + 28}
        text={node.status.description.length > 20 
          ? node.status.description.substring(0, 20) + '...'
          : node.status.description
        }
        fontSize={11}
        fill="#666"
        width={nodeWidth - 40}
      />
    </>
  );
};

export default WorkflowCanvas;