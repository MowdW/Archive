import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, ArrowUp, ArrowUpRight, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { FileItem } from '@/src/types';
import Markdown from 'react-markdown';
import type { Component } from 'obsidian';
import { useRef, useEffect } from 'react';

const MarkdownPreview = ({ app, content, sourcePath, className, style, obsidianAPI }: { app?: any, content: string, sourcePath: string, className?: string, style?: React.CSSProperties, obsidianAPI?: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !app || !obsidianAPI) return;
    containerRef.current.innerHTML = '';
    
    let comp: any = null;
    try {
      comp = new obsidianAPI.Component();
      comp.load();
      obsidianAPI.MarkdownRenderer.render(app, content, containerRef.current!, sourcePath || '/', comp);
    } catch (e) {
      console.error('Markdown render error:', e);
    }
    
    return () => {
      if (comp) comp.unload();
    };
  }, [app, content, sourcePath, obsidianAPI]);

  if (!app) {
    return (
      <div className={cn("markdown-body", className)} style={style}>
        <Markdown>{content}</Markdown>
      </div>
    );
  }

  return (
    <div className={cn("!bg-transparent !text-current", className)} style={style}>
      <div ref={containerRef} className="markdown-preview-view !bg-transparent !p-0 !m-0" />
    </div>
  );
};

interface FolderProps {
  item: FileItem;
  onOpenFile?: (path: string) => void;
  onConfigure?: (id: string) => void;
  onRemoveFromFolder?: (folderId: string, childId: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, content: string) => void;
  onEnter?: (id: string) => void;
  isDraggingNode?: boolean;
  obsidianApp?: any;
  obsidianAPI?: any;
}

const ChildCard = ({ child, onOpenFile, onRemoveFromFolder, onUpdate, parentId, obsidianApp, obsidianAPI }: { child: FileItem, onOpenFile?: (path: string) => void, onRemoveFromFolder?: (folderId: string, childId: string) => void, onUpdate?: (id: string, content: string) => void, parentId: string, obsidianApp?: any, obsidianAPI?: any }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(child.content || '');
  const isVideo = child.subName && ['mp4', 'webm'].includes(child.subName.toLowerCase());

  const handleMediaLoad = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const target = e.target as any;
    const width = target.videoWidth || target.naturalWidth;
    const height = target.videoHeight || target.naturalHeight;
    if (width && height) {
      setAspectRatio(width / height);
    }
  };

  const cardWidthRem = 16;
  const cardHeightRem = aspectRatio ? cardWidthRem / aspectRatio : 20;

  return (
    <div 
      className="relative group/file" 
      style={{ transform: `rotate(${child.rotation || 0}deg)` }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-3xl shadow-xl border border-obsidian-bg-alt flex flex-col hover:shadow-2xl transition-all cursor-pointer overflow-hidden relative"
        style={{ 
          backgroundColor: child.color || 'var(--background-primary)',
          filter: child.color ? 'saturate(1.3)' : 'none',
          width: `${cardWidthRem}rem`,
          height: `${cardHeightRem}rem`
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (child.type === 'sticky') {
            setIsEditing(true);
          } else if (onOpenFile) {
            onOpenFile(child.path || child.id);
          }
        }}
      >
        {child.imageUrl ? (
          isVideo ? (
            <video 
              src={child.imageUrl} 
              className="w-full h-full object-cover pointer-events-none" 
              controls={false} 
              muted 
              loop 
              draggable={false} 
              onLoadedMetadata={handleMediaLoad}
            />
          ) : (
            <img 
              src={child.imageUrl} 
              alt={child.name} 
              className="w-full h-full object-cover pointer-events-none" 
              referrerPolicy="no-referrer" 
              draggable={false} 
              onLoad={handleMediaLoad}
            />
          )
        ) : child.type === 'sticky' ? (
          isEditing ? (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                if (onUpdate) onUpdate(child.id, text);
              }}
              className="w-full h-full p-8 !bg-transparent !shadow-none !border-0 !outline-none focus:!border-0 focus:!outline-none focus:!ring-0 resize-none text-gray-900 font-medium leading-relaxed"
              style={{ backgroundColor: 'transparent', fontFamily: child.fontFamily || undefined }}
              placeholder="输入便签内容..."
            />
          ) : (
            <div 
              className="w-full h-full p-8 text-gray-900 font-medium leading-relaxed overflow-y-auto no-scrollbar"
              style={{ fontFamily: child.fontFamily || undefined }}
              onWheel={(e) => e.stopPropagation()}
            >
              {text ? (
                <MarkdownPreview app={obsidianApp} obsidianAPI={obsidianAPI} content={text} sourcePath="" />
              ) : (
                '双击编辑便签...'
              )}
            </div>
          )
        ) : (
          <div className="p-8 flex flex-col h-full overflow-hidden">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 shrink-0">{child.name}</h3>
            <div className="flex-1 overflow-y-auto no-scrollbar" onWheel={(e) => e.stopPropagation()}>
              <MarkdownPreview 
                app={obsidianApp} 
                obsidianAPI={obsidianAPI}
                content={child.content || 'A distraction free space for thoughts, ideas and to-dos.\n\nNotes have been designed to use no visible options and buttons while typing...'} 
                sourcePath={child.path || ''}
                className="text-sm text-gray-900 opacity-70 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Remove from folder button */}
      <div
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onRemoveFromFolder) onRemoveFromFolder(parentId, child.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-4 right-4 p-2 bg-gray-900/10 rounded-full text-gray-900 opacity-0 group-hover/file:opacity-100 transition-opacity z-10 shadow-sm cursor-pointer flex items-center justify-center"
        title="移出文件夹至画布"
      >
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export const Folder: React.FC<FolderProps> = ({ item, onOpenFile, onConfigure, onRemoveFromFolder, onDelete, onUpdate, onEnter, isDraggingNode, obsidianApp, obsidianAPI }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pointerDownPos, setPointerDownPos] = useState<{x: number, y: number} | null>(null);
  const [hoveredChildId, setHoveredChildId] = useState<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setPointerDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (pointerDownPos) {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        return; // It was a drag
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative flex items-center" style={{ transform: `rotate(${item.rotation || 0}deg)` }}>
      {/* Folder Stack */}
      <div 
        className="relative w-64 h-80 cursor-pointer group"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onEnter) onEnter(item.id);
        }}
      >
        {/* Back colored card (High Saturation) */}
        <div 
          className="absolute inset-y-4 right-0 w-full rounded-3xl transition-transform duration-300 group-hover:translate-x-4 shadow-lg"
          style={{ 
            backgroundColor: item.color || '#fbbf24', 
            transform: 'translateX(12px)',
            filter: 'saturate(1.5) brightness(1.05)'
          }}
        />
        
        {/* Front card (Light/Pale) */}
        <div 
          className="absolute inset-0 rounded-3xl shadow-xl border border-obsidian-bg-alt p-8 flex flex-col justify-between z-10 transition-transform duration-300 group-hover:-translate-x-2"
          style={{ 
            backgroundColor: item.color ? `color-mix(in srgb, ${item.color}, white 94%)` : 'var(--background-primary)'
          }}
        >
          <div className="w-12 h-12 rounded-full bg-gray-900/5 flex items-center justify-center text-gray-900 opacity-40">
            <ArrowUp className={cn("w-6 h-6 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              {item.name}
            </h3>
            <p className="text-sm font-medium text-gray-900 opacity-50 line-clamp-2">
              {item.content || item.subName || '文件夹'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-gray-900/10 rounded-full text-gray-900 opacity-70">
                Enter
              </span>
              <span className="text-xs text-gray-900 opacity-50">进入文件夹</span>
            </div>
          </div>

          <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onConfigure && (
              <div 
                role="button"
                onClick={(e) => { e.stopPropagation(); onConfigure(item.id); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-gray-900/5 hover:bg-gray-900/10 text-gray-900 transition-colors no-drag cursor-pointer flex items-center justify-center"
                title="配置文件夹"
              >
                <Settings className="w-4 h-4" />
              </div>
            )}
            {onDelete && (
              <div 
                role="button"
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors no-drag cursor-pointer flex items-center justify-center"
                title="删除文件夹"
              >
                <Trash2 className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popped out files */}
      <AnimatePresence>
        {isOpen && item.children && item.children.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute left-full ml-8 flex no-drag items-start"
            style={{ marginRight: '-4.8rem' }} /* 16rem * 30% = 4.8rem */
          >
            {item.children.map((child, idx) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredChildId(child.id)}
                onMouseLeave={() => setHoveredChildId(null)}
                style={{ 
                  marginRight: '-4.8rem', /* 16rem * 30% = 4.8rem */
                  zIndex: hoveredChildId === child.id ? 50 : item.children!.length - idx,
                  position: 'relative'
                }}
              >
                <ChildCard 
                  child={child} 
                  onOpenFile={onOpenFile} 
                  onRemoveFromFolder={onRemoveFromFolder} 
                  onUpdate={onUpdate}
                  parentId={item.id} 
                  obsidianApp={obsidianApp}
                  obsidianAPI={obsidianAPI}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
