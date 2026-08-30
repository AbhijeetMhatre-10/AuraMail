import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface PanelResizerProps {
  onResize: (deltaX: number) => void;
  onResizeEnd?: () => void;
  className?: string;
}

export function PanelResizer({ onResize, onResizeEnd, className }: PanelResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - startXRef.current;
    if (deltaX !== 0) {
      onResize(deltaX);
      startXRef.current = e.clientX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    onResizeEnd?.();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        'group relative w-1.5 hover:w-2 shrink-0 cursor-col-resize select-none z-30 transition-all flex items-center justify-center bg-transparent touch-none',
        isDragging && 'w-2 bg-indigo-600/30',
        className
      )}
      title="Drag to resize panel"
    >
      <div
        className={cn(
          'w-[2px] h-full transition-colors duration-150',
          isDragging ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-800/80 group-hover:bg-indigo-500/80'
        )}
      />
    </div>
  );
}
