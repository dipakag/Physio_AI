'use client';
import React, { useRef, useEffect } from 'react';
import { useWebSocket } from '../../lib/websockets';

interface CameraProps {
  onAnalysisData: (data: any) => void;
}

export default function Camera({ onAnalysisData }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ws = useWebSocket('ws://localhost:8000/ws/movement');
  const frameRequestRef = useRef<number>();
  const processingRef = useRef(false);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      onAnalysisData(response);
      processingRef.current = false;
    };

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            frameRate: 30  // Full frame rate for smooth video
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (ws?.readyState === WebSocket.OPEN) {
              startDataCollection();
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }

    setupCamera();

    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [ws, onAnalysisData]);

  const captureFrame = () => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    const imageData = ctx.getImageData(0, 0, 640, 480);
    
    canvas.remove(); // Clean up
    return imageData;
  };

  const startDataCollection = () => {
    let lastProcessTime = 0;
    const frameInterval = 1000 / 5; // 5 FPS for analysis

    const collectFrame = () => {
      const currentTime = Date.now();
      
      if (ws?.readyState === WebSocket.OPEN && 
          !processingRef.current && 
          currentTime - lastProcessTime >= frameInterval) {
        
        const frameData = captureFrame();
        if (frameData) {
          processingRef.current = true;
          ws.send(JSON.stringify({
            type: 'frame',
            data: Array.from(frameData.data),
            timestamp: currentTime
          }));
          lastProcessTime = currentTime;
        }
      }
      frameRequestRef.current = requestAnimationFrame(collectFrame);
    };

    collectFrame();
  };

  return (
    <div className="relative w-full h-[480px] flex justify-center items-center bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ 
          width: '640px', 
          height: '480px',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
}