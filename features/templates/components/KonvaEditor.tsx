"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Text,
  Transformer,
  Group,
} from "react-konva";
import Konva from "konva";
import { LayoutElement } from "@/lib/api/modules/templates/types";
import useImage from "use-image";

interface KonvaEditorProps {
  backgroundImageUrl: string;
  elements: LayoutElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (fieldId: string, updates: Partial<LayoutElement>) => void;
  onNaturalSizeLoaded?: (w: number, h: number) => void;
}

// ─── Field Element ────────────────────────────────────────────────────────────
// Lives inside the artboard Group → all coordinates are in template (natural) space.
// When artboard scales, fields scale automatically via the Group's scaleX/Y.
function FieldElement({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: {
  element: LayoutElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (x: number, y: number, w: number, h: number) => void;
}) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    const g = groupRef.current;
    if (!g) return;
    const sx = g.scaleX();
    const sy = g.scaleY();
    g.scaleX(1);
    g.scaleY(1);
    onTransformEnd(
      g.x(),
      g.y(),
      Math.max(20, element.width * sx),
      Math.max(20, element.height * sy)
    );
  };

  const isImage = element.fieldType === "image";
  const iconSize = Math.min(element.width, element.height) * 0.3;

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        draggable
        onClick={(e) => { e.cancelBubble = true; onSelect(); }}
        onTap={(e) => { e.cancelBubble = true; onSelect(); }}
        onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={element.width}
          height={element.height}
          fill={
            isImage
              ? "rgba(99,102,241,0.22)"
              : isSelected
              ? "rgba(99,102,241,0.16)"
              : "rgba(0,0,0,0.38)"
          }
          stroke={
            isSelected
              ? "#818cf8"
              : isImage
              ? "rgba(99,102,241,0.75)"
              : "rgba(255,255,255,0.5)"
          }
          strokeWidth={isSelected ? 2 : 1.5}
          cornerRadius={isImage ? 8 : 4}
          dash={isImage ? [8, 4] : undefined}
        />

        {isImage ? (
          <>
            <Text
              text="📷"
              fontSize={iconSize}
              x={element.width / 2 - iconSize / 2}
              y={element.height / 2 - iconSize / 2}
              listening={false}
            />
            <Text
              text={element.fieldName}
              fontSize={Math.max(10, Math.min(14, element.width * 0.06))}
              fill="rgba(199,210,254,0.9)"
              x={4}
              y={element.height - 20}
              width={element.width - 8}
              align="center"
              listening={false}
              fontStyle="bold"
            />
          </>
        ) : (
          <Text
            x={10}
            y={element.height / 2 - (element.fontSize ?? 24) / 2}
            text={element.fieldName}
            fontSize={Math.min(element.fontSize ?? 24, element.height - 12)}
            fill={element.color ?? "#ffffff"}
            align={(element.alignment as "left" | "center" | "right") ?? "left"}
            width={element.width - 20}
            listening={false}
            fontStyle="italic"
            shadowColor="black"
            shadowBlur={5}
            shadowOpacity={0.7}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          }
          rotateEnabled={false}
          borderStroke="#818cf8"
          anchorStroke="#818cf8"
          anchorFill="#c7d2fe"
          anchorSize={9}
          anchorCornerRadius={2}
        />
      )}
    </>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export default function KonvaEditor({
  backgroundImageUrl,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onNaturalSizeLoaded,
}: KonvaEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  // Artboard position/scale — auto-computed, NEVER touched by user
  const [artboard, setArtboard] = useState({ x: 0, y: 0, scale: 1 });

  // Load image — no crossOrigin so it always renders (taints canvas for data export, fine for our use)
  const [img, imgStatus] = useImage(backgroundImageUrl);

  useEffect(() => {
    if (imgStatus === "loaded" && img) {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setNaturalSize({ w, h });
      onNaturalSizeLoaded?.(w, h);
    }
  }, [imgStatus, img, onNaturalSizeLoaded]);

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width > 0 && height > 0)
          setStageSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Recompute artboard whenever stage size or natural image size changes.
  // The template always sits centered and auto-fits to ~88% of the shorter dimension.
  useEffect(() => {
    if (naturalSize.w === 0 || stageSize.width === 0) return;
    const pad = 48;
    const aspect = naturalSize.w / naturalSize.h;
    let w = stageSize.width - pad * 2;
    let h = w / aspect;
    if (h > stageSize.height - pad * 2) {
      h = stageSize.height - pad * 2;
      w = h * aspect;
    }
    const scale = w / naturalSize.w;
    setArtboard({
      x: Math.round((stageSize.width - w) / 2),
      y: Math.round((stageSize.height - h) / 2),
      scale,
    });
  }, [naturalSize, stageSize]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.currentTarget) onSelectElement(null);
    },
    [onSelectElement]
  );

  const aw = naturalSize.w * artboard.scale;
  const ah = naturalSize.h * artboard.scale;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ background: "#0d1117" }}
    >
      {/* Workspace dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
      >
        {/* Drop shadow for the artboard */}
        {naturalSize.w > 0 && (
          <Layer listening={false}>
            <Rect
              x={artboard.x + 8}
              y={artboard.y + 8}
              width={aw}
              height={ah}
              fill="rgba(0,0,0,0.45)"
              cornerRadius={4}
            />
          </Layer>
        )}

        {/* Artboard: template image + field elements */}
        {naturalSize.w > 0 && img && (
          <Layer>
            <Group
              x={artboard.x}
              y={artboard.y}
              scaleX={artboard.scale}
              scaleY={artboard.scale}
              // NOT draggable — template is fixed/centered
            >
              {/* Template background */}
              <KonvaImage
                image={img}
                x={0}
                y={0}
                width={naturalSize.w}
                height={naturalSize.h}
              />

              {/* Field placeholders (template/natural coordinate space) */}
              {elements.map((el) => (
                <FieldElement
                  key={el.fieldId}
                  element={el}
                  isSelected={selectedElementId === el.fieldId}
                  onSelect={() => onSelectElement(el.fieldId)}
                  onDragEnd={(x, y) => onUpdateElement(el.fieldId, { x, y })}
                  onTransformEnd={(x, y, w, h) =>
                    onUpdateElement(el.fieldId, { x, y, width: w, height: h })
                  }
                />
              ))}


            </Group>
          </Layer>
        )}
      </Stage>

      {/* Template size badge */}
      {naturalSize.w > 0 && (
        <div className="absolute bottom-3 right-3 pointer-events-none flex items-center gap-1.5 bg-black/55 backdrop-blur-sm border border-white/10 text-white text-[11px] font-mono px-2.5 py-1 rounded-full">
          {naturalSize.w} × {naturalSize.h}px
        </div>
      )}

      {/* Loading state */}
      {imgStatus === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Loading template...</p>
          </div>
        </div>
      )}
    </div>
  );
}
