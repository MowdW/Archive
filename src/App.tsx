import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, FolderPlus, FilePlus, X, File as FileIcon, Trash2, Tag, Plus, Maximize2, ExternalLink } from 'lucide-react';
import { Folder } from '@/src/components/Folder';
import { FileItem, FilterCondition } from '@/src/types';
import { cn } from '@/src/lib/utils';
import type { TFile } from 'obsidian';
import type ArchivePlugin from './obsidian/main';
import yaml from 'js-yaml';
import Markdown from 'react-markdown';

import type { TextFileView, Component } from 'obsidian';

import remarkGfm from 'remark-gfm';

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
      <div className={cn("markdown-body prose prose-sm max-w-none dark:prose-invert", className)} style={style}>
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    );
  }

  return (
    <div className={cn("!bg-transparent !text-current", className)} style={style}>
      <div ref={containerRef} className="markdown-preview-view !bg-transparent !p-0 !m-0" />
    </div>
  );
};

interface AppProps {
  plugin?: any;
  view?: any;
  initialData?: string;
  isLoaded?: boolean;
  obsidianAPI?: any;
}

const COLORS = ['#fbbf24', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#64748b'];

const getRandomRotation = () => (Math.random() * 10) - 5;

const MOCK_DATA: FileItem[] = [
  {
    id: '1',
    name: '集めたもの',
    subName: '迷你档案',
    type: 'folder',
    color: '#fbbf24',
    filterConditions: [],
    x: 100,
    y: 150,
    rotation: getRandomRotation(),
    children: [
      { id: '1-1', name: 'This is a Note', subName: 'md', type: 'file', path: 'note1.md', content: 'A distraction free space for thoughts, ideas and to-dos.\n\nNotes have been designed to use no visible options and buttons while typing, so you can get the most clear minded thinking experience possible. There is no focus mode to enable - it\'s always focus mode.\n\nSome handy shortcuts that\'s good to know\n- ⌘ 1 to 4 to change the size of text\n- Begin a paragraph with one to four hashes (#) to create headings' },
      { id: '1-2', name: 'Another Note', subName: 'md', type: 'file', path: 'note2.md', content: 'There\'s also a button to the left of each paragraph, only visible when you\'re moving the mouse pointer around. Use that to access all actions you can take on a paragraph. More actions will be available with time.\n\nSelecting a piece of text brings up a Toolbar at the bottom. The Toolbar will let you edit individual words and characters like making something bold or adding a highlight.' },
    ]
  },
  {
    id: '2',
    name: '旅の记录',
    subName: '旅行日志',
    type: 'folder',
    color: '#ec4899',
    filterConditions: [{ id: 'c1', type: 'path', operator: 'contains', value: '旅行' }],
    x: 500,
    y: 150,
    rotation: getRandomRotation(),
    children: [
      { id: '2-1', name: 'Kyoto Trip', subName: 'md', type: 'file', path: 'kyoto.md', content: 'Day 1: Arrived in Kyoto. The weather is beautiful. Visited Fushimi Inari Taisha in the afternoon. The thousands of vermilion torii gates are breathtaking.\n\nDay 2: Explored Arashiyama Bamboo Grove early in the morning to avoid the crowds. Had amazing matcha ice cream.' }
    ]
  },
  {
    id: '3',
    name: 'Ideas',
    subName: 'md',
    type: 'file',
    path: 'ideas.md',
    x: 900,
    y: 200,
    rotation: getRandomRotation(),
    content: '1. Build a new Obsidian plugin for visual project management.\n2. Use an infinite canvas approach.\n3. Allow dragging and dropping files into folders.\n4. Make it look like a physical whiteboard with cards.'
  }
];

const FileCard = ({ item, onOpenFile, onConfigure, onDelete, isDraggingNode, obsidianApp, obsidianAPI }: { item: FileItem, onOpenFile: (path: string) => void, onConfigure?: (id: string) => void, onDelete?: (id: string) => void, isDraggingNode: boolean, obsidianApp?: any, obsidianAPI?: any }) => {
  const isVideo = item.subName && ['mp4', 'webm'].includes(item.subName.toLowerCase());
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const handleMediaLoad = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const target = e.target as any;
    const width = target.videoWidth || target.naturalWidth;
    const height = target.videoHeight || target.naturalHeight;
    if (width && height) {
      setAspectRatio(width / height);
    }
  };

  const cardWidth = 16; // 16rem
  const cardHeight = aspectRatio ? cardWidth / aspectRatio : 20; // 20rem
  
  return (
    <div
      className="relative group rounded-3xl shadow-xl border border-obsidian-bg-alt flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-150 cursor-pointer overflow-hidden"
      style={{ 
        backgroundColor: item.color || 'var(--background-primary)',
        width: `${cardWidth}rem`,
        height: `${cardHeight}rem`,
        transform: `rotate(${item.rotation || 0}deg)`
      }}
      onDoubleClick={(e) => {
        if (isDraggingNode) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onOpenFile(item.path || item.id);
      }}
    >
      {item.imageUrl ? (
        isVideo ? (
          <video 
            src={item.imageUrl} 
            className="w-full h-full object-cover pointer-events-none" 
            controls={false} 
            muted 
            loop 
            draggable={false} 
            onLoadedMetadata={handleMediaLoad}
          />
        ) : (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover pointer-events-none" 
            referrerPolicy="no-referrer" 
            draggable={false} 
            onLoad={handleMediaLoad}
          />
        )
      ) : (
        <div className="p-8 flex flex-col h-full overflow-hidden">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 shrink-0">{item.name}</h3>
          <div className="flex-1 overflow-y-auto no-scrollbar" onWheel={(e) => e.stopPropagation()}>
            <MarkdownPreview 
              app={obsidianApp} 
              obsidianAPI={obsidianAPI}
              content={item.content || 'A distraction free space for thoughts, ideas and to-dos.\n\nNotes have been designed to use no visible options and buttons while typing...'} 
              sourcePath={item.path || ''}
              className="text-sm text-gray-900 opacity-70 leading-relaxed"
            />
          </div>
        </div>
      )}

      <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {onConfigure && !item.imageUrl && (
          <div 
            role="button"
            onClick={(e) => { e.stopPropagation(); onConfigure(item.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-gray-900/5 hover:bg-gray-900/10 text-gray-900 transition-colors no-drag cursor-pointer flex items-center justify-center"
            title="配置文档"
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
            title="删除文档"
          >
            <Trash2 className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};

const StickyNote = ({ item, onUpdate, onConfigure, onDelete, isDraggingNode, obsidianApp, obsidianAPI }: { item: FileItem, onUpdate: (id: string, content: string) => void, onConfigure?: (id: string) => void, onDelete?: (id: string) => void, isDraggingNode: boolean, obsidianApp?: any, obsidianAPI?: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.content || '');

  return (
    <div
      className="relative group w-64 h-80 rounded-3xl shadow-xl border border-obsidian-bg-alt p-8 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-150 cursor-text overflow-hidden"
      style={{ 
        backgroundColor: item.color || '#fef08a',
        transform: `rotate(${item.rotation || 0}deg)`
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onUpdate(item.id, text);
          }}
          className="w-full h-full !bg-transparent !shadow-none !border-0 !outline-none focus:!border-0 focus:!outline-none focus:!ring-0 resize-none text-gray-900 font-medium leading-relaxed"
          style={{ backgroundColor: 'transparent', fontFamily: item.fontFamily || undefined }}
          placeholder="输入便签内容..."
        />
      ) : (
        <div 
          className="w-full h-full text-gray-900 font-medium leading-relaxed overflow-y-auto no-scrollbar"
          style={{ fontFamily: item.fontFamily || undefined }}
          onWheel={(e) => e.stopPropagation()}
        >
          {text ? (
            <MarkdownPreview app={obsidianApp} obsidianAPI={obsidianAPI} content={text} sourcePath="" />
          ) : (
            '双击编辑便签...'
          )}
        </div>
      )}

      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
        {onConfigure && (
          <div 
            role="button"
            onClick={(e) => { e.stopPropagation(); onConfigure(item.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-gray-900/5 hover:bg-gray-900/10 text-gray-900 transition-colors no-drag cursor-pointer flex items-center justify-center"
            title="配置便签"
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
            title="删除便签"
          >
            <Trash2 className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};

const LinkCard = ({ item, onDelete }: { item: FileItem, onDelete: (id: string) => void }) => {
  return (
    <div
      className="relative group w-64 rounded-3xl shadow-xl border border-obsidian-bg-alt p-6 flex flex-col hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
      style={{ 
        backgroundColor: item.color || 'var(--background-primary)',
        transform: `rotate(${item.rotation || 0}deg)` 
      }}
      onDoubleClick={() => window.open(item.url, '_blank')}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-900/5 flex items-center justify-center text-gray-900">
          <ExternalLink className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">{item.name}</h3>
          <p className="text-xs text-gray-900 opacity-50 truncate">{item.url}</p>
        </div>
      </div>
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-2" referrerPolicy="no-referrer" />
      )}
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div 
          role="button"
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors no-drag cursor-pointer flex items-center justify-center"
          title="删除链接"
        >
          <Trash2 className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

const Frame = ({ item, onUpdate, onDelete }: { item: FileItem, onUpdate: (id: string, updates: Partial<FileItem>) => void, onDelete: (id: string) => void }) => {
  const [isResizing, setIsResizing] = useState(false);

  return (
    <div
      className="relative group rounded-3xl border-2 border-dashed border-obsidian-text/20 bg-transparent transition-all"
      style={{ 
        width: item.width || 400, 
        height: item.height || 400,
        backgroundColor: 'transparent',
        borderColor: item.color ? `${item.color}40` : 'var(--text-muted)'
      }}
    >
      <div className="absolute -top-8 left-0 flex items-center gap-2">
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, { name: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          className="bg-transparent border-none outline-none font-bold text-obsidian-text/60 focus:text-obsidian-text no-drag"
          placeholder="分组名称..."
        />
      </div>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
        <div 
          role="button"
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors no-drag cursor-pointer flex items-center justify-center"
          title="删除分组"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center text-obsidian-text/20 hover:text-obsidian-text/40"
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = item.width || 400;
          const startH = item.height || 400;

          const onMove = (moveEvent: PointerEvent) => {
            const dw = (moveEvent.clientX - startX);
            const dh = (moveEvent.clientY - startY);
            onUpdate(item.id, { 
              width: Math.max(200, startW + dw), 
              height: Math.max(200, startH + dh) 
            });
          };

          const onUp = () => {
            setIsResizing(false);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };

          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
      >
        <Maximize2 className="w-4 h-4 rotate-90" />
      </div>
    </div>
  );
};

const Minimap = ({ items, pan, scale, setPan, windowSize }: { items: FileItem[], pan: {x: number, y: number}, scale: number, setPan: (pan: {x: number, y: number}) => void, windowSize: {w: number, h: number} }) => {
  if (items.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  items.forEach(item => {
    const x = item.x || 0;
    const y = item.y || 0;
    const w = item.type === 'frame' ? (item.width || 400) : 256;
    const h = item.type === 'frame' ? (item.height || 400) : (item.type === 'sticky' ? 256 : 320);
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  });

  const padding = 500;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const contentWidth = Math.max(maxX - minX, 1);
  const contentHeight = Math.max(maxY - minY, 1);
  
  const mapWidth = 200;
  const mapHeight = 150;
  
  const mapScaleX = mapWidth / contentWidth;
  const mapScaleY = mapHeight / contentHeight;
  const mapScale = Math.min(mapScaleX, mapScaleY);
  
  const actualMapWidth = contentWidth * mapScale;
  const actualMapHeight = contentHeight * mapScale;

  const viewportWidth = windowSize.w / scale;
  const viewportHeight = windowSize.h / scale;
  
  const viewportX = -pan.x / scale;
  const viewportY = -pan.y / scale;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const targetCanvasX = minX + clickX / mapScale;
    const targetCanvasY = minY + clickY / mapScale;
    
    setPan({
      x: -targetCanvasX * scale + windowSize.w / 2,
      y: -targetCanvasY * scale + windowSize.h / 2
    });
  };

  return (
    <div 
      className="absolute bottom-4 right-4 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer no-pan"
      style={{ width: actualMapWidth, height: actualMapHeight }}
      onClick={handleMapClick}
    >
      {items.map(item => {
        const x = item.x || 0;
        const y = item.y || 0;
        const w = item.type === 'frame' ? (item.width || 400) : 256;
        const h = item.type === 'frame' ? (item.height || 400) : (item.type === 'sticky' ? 256 : 320);
        
        return (
          <div
            key={item.id}
            className="absolute rounded-sm opacity-50"
            style={{
              left: (x - minX) * mapScale,
              top: (y - minY) * mapScale,
              width: w * mapScale,
              height: h * mapScale,
              backgroundColor: item.color || (item.type === 'folder' ? '#3b82f6' : item.type === 'frame' ? 'transparent' : '#9ca3af'),
              border: item.type === 'frame' ? '1px solid #9ca3af' : 'none'
            }}
          />
        );
      })}
      
      <div 
        className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none transition-all duration-100"
        style={{
          left: (viewportX - minX) * mapScale,
          top: (viewportY - minY) * mapScale,
          width: viewportWidth * mapScale,
          height: viewportHeight * mapScale,
        }}
      />
    </div>
  );
};

export default function App({ plugin, view, initialData, isLoaded, obsidianAPI }: AppProps) {
  const obsidianApp = plugin?.app;
  const [items, setItems] = useState<FileItem[]>(() => {
    if (!obsidianApp) return MOCK_DATA;
    return [];
  });
  const [isInitialized, setIsInitialized] = useState(!obsidianApp);

  useEffect(() => {
    if (obsidianApp && isLoaded && !isInitialized) {
      if (initialData && initialData !== '[]') {
        try {
          setItems(JSON.parse(initialData));
        } catch (e) {
          console.error('Failed to parse initial data', e);
        }
      }
      setIsInitialized(true);
    }
  }, [isLoaded, initialData, isInitialized, obsidianApp]);

  // Save data whenever items change
  useEffect(() => {
    if (view && isInitialized) {
      (view as any).data = JSON.stringify(items, null, 2);
      view.requestSave();
    }
  }, [items, view, isInitialized]);
  
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editMetadata, setEditMetadata] = useState<any>({});
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [configFolderId, setConfigFolderId] = useState<string | null>(null);
  
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [existingFilePath, setExistingFilePath] = useState('');
  const [editingConditions, setEditingConditions] = useState<FilterCondition[]>([]);
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [editingFontFamily, setEditingFontFamily] = useState('');
  const [folderColor, setFolderColor] = useState(COLORS[0]);

  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{x: number, y: number}>({x: 0, y: 0});

  // Canvas State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);

  const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Folder navigation state
  const [currentFolderStack, setCurrentFolderStack] = useState<string[]>([]);

  // Navigation functions
  const enterFolder = (folderId: string) => {
    setCurrentFolderStack(prev => [...prev, folderId]);
  };

  const goBack = () => {
    setCurrentFolderStack(prev => prev.slice(0, -1));
  };

  const goToRoot = () => {
    setCurrentFolderStack([]);
  };

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Enter to enter selected folder
        if (selectedIds.size === 1) {
          const selectedId = Array.from(selectedIds)[0];
          const selectedItem = items.find(i => i.id === selectedId);
          if (selectedItem && selectedItem.type === 'folder') {
            enterFolder(selectedItem.id);
          }
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // Backspace to go back
        if (currentFolderStack.length > 0) {
          goBack();
        }
      } else if (e.key === 'Escape') {
        // Escape to go to root
        if (currentFolderStack.length > 0) {
          goToRoot();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFolderStack, selectedIds, items]);

  const updateItemsInTree = (list: FileItem[], updater: (item: FileItem) => FileItem): FileItem[] => {
    return list.map(item => {
      const updatedItem = updater(item);
      if (updatedItem.children) {
        return { ...updatedItem, children: updateItemsInTree(updatedItem.children, updater) };
      }
      return updatedItem;
    });
  };

  const alignSelected = (type: 'left' | 'top' | 'distribute-h' | 'distribute-v') => {
    if (selectedIds.size < 2) return;
    
    const selectedItems = getCurrentItems().filter(i => selectedIds.has(i.id));
    if (selectedItems.length < 2) return;

    let newItems = items;
    
    if (type === 'left') {
      const minX = Math.min(...selectedItems.map(i => i.x || 0));
      newItems = updateItemsInTree(items, item => 
        selectedIds.has(item.id) ? { ...item, x: minX } : item
      );
    } else if (type === 'top') {
      const minY = Math.min(...selectedItems.map(i => i.y || 0));
      newItems = updateItemsInTree(items, item => 
        selectedIds.has(item.id) ? { ...item, y: minY } : item
      );
    } else if (type === 'distribute-h') {
      const sorted = [...selectedItems].sort((a, b) => (a.x || 0) - (b.x || 0));
      const minX = sorted[0].x || 0;
      const maxX = sorted[sorted.length - 1].x || 0;
      const step = (maxX - minX) / (sorted.length - 1);
      
      newItems = updateItemsInTree(items, item => {
        if (selectedIds.has(item.id)) {
          const index = sorted.findIndex(i => i.id === item.id);
          return { ...item, x: minX + step * index };
        }
        return item;
      });
    } else if (type === 'distribute-v') {
      const sorted = [...selectedItems].sort((a, b) => (a.y || 0) - (b.y || 0));
      const minY = sorted[0].y || 0;
      const maxY = sorted[sorted.length - 1].y || 0;
      const step = (maxY - minY) / (sorted.length - 1);
      
      newItems = updateItemsInTree(items, item => {
        if (selectedIds.has(item.id)) {
          const index = sorted.findIndex(i => i.id === item.id);
          return { ...item, y: minY + step * index };
        }
        return item;
      });
    }

    updateItems(newItems);
  };

  const autoLayout = (type: 'grid' | 'circle' | 'tree') => {
    const currentItems = getCurrentItems();
    if (currentItems.length === 0) return;

    let newItems = items;
    const padding = 350;

    if (type === 'grid') {
      const cols = Math.ceil(Math.sqrt(currentItems.length));
      newItems = updateItemsInTree(items, item => {
        const index = currentItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          const row = Math.floor(index / cols);
          const col = index % cols;
          return { ...item, x: col * padding, y: row * padding };
        }
        return item;
      });
    } else if (type === 'circle') {
      const radius = Math.max(currentItems.length * 50, 300);
      newItems = updateItemsInTree(items, item => {
        const index = currentItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          const angle = (index / currentItems.length) * Math.PI * 2;
          return { 
            ...item, 
            x: Math.cos(angle) * radius, 
            y: Math.sin(angle) * radius 
          };
        }
        return item;
      });
    } else if (type === 'tree') {
      // Simple horizontal tree layout
      newItems = updateItemsInTree(items, item => {
        const index = currentItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          const row = index % 3;
          const col = Math.floor(index / 3);
          return { ...item, x: col * padding, y: row * padding };
        }
        return item;
      });
    }

    updateItems(newItems);
  };

  const autoColor = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const currentItems = getCurrentItems();
      if (currentItems.length === 0) {
        alert('No current items');
        return;
      }

      let colorIndex = 0;
      let coloredCount = 0;
      const newItems = updateItemsInTree(items, item => {
        const index = currentItems.findIndex(i => i.id === item.id);
        if (index !== -1 && item.type !== 'frame') {
          const newColor = COLORS[colorIndex % COLORS.length];
          colorIndex++;
          coloredCount++;
          return { ...item, color: newColor };
        }
        return item;
      });

      updateItems(newItems);
    } catch (e) {
      alert('Error in autoColor: ' + e);
    }
  };

  const getCurrentItems = useCallback(() => {
    let currentItems = items;
    for (const folderId of currentFolderStack) {
      const folder = currentItems.find(i => i.id === folderId);
      if (folder && folder.type === 'folder' && folder.children) {
        currentItems = folder.children;
      } else {
        break;
      }
    }
    return currentItems;
  }, [items, currentFolderStack]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentItems = getCurrentItems();
    if (currentItems.length === 0) {
      setPan({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setScale(1);
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    currentItems.forEach(item => {
      const x = item.x || 0;
      const y = item.y || 0;
      const w = item.type === 'frame' ? (item.width || 400) : 256;
      const h = item.type === 'frame' ? (item.height || 400) : (item.type === 'sticky' ? 256 : 320);
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const padding = 100;
    const contentWidth = Math.max(maxX - minX, 1);
    const contentHeight = Math.max(maxY - minY, 1);
    
    const scaleX = (window.innerWidth - padding * 2) / contentWidth;
    const scaleY = (window.innerHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1);

    const centerX = minX + contentWidth / 2;
    const centerY = minY + contentHeight / 2;

    setPan({
      x: window.innerWidth / 2 - centerX * newScale,
      y: window.innerHeight / 2 - centerY * newScale
    });
    setScale(newScale);
  }, [currentFolderStack]); // Only trigger on folder stack change

  const addItemsToCurrentFolder = (newItemsToAdd: FileItem[]) => {
    if (currentFolderStack.length === 0) {
      updateItems([...items, ...newItemsToAdd]);
      return;
    }

    const newItems = JSON.parse(JSON.stringify(items)) as FileItem[];
    let currentLevel = newItems;
    for (let i = 0; i < currentFolderStack.length; i++) {
      const folderId = currentFolderStack[i];
      const folder = currentLevel.find((item: FileItem) => item.id === folderId);
      if (folder && folder.type === 'folder') {
        if (!folder.children) folder.children = [];
        if (i === currentFolderStack.length - 1) {
          folder.children.push(...newItemsToAdd);
        } else {
          currentLevel = folder.children;
        }
      } else {
        break;
      }
    }
    updateItems(newItems);
  };

  const dragDeltaRef = useRef({ x: 0, y: 0 });
  const draggedItemsRef = useRef<Set<string>>(new Set());

  const saveToObsidian = async (newItems: FileItem[]) => {
    // We now save via the useEffect that calls view.setViewData
  };

  const updateItems = (newItems: FileItem[]) => {
    setItems(newItems);
    saveToObsidian(newItems);
  };

  const refreshObsidianFiles = useCallback(async () => {
    if (!obsidianApp) return;
    const allFiles = obsidianApp.vault.getFiles();
    const markdownFiles = obsidianApp.vault.getMarkdownFiles();
    
    // Fetch contents asynchronously
    const fileContents = new Map<string, string>();
    const fileUrls = new Map<string, string>();

    for (const f of allFiles) {
      if (f.extension === 'md') {
        let content = await obsidianApp.vault.cachedRead(f);
        // Strip YAML frontmatter
        if (content.startsWith('---\n')) {
          const endOfFrontmatter = content.indexOf('\n---\n', 4);
          if (endOfFrontmatter !== -1) {
            content = content.substring(endOfFrontmatter + 5);
          }
        }
        fileContents.set(f.path, content.trim().substring(0, 500));
      } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'webm'].includes(f.extension.toLowerCase())) {
        fileUrls.set(f.path, obsidianApp.vault.getResourcePath(f));
      }
    }

    setItems(prevItems => {
      const updateTree = (list: FileItem[]): FileItem[] => {
        return list.map(item => {
          if (item.type === 'folder' && item.filterConditions && item.filterConditions.length > 0) {
            const matchedFiles = allFiles.filter(f => {
              return item.filterConditions!.every(cond => {
                if (cond.type === 'path') {
                  const hasPath = f.path.toLowerCase().includes(cond.value.toLowerCase());
                  return cond.operator === 'contains' ? hasPath : !hasPath;
                } else if (cond.type === 'property' && f.extension === 'md') {
                  const cache = obsidianApp.metadataCache.getFileCache(f);
                  const frontmatter = cache?.frontmatter || {};
                  const propValue = frontmatter[cond.key!]?.toString().toLowerCase() || '';
                  const hasProp = propValue.includes(cond.value.toLowerCase());
                  return cond.operator === 'contains' ? hasProp : !hasProp;
                }
                return true;
              });
            });

            return {
              ...item,
              children: matchedFiles.map(f => {
                const existingChild = item.children?.find(c => c.id === f.path);
                return {
                  ...existingChild,
                  id: f.path,
                  name: f.basename,
                  subName: f.extension,
                  type: 'file',
                  path: f.path,
                  content: fileContents.get(f.path),
                  imageUrl: fileUrls.get(f.path)
                };
              })
            };
          } else if (item.type === 'folder' && item.children) {
            return {
              ...item,
              children: updateTree(item.children)
            };
          } else if (item.type === 'file') {
            return {
              ...item,
              content: item.path ? fileContents.get(item.path) : item.content,
              imageUrl: item.path ? fileUrls.get(item.path) : item.imageUrl
            };
          }
          return item;
        });
      };
      return updateTree(prevItems);
    });
  }, [obsidianApp]);

  useEffect(() => {
    if (obsidianApp) {
      refreshObsidianFiles();
      const eventRef = obsidianApp.vault.on('modify', refreshObsidianFiles);
      const createRef = obsidianApp.vault.on('create', refreshObsidianFiles);
      const deleteRef = obsidianApp.vault.on('delete', refreshObsidianFiles);
      const renameRef = obsidianApp.vault.on('rename', refreshObsidianFiles);
      const metadataRef = obsidianApp.metadataCache.on('changed', refreshObsidianFiles);
      
      return () => {
        obsidianApp.vault.offref(eventRef);
        obsidianApp.vault.offref(createRef);
        obsidianApp.vault.offref(deleteRef);
        obsidianApp.vault.offref(renameRef);
        obsidianApp.metadataCache.offref(metadataRef);
      };
    }
  }, [obsidianApp, refreshObsidianFiles]);

  // Canvas Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoomSensitivity = 0.002;
      const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 5);
      setScale(newScale);
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.no-pan')) {
      return;
    }
    
    if (e.button === 0) {
      if (e.shiftKey) {
        setIsSelecting(true);
        const startX = (e.clientX - pan.x) / scale;
        const startY = (e.clientY - pan.y) / scale;
        setSelectionStart({ x: startX, y: startY });
        setSelectionRect({ x: startX, y: startY, w: 0, h: 0 });
      } else {
        setIsPanning(true);
        setSelectedIds(new Set());
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handleNodePointerDown = (e: React.PointerEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[role="button"]') || target.closest('.no-drag')) {
      return;
    }
    e.stopPropagation();
    
    dragDeltaRef.current = { x: 0, y: 0 };
    let newSelected = selectedIds;

    if (e.shiftKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        newSelected = next;
        return next;
      });
    } else {
      if (!selectedIds.has(id)) {
        newSelected = new Set([id]);
        setSelectedIds(newSelected);
      }
    }
    setDraggingNodeId(id);
    setIsDraggingNode(false);

    const dragged = new Set<string>(newSelected);
    dragged.add(id);
    
    const draggedItem = items.find(i => i.id === id);
    if (draggedItem?.type === 'frame') {
      const frameX = draggedItem.x || 0;
      const frameY = draggedItem.y || 0;
      const frameW = draggedItem.width || 400;
      const frameH = draggedItem.height || 400;
      
      items.forEach(item => {
        const itemX = item.x || 0;
        const itemY = item.y || 0;
        if (itemX >= frameX && itemX <= frameX + frameW && itemY >= frameY && itemY <= frameY + frameH) {
          dragged.add(item.id);
        }
      });
    }
    draggedItemsRef.current = dragged;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    } else if (draggingNodeId) {
      setIsDraggingNode(true);
      const dx = e.movementX / scale;
      const dy = e.movementY / scale;
      
      dragDeltaRef.current.x += dx;
      dragDeltaRef.current.y += dy;
      
      draggedItemsRef.current.forEach(id => {
        const el = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
        if (el) {
          el.style.transform = `translate(${dragDeltaRef.current.x}px, ${dragDeltaRef.current.y}px) scale(1)`;
        }
      });
    } else if (isSelecting && selectionStart) {
      const currentX = (e.clientX - pan.x) / scale;
      const currentY = (e.clientY - pan.y) / scale;
      const x = Math.min(selectionStart.x, currentX);
      const y = Math.min(selectionStart.y, currentY);
      const w = Math.abs(selectionStart.x - currentX);
      const h = Math.abs(selectionStart.y - currentY);
      setSelectionRect({ x, y, w, h });
      
      const newSelected = new Set<string>();
      const currentItems = getCurrentItems();
      currentItems.forEach(item => {
        const itemX = item.x || 0;
        const itemY = item.y || 0;
        const itemW = item.type === 'frame' ? (item.width || 400) : 256;
        const itemH = item.type === 'frame' ? (item.height || 400) : (item.type === 'sticky' ? 256 : 320);
        
        if (itemX < x + w && itemX + itemW > x && itemY < y + h && itemY + itemH > y) {
          newSelected.add(item.id);
        }
      });
      setSelectedIds(newSelected);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionRect(null);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (draggingNodeId) {
      const draggedEl = document.querySelector(`[data-node-id="${draggingNodeId}"]`) as HTMLElement;
      if (draggedEl) draggedEl.style.pointerEvents = 'none';

      const element = document.elementFromPoint(e.clientX, e.clientY);
      const folderEl = element?.closest('[data-folder-id]');
      const targetFolderId = folderEl?.getAttribute('data-folder-id');

      if (draggedEl) draggedEl.style.pointerEvents = 'auto';

      let newItems = items;
      if (dragDeltaRef.current.x !== 0 || dragDeltaRef.current.y !== 0) {
        newItems = updateItemsInTree(items, item => {
          if (draggedItemsRef.current.has(item.id)) {
            let newX = (item.x || 0) + dragDeltaRef.current.x;
            let newY = (item.y || 0) + dragDeltaRef.current.y;
            
            if (snapToGrid) {
              newX = Math.round(newX / 20) * 20;
              newY = Math.round(newY / 20) * 20;
            }
            
            return {
              ...item,
              x: newX,
              y: newY
            };
          }
          return item;
        });
      }

      if (targetFolderId && targetFolderId !== draggingNodeId) {
        handleMoveToFolder(draggingNodeId, targetFolderId, newItems);
      } else {
        updateItems(newItems);
      }

      // Clear transform after state update to avoid position jump
      draggedItemsRef.current.forEach(id => {
        const el = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
        if (el) {
          el.style.transform = '';
        }
      });

      setDraggingNodeId(null);
      setIsDraggingNode(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      
      dragDeltaRef.current = { x: 0, y: 0 };
      draggedItemsRef.current = new Set();
    }
  };

  const handleMoveToFolder = (sourceId: string, targetId: string, currentItems: FileItem[] = items) => {
    let sourceItem: FileItem | undefined;
    
    // 1. Remove sourceItem from tree
    const removeFromTree = (list: FileItem[]): FileItem[] => {
      const index = list.findIndex(i => i.id === sourceId);
      if (index > -1) {
        sourceItem = list[index];
        const newList = [...list];
        newList.splice(index, 1);
        return newList;
      }
      return list.map(item => {
        if (item.children) {
          const newChildren = removeFromTree(item.children);
          if (newChildren !== item.children) {
            return { ...item, children: newChildren };
          }
        }
        return item;
      });
    };

    let newItems = removeFromTree(currentItems);

    if (!sourceItem) {
      updateItems(newItems);
      return;
    }

    // 2. Add to target folder
    const addToTarget = (list: FileItem[]): FileItem[] => {
      return list.map(item => {
        if (item.id === targetId && item.type === 'folder') {
          return { ...item, children: [...(item.children || []), sourceItem!] };
        }
        if (item.children) {
          return { ...item, children: addToTarget(item.children) };
        }
        return item;
      });
    };

    newItems = addToTarget(newItems);
    updateItems(newItems);
  };

  const handleRemoveFromFolder = (folderId: string, childId: string) => {
    let removedChild: FileItem | undefined;

    const removeFromTree = (list: FileItem[]): FileItem[] => {
      return list.map(item => {
        if (item.id === folderId && item.type === 'folder' && item.children) {
          const childIndex = item.children.findIndex(c => c.id === childId);
          if (childIndex > -1) {
            const newChildren = [...item.children];
            const [child] = newChildren.splice(childIndex, 1);
            removedChild = child;
            removedChild.x = (item.x || 0) + 300;
            removedChild.y = (item.y || 0);
            removedChild.rotation = getRandomRotation();
            return { ...item, children: newChildren };
          }
        }
        if (item.children) {
          const newChildren = removeFromTree(item.children);
          if (newChildren !== item.children) {
            return { ...item, children: newChildren };
          }
        }
        return item;
      });
    };

    const newItems = removeFromTree(items);
    if (removedChild) {
      newItems.push(removedChild);
    }
    updateItems(newItems);
  };

  useEffect(() => {
    if (obsidianApp) {
      const isDark = document.body.classList.contains('theme-dark');
      setTheme(isDark ? 'dark' : 'light');

      const observer = new MutationObserver(() => {
        const dark = document.body.classList.contains('theme-dark');
        setTheme(dark ? 'dark' : 'light');
      });

      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, [obsidianApp]);

  const handleOpenFile = async (path: string) => {
    if (obsidianApp) {
      const file = obsidianApp.vault.getAbstractFileByPath(path);
      if (file && 'extension' in file) {
        try {
          // @ts-ignore
          const leaf = obsidianApp.workspace.getLeaf('window');
          await leaf.openFile(file as any);
          return;
        } catch (e) {
          console.error('Failed to open in new window, falling back to modal:', e);
        }
      }
    }

    // Find item in flat items or children
    let item = items.find(i => i.path === path || i.id === path);
    if (!item) {
      for (const parent of items) {
        if (parent.children) {
          const child = parent.children.find(c => c.path === path || c.id === path);
          if (child) {
            item = child;
            break;
          }
        }
      }
    }

    if (item) {
      // If it's a markdown file and we are in obsidian, refresh its content
      if (item.subName === 'md' && obsidianApp && item.path) {
        const file = obsidianApp.vault.getAbstractFileByPath(item.path);
        if (file instanceof (window as any).obsidian.TFile) {
          let content = await obsidianApp.vault.read(file as any);
          let properties: any = {};
          // Strip YAML frontmatter
          if (content.startsWith('---\n')) {
            const endOfFrontmatter = content.indexOf('\n---\n', 4);
            if (endOfFrontmatter !== -1) {
              const yamlContent = content.substring(4, endOfFrontmatter);
              try {
                properties = yaml.load(yamlContent) || {};
              } catch (e) {
                console.error('Failed to parse YAML:', e);
              }
              content = content.substring(endOfFrontmatter + 5);
            }
          }
          item = { ...item, content: content.trim(), metadata: properties };
        }
      }
      setPreviewItem(item);
      setEditContent(item.content || '');
      setEditMetadata(item.metadata || {});
      setIsEditing(false);
    } else if (obsidianApp) {
      const file = obsidianApp.vault.getAbstractFileByPath(path);
      if (file && 'extension' in file) {
        let content = '';
        let properties: any = {};
        if ((file as any).extension === 'md') {
          content = await obsidianApp.vault.read(file as any);
          if (content.startsWith('---\n')) {
            const endOfFrontmatter = content.indexOf('\n---\n', 4);
            if (endOfFrontmatter !== -1) {
              const yamlContent = content.substring(4, endOfFrontmatter);
              try {
                properties = yaml.load(yamlContent) || {};
              } catch (e) {
                console.error('Failed to parse YAML:', e);
              }
              content = content.substring(endOfFrontmatter + 5);
            }
          }
        }
        setPreviewItem({
          id: file.path,
          name: (file as any).basename || file.name,
          type: 'file',
          path: file.path,
          subName: (file as any).extension,
          content: content.trim(),
          metadata: properties,
          imageUrl: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'webm'].includes((file as any).extension.toLowerCase()) 
            ? obsidianApp.vault.getResourcePath(file as any) 
            : undefined
        });
        setEditContent(content.trim());
        setEditMetadata(properties || {});
        setIsEditing(false);
      }
    } else {
      console.log(`预览文件: ${path}`);
    }
  };

  const handleSave = async () => {
    if (obsidianApp && previewItem?.path) {
      const file = obsidianApp.vault.getAbstractFileByPath(previewItem.path);
      if (file instanceof (window as any).obsidian.TFile) {
        try {
          // Reconstruct content with YAML if needed
          let finalContent = editContent;
          if (editMetadata && Object.keys(editMetadata).length > 0) {
            const yamlStr = yaml.dump(editMetadata);
            finalContent = `---\n${yamlStr}---\n\n${editContent}`;
          }
          await obsidianApp.vault.modify(file as any, finalContent);
          
          // Update local state
          setPreviewItem({ ...previewItem, content: editContent, metadata: editMetadata });
          
          // Also update the item in the main items list to reflect changes on the whiteboard
          updateItems(items.map(item => {
            if (item.path === previewItem.path) {
              return { ...item, content: editContent, metadata: editMetadata };
            }
            if (item.children) {
              return {
                ...item,
                children: item.children.map(child => 
                  child.path === previewItem.path ? { ...child, content: editContent, metadata: editMetadata } : child
                )
              };
            }
            return item;
          }));
          
          setIsEditing(false);
        } catch (e) {
          console.error('Failed to save file:', e);
        }
      }
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const canvasX = (contextMenuPos.x - pan.x) / scale;
    const canvasY = (contextMenuPos.y - pan.y) / scale;
    
    let finalName = newFolderName.trim();
    let counter = 1;
    while (items.some(item => item.type === 'folder' && item.name === finalName)) {
      finalName = `${newFolderName.trim()} ${counter}`;
      counter++;
    }

    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: finalName,
      content: newFolderDesc,
      type: 'folder',
      color: folderColor || '#fbbf24',
      children: [],
      filterConditions: [],
      x: canvasX,
      y: canvasY,
      rotation: getRandomRotation()
    };
    addItemsToCurrentFolder([newFolder]);
    setNewFolderName('');
    setNewFolderDesc('');
    setIsNewFolderModalOpen(false);
  };

  const handleAddExistingFile = () => {
    if (!existingFilePath.trim() || !obsidianApp) return;
    
    const file = obsidianApp.vault.getAbstractFileByPath(existingFilePath);
    if (!file || !('extension' in file)) {
      // Not a file or doesn't exist
      console.error('文件不存在或路径错误');
      return;
    }

    const canvasX = (contextMenuPos.x - pan.x) / scale;
    const canvasY = (contextMenuPos.y - pan.y) / scale;

    const newFile: FileItem = {
      id: file.path,
      name: (file as any).basename,
      subName: (file as any).extension,
      type: 'file',
      path: file.path,
      x: canvasX,
      y: canvasY,
      rotation: getRandomRotation()
    };
    
    addItemsToCurrentFolder([newFile]);
    setExistingFilePath('');
    setIsAddExistingModalOpen(false);
    refreshObsidianFiles();
  };

  const handleUpdateSticky = (id: string, content: string) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, content };
      }
      if (item.children) {
        return {
          ...item,
          children: item.children.map(child => child.id === id ? { ...child, content } : child)
        };
      }
      return item;
    });
    updateItems(newItems);
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    
    let baseName = newFileName.replace(/\.md$/, '').trim();
    let finalFileName = `${baseName}.md`;
    let counter = 1;

    const canvasX = (contextMenuPos.x - pan.x) / scale;
    const canvasY = (contextMenuPos.y - pan.y) / scale;
    
    if (obsidianApp && plugin) {
      // Use the save location from settings if provided
      const saveLocation = plugin.settings?.newFileSaveLocation || '';
      let fullPath = finalFileName;
      
      if (saveLocation) {
        fullPath = `${saveLocation}/${finalFileName}`;
      }
      
      while (obsidianApp.vault.getAbstractFileByPath(fullPath)) {
        finalFileName = `${baseName} ${counter}.md`;
        fullPath = saveLocation ? `${saveLocation}/${finalFileName}` : finalFileName;
        counter++;
      }

      try {
        // Ensure the save directory exists
        if (saveLocation) {
          const folders = saveLocation.split('/');
          let currentPath = '';
          for (const folder of folders) {
            currentPath = currentPath ? `${currentPath}/${folder}` : folder;
            const folderExists = obsidianApp.vault.getAbstractFileByPath(currentPath);
            if (!folderExists) {
              await obsidianApp.vault.createFolder(currentPath);
            }
          }
        }
        
        await obsidianApp.vault.create(fullPath, '');
        refreshObsidianFiles();
        // Add to canvas
        const newFile: FileItem = {
          id: fullPath,
          name: finalFileName.replace('.md', ''),
          subName: 'md',
          type: 'file',
          path: fullPath,
          x: canvasX,
          y: canvasY,
          rotation: getRandomRotation()
        };
        addItemsToCurrentFolder([newFile]);
        setNewFileName('');
        setIsNewFileModalOpen(false);
      } catch (e) {
        console.error(e);
        console.error('创建文件失败');
      }
    } else {
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: newFileName.replace('.md', ''),
        subName: 'md',
        type: 'file',
        path: newFileName,
        x: canvasX,
        y: canvasY,
        rotation: getRandomRotation()
      };
      addItemsToCurrentFolder([newFile]);
    }
    setNewFileName('');
    setIsNewFileModalOpen(false);
  };

  const openConfigModal = (id: string) => {
    let foundItem: FileItem | undefined;
    const findItem = (list: FileItem[]) => {
      for (const item of list) {
        if (item.id === id) {
          foundItem = item;
          return;
        }
        if (item.children) {
          findItem(item.children);
        }
      }
    };
    findItem(items);

    if (foundItem) {
      setEditingConditions(foundItem.filterConditions || []);
      setFolderColor(foundItem.color || COLORS[0]);
      setEditingName(foundItem.name);
      setEditingDesc(foundItem.content || '');
      setEditingFontFamily(foundItem.fontFamily || '');
      setConfigFolderId(id);
    }
  };

  const handleSaveConfig = () => {
    if (!configFolderId) return;
    const newItems = updateItemsInTree(items, item => {
      if (item.id === configFolderId) {
        return {
          ...item,
          name: editingName,
          content: editingDesc,
          filterConditions: editingConditions,
          color: folderColor || undefined,
          fontFamily: editingFontFamily || undefined
        };
      }
      return item;
    });
    updateItems(newItems);
    setConfigFolderId(null);
    if (obsidianApp) setTimeout(refreshObsidianFiles, 100);
  };

  const addCondition = () => {
    setEditingConditions([...editingConditions, { id: Date.now().toString(), type: 'path', operator: 'contains', value: '' }]);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setEditingConditions(editingConditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCondition = (id: string) => {
    setEditingConditions(editingConditions.filter(c => c.id !== id));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setContextMenu({ x, y });
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleDeleteCard = (id: string) => {
    const deleteFromTree = (list: FileItem[]): FileItem[] => {
      return list.filter(item => item.id !== id).map(item => {
        if (item.children) {
          return { ...item, children: deleteFromTree(item.children) };
        }
        return item;
      });
    };
    updateItems(deleteFromTree(items));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const canvasX = (x - pan.x) / scale;
    const canvasY = (y - pan.y) / scale;

    if (!obsidianApp) return;

    // 1. Check Obsidian internal drag manager
    const dragManager = (obsidianApp as any).dragManager;
    if (dragManager && dragManager.draggable) {
      const draggable = dragManager.draggable;
      let filesToDrop: any[] = [];
      
      if (draggable.type === 'file' && draggable.file) {
        filesToDrop = [draggable.file];
      } else if (draggable.type === 'files' && draggable.files) {
        filesToDrop = draggable.files;
      }

      if (filesToDrop.length > 0) {
        const newItemsToAdd: FileItem[] = [];
        filesToDrop.forEach((file, i) => {
          if ('extension' in file) {
            newItemsToAdd.push({
              id: file.path,
              name: file.basename,
              subName: file.extension,
              type: 'file',
              path: file.path,
              x: canvasX + i * 20,
              y: canvasY + i * 20,
              rotation: getRandomRotation()
            });
          }
        });
        addItemsToCurrentFolder(newItemsToAdd);
        refreshObsidianFiles();
        return;
      }
    }

    // 2. Handle OS file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newItemsToAdd: FileItem[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        const arrayBuffer = await file.arrayBuffer();
        
        let fileName = file.name;
        let j = 1;
        while (obsidianApp.vault.getAbstractFileByPath(fileName)) {
          const parts = file.name.split('.');
          const ext = parts.pop();
          const base = parts.join('.');
          fileName = `${base} ${j}.${ext}`;
          j++;
        }
        
        const createdFile = await obsidianApp.vault.createBinary(fileName, arrayBuffer);
        
        newItemsToAdd.push({
          id: createdFile.path,
          name: createdFile.basename,
          subName: createdFile.extension,
          type: 'file',
          path: createdFile.path,
          x: canvasX + i * 20,
          y: canvasY + i * 20,
          rotation: getRandomRotation()
        });
      }
      addItemsToCurrentFolder(newItemsToAdd);
      refreshObsidianFiles();
      return;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div 
      className={cn(
        "w-full h-[92vh] text-obsidian-text font-sans selection:bg-yellow-200 relative overflow-hidden touch-none",
        theme === 'dark' ? 'theme-dark' : ''
      )}
      style={{ background: 'var(--background-primary)' }}
      onWheel={handleWheel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => setContextMenu(null)}
    >
      {/* Breadcrumb Navigation */}
      {currentFolderStack.length > 0 && (
        <div 
          className="absolute top-4 left-4 z-50 rounded-lg p-2 flex items-center gap-2 no-pan"
          style={{ background: 'var(--background-primary)' }}
        >
          <div 
            role="button"
            onClick={goToRoot}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-sm font-medium"
          >
            主页
          </div>
          {currentFolderStack.map((folderId, index) => {
            const folder = items.find(i => i.id === folderId);
            return (
              <div key={folderId} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <div 
                  role="button"
                  onClick={() => setCurrentFolderStack(currentFolderStack.slice(0, index + 1))}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-sm font-medium truncate max-w-[120px]"
                  title={folder?.name}
                >
                  {folder?.name || '文件夹'}
                </div>
              </div>
            );
          })}
          <div className="ml-4 flex gap-2">
            <div 
              role="button"
              onClick={goBack}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              title="返回"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </div>
            <div 
              role="button"
              onClick={goToRoot}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              title="返回主页"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" x2="3" y1="12" y2="12"/>
              </svg>
            </div>
          </div>
        </div>
      )}



      {/* Infinite Canvas */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'absolute',
          pointerEvents: isPanning ? 'none' : 'auto'
        }}
      >
        {/* Selection Rect */}
        {selectionRect && (
          <div 
            className="absolute border-2 border-yellow-400 bg-yellow-400/10 pointer-events-none z-[100]"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.w,
              height: selectionRect.h
            }}
          />
        )}

        <AnimatePresence>
          {(() => {
            return getCurrentItems();
          })().map((item) => (
            <motion.div
              key={item.id}
              data-node-id={item.id}
              data-folder-id={item.type === 'folder' ? item.id : undefined}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: draggingNodeId ? 1 : (selectedIds.has(item.id) ? 1.05 : 1) }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.05 }}
              style={{
                position: 'absolute',
                left: item.x || 0,
                top: item.y || 0,
                zIndex: draggingNodeId === item.id ? 50 : (selectedIds.has(item.id) ? 40 : (item.type === 'frame' ? 5 : 10)),
                cursor: draggingNodeId === item.id ? 'grabbing' : 'grab',
                borderRadius: '12px'
              }}
              onPointerDown={(e) => handleNodePointerDown(e, item.id)}
            >
              {item.type === 'folder' ? (
                <Folder 
                  item={item} 
                  onOpenFile={handleOpenFile}
                  onConfigure={openConfigModal}
                  onRemoveFromFolder={handleRemoveFromFolder}
                  onDelete={handleDeleteCard}
                  onUpdate={handleUpdateSticky}
                  onEnter={enterFolder}
                  isDraggingNode={isDraggingNode}
                  obsidianApp={obsidianApp}
                  obsidianAPI={obsidianAPI}
                />
              ) : item.type === 'sticky' ? (
                <StickyNote
                  item={item}
                  onUpdate={handleUpdateSticky}
                  onConfigure={openConfigModal}
                  onDelete={handleDeleteCard}
                  isDraggingNode={isDraggingNode}
                  obsidianApp={obsidianApp}
                  obsidianAPI={obsidianAPI}
                />
              ) : item.type === 'link' ? (
                <LinkCard
                  item={item}
                  onDelete={handleDeleteCard}
                />
              ) : item.type === 'frame' ? (
                <Frame
                  item={item}
                  onUpdate={(id, updates) => updateItems(items.map(i => i.id === id ? { ...i, ...updates } : i))}
                  onDelete={handleDeleteCard}
                />
              ) : (
                <FileCard 
                  item={item} 
                  onOpenFile={handleOpenFile} 
                  onConfigure={openConfigModal}
                  onDelete={handleDeleteCard}
                  isDraggingNode={isDraggingNode}
                  obsidianApp={obsidianApp}
                  obsidianAPI={obsidianAPI}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 overflow-hidden pointer-events-auto no-pan"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div 
              role="button"
              onClick={() => { setIsNewFileModalOpen(true); setContextMenu(null); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer text-gray-700"
            >
              <FilePlus className="w-4 h-4 text-gray-500" />
              <span className="font-medium">新建文件</span>
            </div>
            <div 
              role="button"
              onClick={() => { setIsAddExistingModalOpen(true); setContextMenu(null); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer text-gray-700"
            >
              <FilePlus className="w-4 h-4 text-gray-500" />
              <span className="font-medium">添加已有文件/媒体</span>
            </div>
            <div 
              role="button"
              onClick={() => {
                const canvasX = (contextMenuPos.x - pan.x) / scale;
                const canvasY = (contextMenuPos.y - pan.y) / scale;
                const newItem: FileItem = {
                  id: Date.now().toString(),
                  name: '新便签',
                  type: 'sticky',
                  content: '',
                  color: '#fef08a',
                  x: canvasX,
                  y: canvasY,
                  rotation: getRandomRotation()
                };
                addItemsToCurrentFolder([newItem]);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer text-gray-700"
            >
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="font-medium">新建便签</span>
            </div>
            <div 
              role="button"
              onClick={() => { setIsAddLinkModalOpen(true); setContextMenu(null); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer text-gray-700"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span className="font-medium">添加网页链接</span>
            </div>
            <div 
              role="button"
              onClick={() => {
                const canvasX = (contextMenuPos.x - pan.x) / scale;
                const canvasY = (contextMenuPos.y - pan.y) / scale;
                const newItem: FileItem = {
                  id: Date.now().toString(),
                  name: '新分组',
                  type: 'frame',
                  width: 400,
                  height: 400,
                  x: canvasX,
                  y: canvasY
                };
                addItemsToCurrentFolder([newItem]);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer text-gray-700"
            >
              <Maximize2 className="w-4 h-4 text-gray-500" />
              <span className="font-medium">新建分组框</span>
            </div>
            <div className="h-px bg-gray-100 my-1" />
            <div 
              role="button"
              onClick={() => { 
                if (currentFolderStack.length >= 3) {
                  alert('最多支持三层文件夹');
                  return;
                }
                setFolderColor(COLORS[0]);
                setIsNewFolderModalOpen(true); 
                setContextMenu(null); 
              }}
              className={cn("w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors cursor-pointer", currentFolderStack.length >= 3 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50")}
            >
              <FolderPlus className="w-4 h-4 text-gray-500" />
              <span className="font-medium">新建文件夹</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimap */}
      <Minimap items={getCurrentItems()} pan={pan} scale={scale} setPan={setPan} windowSize={windowSize} />

      {/* Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-gray-200 dark:border-gray-800 p-2 flex items-center gap-2 no-pan shadow-md transition-all duration-300 hover:shadow-lg" style={{ background: 'var(--background-primary)' }}>
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-medium mr-2">对齐</div>
          <button onPointerDown={(e) => { e.stopPropagation(); alignSelected('left'); }} disabled={selectedIds.size < 2} className={cn("p-2 rounded transition-all duration-200", selectedIds.size < 2 ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")} title="左对齐" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22V2M14 6H4M20 14H4M10 18H4M16 10H4"/></svg>
          </button>
          <button onPointerDown={(e) => { e.stopPropagation(); alignSelected('top'); }} disabled={selectedIds.size < 2} className={cn("p-2 rounded transition-all duration-200", selectedIds.size < 2 ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")} title="顶部对齐" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4H2M6 14V4M14 20V4M18 10V4M10 16V4"/></svg>
          </button>
          <button onPointerDown={(e) => { e.stopPropagation(); alignSelected('distribute-h'); }} disabled={selectedIds.size < 2} className={cn("p-2 rounded transition-all duration-200", selectedIds.size < 2 ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")} title="水平等距" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22V2M20 22V2M14 14H10M14 10H10"/></svg>
          </button>
          <button onPointerDown={(e) => { e.stopPropagation(); alignSelected('distribute-v'); }} disabled={selectedIds.size < 2} className={cn("p-2 rounded transition-all duration-200", selectedIds.size < 2 ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")} title="垂直等距" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4H2M22 20H2M14 14V10M10 14V10"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-medium mr-2">排版</div>
          <button onPointerDown={(e) => { e.stopPropagation(); autoLayout('grid'); }} className="p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="网格阵列" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
          <button onPointerDown={(e) => { e.stopPropagation(); autoLayout('circle'); }} className="p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="圆形" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
          </button>
          <button onPointerDown={(e) => { e.stopPropagation(); autoLayout('tree'); }} className="p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="树状图" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M5 10l7-7 7 7"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-medium mr-2">颜色</div>
          <button onPointerDown={autoColor} className="p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="自动配色" style={{ background: 'var(--background-primary)', boxShadow: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-2 px-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">网格吸附</span>
          </label>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto no-pan" onClick={() => setIsNewFolderModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">新建文件夹</h3>
                <div role="button" onClick={() => setIsNewFolderModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></div>
              </div>
              <input autoFocus type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="输入文件夹名称..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <textarea value={newFolderDesc} onChange={e => setNewFolderDesc(e.target.value)} placeholder="输入文件夹简介 (可选)..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-24" />
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">封面颜色</label>
                <div className="flex gap-2.5 flex-wrap items-center">
                  {COLORS.map(c => (
                    <div
                      key={c}
                      role="button"
                      onClick={() => setFolderColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer", 
                        folderColor === c ? "border-gray-900 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="relative w-8 h-8 rounded-full border-2 border-gray-200 overflow-hidden">
                      <input 
                        type="color" 
                        value={folderColor.startsWith('#') ? folderColor : '#ffffff'} 
                        onChange={e => setFolderColor(e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                      />
                    </div>
                    <input 
                      type="text" 
                      value={folderColor} 
                      onChange={e => setFolderColor(e.target.value)}
                      placeholder="#HEX"
                      className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              <div role="button" onClick={handleCreateFolder} className="w-full bg-yellow-400 text-white font-bold rounded-xl py-3 hover:bg-yellow-500 transition-colors cursor-pointer text-center">创建</div>
            </motion.div>
          </div>
        )}

        {isAddExistingModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto no-pan" onClick={() => setIsAddExistingModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">添加已有文件/媒体</h3>
                <div role="button" onClick={() => setIsAddExistingModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></div>
              </div>
              <input autoFocus type="text" value={existingFilePath} onChange={e => setExistingFilePath(e.target.value)} placeholder="输入文件完整路径 (如: images/photo.png)..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <div role="button" onClick={handleAddExistingFile} className="w-full bg-yellow-400 text-white font-bold rounded-xl py-3 hover:bg-yellow-500 transition-colors cursor-pointer text-center">添加</div>
            </motion.div>
          </div>
        )}

        {isNewFileModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto no-pan" onClick={() => setIsNewFileModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">新建文件</h3>
                <div role="button" onClick={() => setIsNewFileModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></div>
              </div>
              <input autoFocus type="text" value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="输入文件名称 (如: 笔记.md)..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <div role="button" onClick={handleCreateFile} className="w-full bg-yellow-400 text-white font-bold rounded-xl py-3 hover:bg-yellow-500 transition-colors cursor-pointer text-center">创建</div>
            </motion.div>
          </div>
        )}

        {isAddLinkModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto no-pan" onClick={() => setIsAddLinkModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">添加网页链接</h3>
                <div role="button" onClick={() => setIsAddLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></div>
              </div>
              <div className="space-y-4 mb-6">
                <input autoFocus type="text" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="链接名称..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <input type="text" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div 
                role="button" 
                onClick={() => {
                  if (!newLinkUrl) return;
                  const canvasX = (contextMenuPos.x - pan.x) / scale;
                  const canvasY = (contextMenuPos.y - pan.y) / scale;
                  const newItem: FileItem = {
                    id: Date.now().toString(),
                    name: newLinkName || newLinkUrl,
                    type: 'link',
                    url: newLinkUrl,
                    x: canvasX,
                    y: canvasY,
                    rotation: getRandomRotation()
                  };
                  addItemsToCurrentFolder([newItem]);
                  setIsAddLinkModalOpen(false);
                  setNewLinkUrl('');
                  setNewLinkName('');
                }} 
                className="w-full bg-yellow-400 text-white font-bold rounded-xl py-3 hover:bg-yellow-500 transition-colors cursor-pointer text-center"
              >
                添加
              </div>
            </motion.div>
          </div>
        )}

        {configFolderId && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto no-pan" onClick={() => setConfigFolderId(null)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl p-6 w-[550px] shadow-2xl" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">
                  {items.find(i => i.id === configFolderId)?.type === 'folder' 
                    ? '配置文件夹' 
                    : items.find(i => i.id === configFolderId)?.type === 'sticky' 
                      ? '配置便签' 
                      : '配置文档'}
                </h3>
                <div role="button" onClick={() => setConfigFolderId(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></div>
              </div>

              <div className="space-y-4 mb-6">
                {items.find(i => i.id === configFolderId)?.type !== 'sticky' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                    <input 
                      type="text" 
                      value={editingName} 
                      onChange={e => setEditingName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {items.find(i => i.id === configFolderId)?.type === 'sticky' ? '内容' : '简介'}
                  </label>
                  <textarea 
                    value={editingDesc} 
                    onChange={e => setEditingDesc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-20"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">封面颜色</label>
                <div className="flex gap-3 items-center">
                  <div
                    role="button"
                    onClick={() => setFolderColor('')}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 bg-white cursor-pointer", 
                      !folderColor ? "border-gray-900 scale-110" : "border-gray-200"
                    )}
                    title="默认颜色"
                  />
                  {COLORS.map(c => (
                    <div
                      key={c}
                      role="button"
                      onClick={() => setFolderColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer", 
                        folderColor === c ? "border-gray-900 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="relative w-8 h-8 rounded-full border-2 border-gray-200 overflow-hidden">
                      <input 
                        type="color" 
                        value={folderColor.startsWith('#') ? folderColor : '#ffffff'} 
                        onChange={e => setFolderColor(e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                      />
                    </div>
                    <input 
                      type="text" 
                      value={folderColor} 
                      onChange={e => setFolderColor(e.target.value)}
                      placeholder="#HEX"
                      className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {items.find(i => i.id === configFolderId)?.type === 'sticky' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">手写字体</label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { name: '默认字体', value: '' },
                      { name: '英文手写 (Caveat)', value: "'Caveat', cursive" },
                      { name: '中文手写 (Zhi Mang Xing)', value: "'Zhi Mang Xing', cursive" },
                      { name: '中文手写 (Ma Shan Zheng)', value: "'Ma Shan Zheng', cursive" },
                      { name: '中文手写 (Liu Jian Mao Cao)', value: "'Liu Jian Mao Cao', cursive" }
                    ].map(font => (
                      <div
                        key={font.name}
                        role="button"
                        onClick={() => setEditingFontFamily(font.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl border-2 transition-all cursor-pointer text-sm",
                          editingFontFamily === font.value 
                            ? "border-yellow-400 bg-yellow-50 text-yellow-700 font-bold" 
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        )}
                        style={{ fontFamily: font.value || undefined }}
                      >
                        {font.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {items.find(i => i.id === configFolderId)?.type === 'folder' && (
                <>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">自动筛选规则</label>
                  </div>
                  <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                    {editingConditions.map((cond) => (
                      <div key={cond.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <select 
                          value={cond.type} 
                          onChange={e => updateCondition(cond.id, { type: e.target.value as 'path' | 'property' })}
                          className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="path">路径</option>
                          <option value="property">属性</option>
                        </select>

                        {cond.type === 'property' && (
                          <input 
                            type="text" 
                            placeholder="属性名" 
                            value={cond.key || ''} 
                            onChange={e => updateCondition(cond.id, { key: e.target.value })}
                            className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm w-24 outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                        )}

                        <select 
                          value={cond.operator} 
                          onChange={e => updateCondition(cond.id, { operator: e.target.value as 'contains' | 'not_contains' })}
                          className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="contains">包含</option>
                          <option value="not_contains">排除</option>
                        </select>

                        <input 
                          type="text" 
                          placeholder="匹配值..." 
                          value={cond.value} 
                          onChange={e => updateCondition(cond.id, { value: e.target.value })}
                          className="flex-1 bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
                        />

                        <div role="button" onClick={() => removeCondition(cond.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-colors cursor-pointer flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                    
                    {editingConditions.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">暂无筛选规则，您可以手动拖入文件。</p>
                    )}
                  </div>

                  <div role="button" onClick={addCondition} className="w-full border-2 border-dashed border-gray-200 text-gray-500 rounded-xl py-2 mb-6 hover:border-yellow-400 hover:text-yellow-600 transition-colors text-sm font-medium cursor-pointer text-center">
                    + 添加筛选条件
                  </div>
                </>
              )}

              <div role="button" onClick={handleSaveConfig} className="w-full bg-yellow-400 text-white font-bold rounded-xl py-3 hover:bg-yellow-500 transition-colors cursor-pointer text-center">保存配置</div>
            </motion.div>
          </div>
        )}

        {previewItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-12 no-pan" onClick={() => setPreviewItem(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="bg-obsidian-bg rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto border border-obsidian-bg-alt"
              onClick={e => e.stopPropagation()}
            >
              {/* Obsidian-like Header */}
              <div className="px-6 py-3 border-b border-obsidian-bg-alt flex justify-between items-center bg-obsidian-bg sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <FileIcon className="w-4 h-4 text-obsidian-accent" />
                  <span className="text-sm font-medium text-obsidian-text opacity-80">{previewItem.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!previewItem.imageUrl && (
                    <div 
                      role="button" 
                      onClick={() => {
                        if (isEditing) {
                          handleSave();
                        } else {
                          setIsEditing(true);
                        }
                      }} 
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-sm font-medium",
                        isEditing 
                          ? "bg-obsidian-accent text-white hover:bg-obsidian-accent/90" 
                          : "hover:bg-obsidian-bg-alt text-obsidian-text opacity-60 hover:opacity-100"
                      )}
                      title={isEditing ? "保存更改" : "编辑文档"}
                    >
                      {isEditing ? (
                        <>
                          <FilePlus className="w-4 h-4" />
                          <span>保存</span>
                        </>
                      ) : (
                        <>
                          <FilePlus className="w-4 h-4" />
                          <span>编辑</span>
                        </>
                      )}
                    </div>
                  )}
                  {isEditing && (
                    <div 
                      role="button" 
                      onClick={() => setIsEditing(false)} 
                      className="p-1.5 hover:bg-obsidian-bg-alt rounded-md transition-colors cursor-pointer text-obsidian-text opacity-60 hover:opacity-100" 
                      title="取消编辑"
                    >
                      <X className="w-4 h-4" />
                    </div>
                  )}
                  <div role="button" onClick={() => {
                    const file = obsidianApp?.vault.getAbstractFileByPath(previewItem.path!);
                    if (file) {
                      obsidianApp?.workspace.getLeaf('tab').openFile(file as any);
                      setPreviewItem(null);
                    }
                  }} className="p-1.5 hover:bg-obsidian-bg-alt rounded-md transition-colors cursor-pointer text-obsidian-text opacity-60 hover:opacity-100" title="在编辑器中打开">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="p-1.5 hover:bg-obsidian-bg-alt rounded-md transition-colors cursor-pointer text-obsidian-text opacity-60 hover:opacity-100">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div role="button" onClick={() => setPreviewItem(null)} className="p-1.5 hover:bg-obsidian-bg-alt rounded-md transition-colors cursor-pointer text-obsidian-text opacity-60 hover:opacity-100">
                    <X className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-obsidian-bg">
                <div className="max-w-4xl mx-auto px-8 py-12">
                  {previewItem.imageUrl ? (
                    <div className="flex justify-center items-center">
                      {previewItem.subName && ['mp4', 'webm'].includes(previewItem.subName.toLowerCase()) ? (
                        <video src={previewItem.imageUrl} className="max-w-full rounded-lg shadow-sm" controls autoPlay loop />
                      ) : (
                        <img src={previewItem.imageUrl} alt={previewItem.name} className="max-w-full rounded-lg shadow-sm object-contain" referrerPolicy="no-referrer" />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {/* Properties Section - Matching Screenshot */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 text-obsidian-text opacity-60 text-sm font-medium">
                          <span>笔记属性</span>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Tags Property */}
                          <div className="flex items-center group">
                            <div className="w-32 flex items-center gap-2 text-obsidian-text opacity-50 text-sm">
                              <Tag className="w-4 h-4" />
                              <span>tags</span>
                            </div>
                            <div className="flex-1 flex flex-wrap gap-2 p-2 border border-transparent hover:border-obsidian-bg-alt rounded-md transition-colors min-h-[40px] items-center">
                              {isEditing ? (
                                <input 
                                  type="text"
                                  value={Array.isArray(editMetadata.tags) ? editMetadata.tags.join(', ') : (editMetadata.tags || '')}
                                  onChange={(e) => setEditMetadata({ ...editMetadata, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                                  className="w-full bg-transparent border-none outline-none text-sm text-obsidian-text"
                                  placeholder="用逗号分隔标签..."
                                />
                              ) : (
                                previewItem.metadata?.tags ? (
                                  (Array.isArray(previewItem.metadata.tags) ? previewItem.metadata.tags : [previewItem.metadata.tags]).map((tag: string) => (
                                    <div key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-obsidian-accent/10 text-obsidian-accent rounded-full text-xs font-medium border border-obsidian-accent/20">
                                      <span>{tag}</span>
                                      <X className="w-3 h-3 cursor-pointer hover:text-obsidian-accent/80" />
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-obsidian-text opacity-30 text-sm italic">无标签</span>
                                )
                              )}
                            </div>
                          </div>

                          {/* Other Metadata */}
                          {Object.entries(isEditing ? editMetadata : (previewItem.metadata || {})).filter(([k]) => k !== 'tags').map(([key, value]) => (
                            <div key={key} className="flex items-center group">
                              <div className="w-32 flex items-center gap-2 text-obsidian-text opacity-50 text-sm">
                                <FileIcon className="w-4 h-4" />
                                <span>{key}</span>
                              </div>
                              <div className="flex-1 p-2 border border-transparent hover:border-obsidian-bg-alt rounded-md transition-colors text-sm text-obsidian-text">
                                {isEditing ? (
                                  <input 
                                    type="text"
                                    value={String(value)}
                                    onChange={(e) => setEditMetadata({ ...editMetadata, [key]: e.target.value })}
                                    className="w-full bg-transparent border-none outline-none text-sm text-obsidian-text"
                                  />
                                ) : (
                                  String(value)
                                )}
                              </div>
                            </div>
                          ))}

                          {isEditing && (
                            <div 
                              role="button" 
                              onClick={() => {
                                const key = prompt('输入属性名称:');
                                if (key) setEditMetadata({ ...editMetadata, [key]: '' });
                              }}
                              className="flex items-center gap-2 text-obsidian-text opacity-40 hover:opacity-60 text-sm cursor-pointer py-2 px-1 transition-opacity"
                            >
                              <Plus className="w-4 h-4" />
                              <span>添加笔记属性</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="obsidian-preview-content">
                        {isEditing ? (
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-[60vh] bg-obsidian-bg-alt/30 border border-obsidian-bg-alt rounded-xl p-6 outline-none text-obsidian-text font-mono resize-none leading-relaxed focus:ring-1 focus:ring-obsidian-accent/30"
                            placeholder="开始输入内容..."
                            autoFocus
                          />
                        ) : (
                          <Markdown>
                            {previewItem.content || '暂无内容'}
                          </Markdown>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

