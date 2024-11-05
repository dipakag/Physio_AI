'use client';
import React, { useRef, useEffect } from 'react';
import { useWebSocket } from '../../lib/websockets';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ws = useWebSocket('ws://localhost:8000/ws/movement');

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        startDataCollection();
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    setupCamera();
  }, []);

  const startDataCollection = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const collectFrame = () => {
      if (videoRef.current && ws && ws.readyState === WebSocket.OPEN) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageData = ctx.getImageData(0, 0, 640, 480);
        
        // Send frame data through WebSocket
        ws.send(JSON.stringify({
          type: 'frame',
          data: Array.from(imageData.data),
          timestamp: Date.now()
        }));
      }
      requestAnimationFrame(collectFrame);
    };

    collectFrame();
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-2xl"
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="hidden"
      />
    </div>
  );
}