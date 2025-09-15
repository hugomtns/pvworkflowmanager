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
  const nodeWidth = 140;
  const nodeHeight = 70;

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

  // Get node center position
  const getNodeCenter = (node: StatusNode) => ({
    x: node.x + nodeWidth / 2,
    y: node.y + nodeHeight / 2
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
          : 'Drag nodes to move • Click connection handles to connect'
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
            
            const fromCenter = getNodeCenter(fromNode);
            const toCenter = getNodeCenter(toNode);
            
            return (
              <Group key={connection.id}>
                {/* Connection Line */}
                <Line
                  points={[fromCenter.x, fromCenter.y, toCenter.x, toCenter.y]}
                  stroke="#666"
                  strokeWidth={2}
                  dash={[5, 5]}
                />
                
                {/* Arrow Head */}
                <Line
                  points={[
                    toCenter.x - 10, toCenter.y - 10,
                    toCenter.x, toCenter.y,
                    toCenter.x - 10, toCenter.y + 10
                  ]}
                  stroke="#666"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
                
                {/* Delete Button (on connection midpoint) */}
                <Circle
                  x={(fromCenter.x + toCenter.x) / 2}
                  y={(fromCenter.y + toCenter.y) / 2}
                  radius={8}
                  fill="#f44336"
                  stroke="white"
                  strokeWidth={2}
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
                  x={(fromCenter.x + toCenter.x) / 2 - 3}
                  y={(fromCenter.y + toCenter.y) / 2 - 4}
                  text="×"
                  fontSize={10}
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
              const startCenter = getNodeCenter(startNode);
              
              return (
                <Line
                  points={[startCenter.x, startCenter.y, tempConnection.x, tempConnection.y]}
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
      
      {/* Status Name */}
      <Text
        x={node.x + 30}
        y={node.y + 8}
        text={node.status.name}
        fontSize={13}
        fontStyle="bold"
        fill="#333"
        width={nodeWidth - 60}
      />
      
      {/* Status Description (truncated) */}
      <Text
        x={node.x + 30}
        y={node.y + 25}
        text={node.status.description.length > 15 
          ? node.status.description.substring(0, 15) + '...'
          : node.status.description
        }
        fontSize={10}
        fill="#666"
        width={nodeWidth - 60}
      />
      
      {/* Connection Handle (right side of node) */}
      <Circle
        x={node.x + nodeWidth - 15}
        y={node.y + nodeHeight / 2}
        radius={6}
        fill={isConnecting ? '#2196f3' : '#4caf50'}
        stroke="white"
        strokeWidth={2}
        onClick={(e) => {
          e.cancelBubble = true;
          if (!isConnecting) {
            onConnectionStart(node.id);
          } else {
            onConnectionEnd(node.id);
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
      />
      
      {/* Connection handle tooltip */}
      <Text
        x={node.x + nodeWidth - 35}
        y={node.y + nodeHeight / 2 + 15}
        text="●"
        fontSize={8}
        fill="#4caf50"
        visible={!isConnecting}
      />
    </Group>
  );
};

export default WorkflowCanvas;