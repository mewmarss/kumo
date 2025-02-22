'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Square,
  Circle,
  Type,
  Minus,
  Eraser,
  Undo,
  Redo,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid,
  Lock,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawElement {
  id: string;
  type: 'pencil' | 'rectangle' | 'circle' | 'line' | 'text';
  points: Point[];
  color: string;
  size: number;
  text?: string;
  position?: Point;
}

const CollaborativeBoard = () => {
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(
    null
  );
  const [tool, setTool] = useState<
    'pencil' | 'rectangle' | 'circle' | 'line' | 'text' | 'eraser' | 'move'
  >('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(2);
  const [history, setHistory] = useState<DrawElement[][]>([[]]); // Initialize with empty array
  const [historyIndex, setHistoryIndex] = useState(0); // Start at 0
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize canvas with correct size and context
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw canvas whenever elements change
  useEffect(() => {
    redrawCanvas();
  }, [elements, scale, offset, showGrid]);

  const startDrawing = (e: React.MouseEvent) => {
    if (isLocked) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    if (tool === 'eraser') {
      const updatedElements = elements.filter((element) => {
        return !isPointNearElement(x, y, element);
      });
      setElements(updatedElements);
      return;
    }

    const newElement: DrawElement = {
      id: uuidv4(),
      type: tool as DrawElement['type'],
      points: [{ x, y }],
      color,
      size,
    };

    setCurrentElement(newElement);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !currentElement || isLocked) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    const newElement = {
      ...currentElement,
      points: [...currentElement.points, { x, y }],
    };

    setCurrentElement(newElement);
    redrawCanvas();
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentElement) return;

    const newElements = [...elements, currentElement];
    setElements(newElements);
    setCurrentElement(null);
    setIsDrawing(false);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const isPointNearElement = (x: number, y: number, element: DrawElement) => {
    const tolerance = element.size * 2;

    return element.points.some((point) => {
      const distance = Math.sqrt(
        Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
      );
      return distance < tolerance;
    });
  };

  const redrawCanvas = () => {
    if (!context || !canvasRef.current) return;

    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid();
    }

    // Apply transformation
    context.save();
    context.translate(offset.x, offset.y);
    context.scale(scale, scale);

    // Draw all elements
    [...elements, currentElement].filter(Boolean).forEach((element) => {
      if (!element) return;

      context.beginPath();
      context.strokeStyle = element.color;
      context.lineWidth = element.size;

      switch (element.type) {
        case 'pencil':
          drawPencilStroke(element);
          break;
        case 'rectangle':
          drawRectangle(element);
          break;
        case 'circle':
          drawCircle(element);
          break;
        case 'line':
          drawLine(element);
          break;
        case 'text':
          if (element.text) {
            drawText(element);
          }
          break;
      }
    });

    context.restore();
  };

  const drawGrid = () => {
    if (!context || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const gridSize = 20;

    context.strokeStyle = '#ddd';
    context.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
  };

  const drawPencilStroke = (element: DrawElement) => {
    if (!context) return;

    context.beginPath();
    context.moveTo(element.points[0].x, element.points[0].y);

    element.points.forEach((point) => {
      context.lineTo(point.x, point.y);
    });

    context.stroke();
  };

  const drawRectangle = (element: DrawElement) => {
    if (!context || element.points.length < 2) return;

    const [start, end] = element.points;
    const width = end.x - start.x;
    const height = end.y - start.y;

    context.strokeRect(start.x, start.y, width, height);
  };

  const drawCircle = (element: DrawElement) => {
    if (!context || element.points.length < 2) return;

    const [start, end] = element.points;
    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    context.beginPath();
    context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    context.stroke();
  };

  const drawLine = (element: DrawElement) => {
    if (!context || element.points.length < 2) return;

    const [start, end] = element.points;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  };

  const drawText = (element: DrawElement) => {
    if (!context || !element.text || !element.position) return;

    context.font = `${element.size * 10}px Arial`;
    context.fillStyle = element.color;
    context.fillText(element.text, element.position.x, element.position.y);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const addText = (e: React.MouseEvent) => {
    if (tool !== 'text' || isLocked) return;

    const text = prompt('Enter text:');
    if (!text) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    const textElement: DrawElement = {
      id: uuidv4(),
      type: 'text',
      points: [],
      color,
      size,
      text,
      position: { x, y },
    };

    setElements([...elements, textElement]);
  };

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTool('pencil')}
          className={tool === 'pencil' ? 'bg-orange-100' : ''}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTool('rectangle')}
          className={tool === 'rectangle' ? 'bg-orange-100' : ''}
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTool('circle')}
          className={tool === 'circle' ? 'bg-orange-100' : ''}
        >
          <Circle className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTool('line')}
          className={tool === 'line' ? 'bg-orange-100' : ''}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTool('text')}
          className={tool === 'text' ? 'bg-orange-100' : ''}
        >
          <Type className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTool('eraser')}
          className={tool === 'eraser' ? 'bg-orange-100' : ''}
        >
          <Eraser className="w-4 h-4" />
        </Button>
        <div className="h-px bg-gray-200 my-2" />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <input
          type="range"
          min="1"
          max="20"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-8"
        />
      </div>

      {/* Action Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white p-2 rounded-lg shadow-md">
        <Button
          variant="outline"
          size="icon"
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          <Redo className="w-4 h-4" />
        </Button>
        <div className="w-px bg-gray-200" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale(scale + 0.1)}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale(Math.max(0.1, scale - 0.1))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="w-px bg-gray-200" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsLocked(!isLocked)}
        >
          <Lock className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={clearCanvas}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={tool === 'text' ? addText : undefined}
      />
    </div>
  );
};

export default CollaborativeBoard;
