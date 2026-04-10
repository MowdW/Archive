import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { ArchiveView, VIEW_TYPE_ARCHIVE } from './ArchiveView';
import { FileItem } from '../types';

export interface ArchiveSettings {
  folders: FileItem[];
  newFileSaveLocation: string;
}

const DEFAULT_SETTINGS: ArchiveSettings = {
  folders: [],
  newFileSaveLocation: ''
}

export default class ArchivePlugin extends Plugin {
  settings!: ArchiveSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_ARCHIVE,
      (leaf) => new ArchiveView(leaf, this)
    );
    
    this.registerExtensions(['arc'], VIEW_TYPE_ARCHIVE);

    this.addRibbonIcon('inbox', '新建档案', async () => {
      await this.createNewBoard();
    });

    this.addCommand({
      id: 'create-new-archiv',
      name: '新建档案',
      callback: async () => {
        await this.createNewBoard();
      }
    });

    // Register settings tab
    this.addSettingTab(new ArchiveSettingTab(this.app, this));
  }

  async createNewBoard() {
    const { workspace } = this.app;
    const targetFolderName = '档案';
    
    // Check if "档案" folder exists, if not create it
    let folder = this.app.vault.getAbstractFileByPath(targetFolderName);
    if (!folder) {
      await this.app.vault.createFolder(targetFolderName);
    }
    
    let folderPath = targetFolderName;
    
    let fileName = '未命名.arc';
    let i = 1;
    while (this.app.vault.getAbstractFileByPath(`${folderPath}/${fileName}`)) {
      fileName = `未命名 ${i}.arc`;
      i++;
    }
    
    const filePath = `${folderPath}/${fileName}`;
    const file = await this.app.vault.create(filePath, '[]');
    
    const leaf = workspace.getLeaf('tab');
    await leaf.setViewState({
      type: VIEW_TYPE_ARCHIVE,
      state: { file: file.path }
    });
    workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async onunload() {}
}

import { App, PluginSettingTab, Setting } from 'obsidian';

class ArchiveSettingTab extends PluginSettingTab {
  plugin: ArchivePlugin;

  constructor(app: App, plugin: ArchivePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: '档案库插件设置' });

    new Setting(containerEl)
      .setName('新建文件保存位置')
      .setDesc('设置通过插件创建的新文件的保存位置，留空则使用默认位置')
      .addText((text) =>
        text
          .setPlaceholder('例如：文件夹/子文件夹')
          .setValue(this.plugin.settings.newFileSaveLocation)
          .onChange(async (value) => {
            this.plugin.settings.newFileSaveLocation = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
