'use client';
import React, { useEffect, useRef } from 'react';   
import { Card } from '@radix-ui/themes';
import { useWebSocket } from '../../lib/websockets';

export default function MovementGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useWebSocket('ws://localhost:8000/ws/analysis');

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateGraph(data);
    };
  }, [ws]);

  const updateGraph = (data: any) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw movement data
    ctx.beginPath();
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;

    // Example: Draw movement trajectory
    data.points.forEach((point: [number, number], index: number) => {
      if (index === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    });

    ctx.stroke();
  };

  return (
    <Card className="p-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full"
      />
    </Card>
  );
}