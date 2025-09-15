// src/components/WorkflowCanvas.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Group } from 'react-konva';
import type { Status } from '../types';

interface StatusNode {
  id: string;
  status: Status;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromStatusId: string;
  toStatusId: string;
}

interface WorkflowCanvasProps {
  statuses: Status[];
  width?: number;
  height?: number;
  onStatusMove?: (statusId: string, x: number, y: number) => void;
  onConnectionsChange?: (connections: Connection[]) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  statuses, 
  width = 800, 
  height = 600,
  onStatusMove,
  onConnectionsChange 
}) => {
  // Create initial node positions with better spacing
  const [statusNodes, setStatusNodes] = useState<StatusNode[]>(() => {
    return statuses.map((status, index) => ({
      id: status.id,
      status,
      x: 100 + ((index % 3) * 200), // 3 columns
      y: 80 + (Math.floor(index / 3) * 150) // Multiple rows
    }));
  });

  const [connections, setConnections] = useState<Connection[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);

  const stageRef = useRef<any>(null);
  const nodeWidth = 120;
  const nodeHeight = 50;

  // Update status nodes when statuses prop changes
  React.useEffect(() => {
    setStatusNodes(prev => {
      const newNodes = statuses.map((status, index) => {
        const existingNode = prev.find(node => node.id === status.id);
        return existingNode || {
          id: status.id,
          status,
          x: 100 + ((index % 3) * 200),
          y: 80 + (Math.floor(index / 3) * 150)
        };
      });
      return newNodes;
    });
  }, [statuses]);

  // Handle dragging status nodes
  const handleStatusDrag = useCallback((statusId: string, x: number, y: number) => {
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
  }, [onStatusMove]);

  // Handle connection creation
  const handleConnectionStart = (statusId: string) => {
    if (!isConnecting) {
      setIsConnecting(true);
      setConnectionStart(statusId);
    }
  };

  const handleConnectionEnd = (statusId: string) => {
    if (isConnecting && connectionStart && connectionStart !== statusId) {
      // Check if connection already exists
      const existingConnection = connections.find(
        conn => conn.fromStatusId === connectionStart && conn.toStatusId === statusId
      );
      
      if (!existingConnection) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          fromStatusId: connectionStart,
          toStatusId: statusId
        };
        
        const newConnections = [...connections, newConnection];
        setConnections(newConnections);
        
        if (onConnectionsChange) {
          onConnectionsChange(newConnections);
        }
      }
    }
    
    // Reset connection state
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnection(null);
  };

  // Handle mouse move for temporary connection line
  const handleMouseMove = (e: any) => {
    if (isConnecting && connectionStart) {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      setTempConnection({ x: pointer.x, y: pointer.y });
    }
  };

  // Cancel connection on background click
  const handleBackgroundClick = () => {
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnection(null);
  };

  // Get node connection points (properly outside the box)
  const getNodeConnectionPoints = (node: StatusNode) => ({
    output: { x: node.x + nodeWidth + 6, y: node.y + nodeHeight / 2 },
    input: { x: node.x - 6, y: node.y + nodeHeight / 2 }
  });

  // Delete connection
  const deleteConnection = (connectionId: string) => {
    const newConnections = connections.filter(conn => conn.id !== connectionId);
    setConnections(newConnections);
    if (onConnectionsChange) {
      onConnectionsChange(newConnections);
    }
  };

  return (
    <div style={{
      border: '2px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: '#666',
        zIndex: 100
      }}>
        {isConnecting 
          ? 'Click on another status to create connection...' 
          : 'Click right edge to start connection • Click left edge to end connection'
        }
      </div>

      <Stage 
        width={width} 
        height={height} 
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onClick={handleBackgroundClick}
      >
        <Layer>
          {/* Render connections */}
          {connections.map(connection => {
            const fromNode = statusNodes.find(n => n.id === connection.fromStatusId);
            const toNode = statusNodes.find(n => n.id === connection.toStatusId);
            
            if (!fromNode || !toNode) return null;
            
            const fromPoints = getNodeConnectionPoints(fromNode);
            const toPoints = getNodeConnectionPoints(toNode);
            const fromPos = fromPoints.output;
            const toPos = toPoints.input;
            
            return (
              <Group key={connection.id}>
                {/* Connection Line */}
                <Line
                  points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                  stroke="#666"
                  strokeWidth={2}
                />
                
                {/* Arrow Head */}
                <Line
                  points={[
                    toPos.x - 8, toPos.y - 5,
                    toPos.x, toPos.y,
                    toPos.x - 8, toPos.y + 5
                  ]}
                  stroke="#666"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
                
                {/* Delete Button (on connection midpoint) */}
                <Circle
                  x={(fromPos.x + toPos.x) / 2}
                  y={(fromPos.y + toPos.y) / 2}
                  radius={6}
                  fill="#f44336"
                  stroke="white"
                  strokeWidth={1}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    deleteConnection(connection.id);
                  }}
                  onMouseEnter={(e) => {
                    e.target.scaleX(1.2);
                    e.target.scaleY(1.2);
                  }}
                  onMouseLeave={(e) => {
                    e.target.scaleX(1);
                    e.target.scaleY(1);
                  }}
                />
                <Text
                  x={(fromPos.x + toPos.x) / 2 - 2}
                  y={(fromPos.y + toPos.y) / 2 - 3}
                  text="×"
                  fontSize={8}
                  fill="white"
                  onClick={(e) => {
                    e.cancelBubble = true;
                    deleteConnection(connection.id);
                  }}
                />
              </Group>
            );
          })}
          
          {/* Temporary connection line */}
          {isConnecting && connectionStart && tempConnection && (
            (() => {
              const startNode = statusNodes.find(n => n.id === connectionStart);
              if (!startNode) return null;
              const startPoints = getNodeConnectionPoints(startNode);
              const startPos = startPoints.output;
              
              return (
                <Line
                  points={[startPos.x, startPos.y, tempConnection.x, tempConnection.y]}
                  stroke="#2196f3"
                  strokeWidth={2}
                  dash={[3, 3]}
                />
              );
            })()
          )}

          {/* Render each status as a draggable node */}
          {statusNodes.map(node => (
            <StatusNodeComponent
              key={node.id}
              node={node}
              nodeWidth={nodeWidth}
              nodeHeight={nodeHeight}
              onDrag={handleStatusDrag}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              isConnecting={isConnecting}
              isConnectionStart={connectionStart === node.id}
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
  nodeWidth: number;
  nodeHeight: number;
  onDrag: (statusId: string, x: number, y: number) => void;
  onConnectionStart: (statusId: string) => void;
  onConnectionEnd: (statusId: string) => void;
  isConnecting: boolean;
  isConnectionStart: boolean;
}

const StatusNodeComponent: React.FC<StatusNodeComponentProps> = ({ 
  node, 
  nodeWidth, 
  nodeHeight, 
  onDrag, 
  onConnectionStart,
  onConnectionEnd,
  isConnecting,
  isConnectionStart
}) => {
  return (
    <Group>
      {/* Node Background */}
      <Rect
        x={node.x}
        y={node.y}
        width={nodeWidth}
        height={nodeHeight}
        fill="white"
        stroke={isConnectionStart ? '#2196f3' : node.status.color}
        strokeWidth={isConnectionStart ? 4 : 3}
        cornerRadius={8}
        draggable
        onDragEnd={(e: any) => {
          onDrag(node.id, e.target.x(), e.target.y());
        }}
        onMouseEnter={(e: any) => {
          e.target.shadowColor('black');
          e.target.shadowOpacity(0.2);
          e.target.shadowOffset({ x: 2, y: 2 });
          e.target.shadowBlur(5);
        }}
        onMouseLeave={(e: any) => {
          e.target.shadowOpacity(0);
        }}
        onClick={(e) => {
          e.cancelBubble = true;
          if (isConnecting) {
            onConnectionEnd(node.id);
          }
        }}
      />
      
      {/* Status Color Indicator */}
      <Circle
        x={node.x + 15}
        y={node.y + 15}
        radius={8}
        fill={node.status.color}
      />
      
      {/* Status Name ONLY - No Description */}
      <Text
        x={node.x + nodeWidth / 2}
        y={node.y + nodeHeight / 2}
        text={node.status.name}
        fontSize={12}
        fontStyle="bold"
        fill="#333"
        width={nodeWidth - 20}
        align="center"
      />
      
      {/* Connection Handles - Always visible on hover */}
      {/* Input Handle (left edge) */}
      <Circle
        x={node.x - 6}
        y={node.y + nodeHeight / 2}
        radius={6}
        fill={isConnecting ? '#2196f3' : '#666'}
        stroke="white"
        strokeWidth={2}
        onClick={(e) => {
          e.cancelBubble = true;
          if (isConnecting) {
            onConnectionEnd(node.id);
          }
        }}
        onMouseEnter={(e: any) => {
          e.target.fill('#2196f3');
          e.target.scaleX(1.3);
          e.target.scaleY(1.3);
        }}
        onMouseLeave={(e: any) => {
          e.target.fill(isConnecting ? '#2196f3' : '#666');
          e.target.scaleX(1);
          e.target.scaleY(1);
        }}
        opacity={0.8}
      />
      
      {/* Output Handle (right edge) */}
      <Circle
        x={node.x + nodeWidth + 6}
        y={node.y + nodeHeight / 2}
        radius={6}
        fill={isConnectionStart ? '#ff5722' : '#4caf50'}
        stroke="white"
        strokeWidth={2}
        onClick={(e) => {
          e.cancelBubble = true;
          if (!isConnecting) {
            onConnectionStart(node.id);
          }
        }}
        onMouseEnter={(e: any) => {
          e.target.scaleX(1.3);
          e.target.scaleY(1.3);
        }}
        onMouseLeave={(e: any) => {
          e.target.scaleX(1);
          e.target.scaleY(1);
        }}
        opacity={0.8}
      />
    </Group>
  );
};

export default WorkflowCanvas;