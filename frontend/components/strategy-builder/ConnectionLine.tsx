"use client"

import React from 'react';
import type { StrategyComponent, StrategyConnection } from "@/types/strategy"

 export interface ConnectionLineProps {
  connection: StrategyConnection
  components: StrategyComponent[]
  onClick?: () => void
  isEditing?: boolean
  onHandleClick?: (end: 'from' | 'to') => void
}

export default function ConnectionLine({ connection, components, onClick, isEditing, onHandleClick }: ConnectionLineProps) {
  const fromComponent = components.find((c) => c.id === connection.from)
  const toComponent = components.find((c) => c.id === connection.to)

  if (!fromComponent || !toComponent) return null

  const fromX = fromComponent.position.x + 120; // Half of component width (240px)
  const fromY = fromComponent.position.y + 60;  // Half of component height (120px)
  const toX = toComponent.position.x + 120;
  const toY = toComponent.position.y + 60;

  // Calculate control points for smooth curve
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const controlOffset = Math.min(distance * 0.3, 100);
  const controlX1 = fromX + (dx > 0 ? controlOffset : -controlOffset);
  const controlY1 = fromY;
  const controlX2 = toX - (dx > 0 ? controlOffset : -controlOffset);
  const controlY2 = toY;

  const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

  // Calculate arrow position and rotation
  const arrowX = toX - dx * 0.02;
  const arrowY = toY - dy * 0.02;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <g>
      {/* Connection line */}
      <path
        d={pathData}
        stroke="url(#connectionGradient)"
        strokeWidth="2"
        fill="none"
        className={`drop-shadow-sm cursor-pointer${isEditing ? ' opacity-70' : ''}`}
        style={{ pointerEvents: onClick ? 'stroke' : 'none' }}
        onClick={onClick}
      />
      {/* Handles for editing */}
      {isEditing && onHandleClick && (
        <>
          {/* Source handle */}
          <circle
            cx={fromX}
            cy={fromY}
            r={8}
            fill="#fff"
            stroke="#64748b"
            strokeWidth={2}
            className="cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onHandleClick('from'); }}
          />
          {/* Target handle */}
          <circle
            cx={toX}
            cy={toY}
            r={8}
            fill="#fff"
            stroke="#64748b"
            strokeWidth={2}
            className="cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onHandleClick('to'); }}
          />
        </>
      )}
      {/* Arrow head */}
      <polygon
        points="-6,-3 -6,3 0,0"
        fill="#64748b"
        transform={`translate(${arrowX}, ${arrowY}) rotate(${angle})`}
        className="drop-shadow-sm"
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#64748b" stopOpacity="1" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </g>
  )
}
