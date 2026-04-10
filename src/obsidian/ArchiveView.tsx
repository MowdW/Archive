import { TextFileView, WorkspaceLeaf } from 'obsidian';
import * as obsidianAPI from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import App from '../App';
import ArchivePlugin from './main';
import '../index.css';

export const VIEW_TYPE_ARCHIVE = 'archive-folders-view';

export class ArchiveView extends TextFileView {
  plugin: ArchivePlugin;
  root: Root | null = null;
  data: string = '[]';
  isLoaded: boolean = false;

  constructor(leaf: WorkspaceLeaf, plugin: ArchivePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE_ARCHIVE;
  }

  getDisplayText() {
    return this.file ? this.file.basename : '档案库';
  }

  getIcon() {
    return 'layout-dashboard';
  }

  getViewData() {
    return this.data;
  }

  setViewData(data: string, clear: boolean) {
    this.data = data;
    this.isLoaded = true;
    this.renderReact();
  }

  clear() {
    this.data = '[]';
    this.isLoaded = false;
    this.renderReact();
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('archive-folders-container');
    
    this.root = createRoot(container);
    this.renderReact();
  }

  renderReact() {
    if (!this.root) return;
    
    this.root.render(
      <App 
        key={this.file?.path || 'default'}
        plugin={this.plugin} 
        view={this} 
        initialData={this.data} 
        isLoaded={this.isLoaded} 
        obsidianAPI={obsidianAPI}
      />
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}
