'use strict';

const {
    Plugin,
    ItemView,
    Notice,
    PluginSettingTab,
    Setting,
} = require('obsidian');

const VIEW_TYPE = 'save-from-ai';

const FOLDERS = [
    '30_AI_Logs/claude',
    '30_AI_Logs/chatgpt',
    '10_Projects/cafe',
    '10_Projects/6bit',
    '10_Projects/vrchat',
    '20_Daily',
    '00_Profile',
];

const DEFAULT_SETTINGS = {
    // API Keys (stored locally in data.json, never sent anywhere by this plugin)
    claudeApiKey:  '',
    openaiApiKey:  '',
    // Behaviour
    restApiPort:   27124,
    autoDetect:    true,
};

// ─────────────────────────────────────────────
//  Side-panel view
// ─────────────────────────────────────────────
class SaveFromAIView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.source = 'claude';
    }

    getViewType()    { return VIEW_TYPE; }
    getDisplayText() { return 'Save from AI'; }
    getIcon()        { return 'bot'; }

    async onOpen()  { this.buildUI(); }
    async onClose() {}

    buildUI() {
        const root = this.containerEl.children[1];
        root.empty();
        root.addClass('sfa-root');

        // ── Header ──────────────────────────────
        const hdr = root.createEl('div', { cls: 'sfa-header' });
        hdr.createEl('span', { cls: 'sfa-header-title', text: 'AI会話を保存' });

        // ── Source toggle ────────────────────────
        const srcSec = root.createEl('div', { cls: 'sfa-section' });
        srcSec.createEl('div', { cls: 'sfa-label', text: 'ソース' });
        const btnGroup = srcSec.createEl('div', { cls: 'sfa-btn-group' });
        this.claudeBtn  = btnGroup.createEl('button', { cls: 'sfa-src-btn sfa-active', text: 'Claude' });
        this.chatgptBtn = btnGroup.createEl('button', { cls: 'sfa-src-btn', text: 'ChatGPT' });
        this.claudeBtn.addEventListener('click',  () => this.setSource('claude'));
        this.chatgptBtn.addEventListener('click', () => this.setSource('chatgpt'));

        // ── Title ────────────────────────────────
        const titleSec = root.createEl('div', { cls: 'sfa-section' });
        titleSec.createEl('div', { cls: 'sfa-label', text: 'タイトル' });
        this.titleInput = titleSec.createEl('input', { type: 'text', cls: 'sfa-input' });
        this.titleInput.placeholder = '空欄で日時自動生成';

        // ── Folder ───────────────────────────────
        const folderSec = root.createEl('div', { cls: 'sfa-section' });
        folderSec.createEl('div', { cls: 'sfa-label', text: '保存先フォルダ' });
        this.folderSel = folderSec.createEl('select', { cls: 'sfa-select' });
        FOLDERS.forEach(f => this.folderSel.createEl('option', { value: f, text: f }));
        this.folderSel.value = '30_AI_Logs/claude';

        // ── Textarea ─────────────────────────────
        const contentSec = root.createEl('div', { cls: 'sfa-section sfa-grow' });
        contentSec.createEl('div', { cls: 'sfa-label', text: '会話内容' });
        this.textarea = contentSec.createEl('textarea', { cls: 'sfa-textarea' });
        this.textarea.placeholder = 'ClaudeやChatGPTの会話をここに貼り付けてください...';
        this.charCount = contentSec.createEl('div', { cls: 'sfa-char-count', text: '0 文字' });
        this.textarea.addEventListener('input', () => {
            this.charCount.setText(`${this.textarea.value.length.toLocaleString()} 文字`);
            if (this.plugin.settings.autoDetect) this.detectSource();
        });

        // ── Buttons ──────────────────────────────
        const btnRow = root.createEl('div', { cls: 'sfa-btn-row' });
        const saveBtn  = btnRow.createEl('button', { cls: 'sfa-save-btn',  text: '保存' });
        const clearBtn = btnRow.createEl('button', { cls: 'sfa-clear-btn', text: 'クリア' });
        saveBtn.addEventListener('click',  () => this.save());
        clearBtn.addEventListener('click', () => this.clear());

        // ── Status ───────────────────────────────
        this.statusEl = root.createEl('div', { cls: 'sfa-status' });
    }

    setSource(src) {
        this.source = src;
        if (src === 'claude') {
            this.claudeBtn.addClass('sfa-active');
            this.chatgptBtn.removeClass('sfa-active');
            if (this.folderSel.value === '30_AI_Logs/chatgpt') {
                this.folderSel.value = '30_AI_Logs/claude';
            }
        } else {
            this.chatgptBtn.addClass('sfa-active');
            this.claudeBtn.removeClass('sfa-active');
            if (this.folderSel.value === '30_AI_Logs/claude') {
                this.folderSel.value = '30_AI_Logs/chatgpt';
            }
        }
    }

    detectSource() {
        const t = this.textarea.value.toLowerCase();
        if (/\bclaude\b/.test(t) && !/chatgpt|gpt-/.test(t)) {
            this.setSource('claude');
        } else if (/chatgpt|gpt-/.test(t)) {
            this.setSource('chatgpt');
        }
    }

    clear() {
        this.titleInput.value = '';
        this.textarea.value   = '';
        this.charCount.setText('0 文字');
        this.setStatus('', '');
    }

    setStatus(msg, type) {
        this.statusEl.setText(msg);
        this.statusEl.className = 'sfa-status' + (type ? ` sfa-status-${type}` : '');
    }

    buildFileName(title) {
        const now = new Date();
        const d   = now.toISOString().slice(0, 10);
        const t   = now.toTimeString().slice(0, 5).replace(':', '');
        if (title.trim()) {
            const safe = title.trim().replace(/[\\/:*?"<>|#^[\]]/g, '_').slice(0, 60);
            return `${d}_${t}_${safe}.md`;
        }
        return `${d}_${t}_${this.source}.md`;
    }

    buildContent(title, body) {
        const now  = new Date();
        const date = now.toISOString().slice(0, 10);
        const ts   = now.toISOString().replace('T', ' ').slice(0, 19);
        const src  = this.source === 'claude' ? 'Claude' : 'ChatGPT';
        const h1   = title.trim() || `${src} - ${ts}`;

        return [
            '---',
            `source: ${src}`,
            `date: ${date}`,
            `title: "${h1.replace(/"/g, '\\"')}"`,
            `tags: [ai-log, ${this.source}]`,
            '---',
            '',
            `# ${h1}`,
            '',
            body.trim(),
            '',
        ].join('\n');
    }

    async ensureFolder(folderPath) {
        const parts = folderPath.split('/');
        let cur = '';
        for (const part of parts) {
            cur = cur ? `${cur}/${part}` : part;
            if (!this.app.vault.getAbstractFileByPath(cur)) {
                await this.app.vault.createFolder(cur);
            }
        }
    }

    async save() {
        const body = this.textarea.value;
        if (!body.trim()) {
            this.setStatus('会話内容を入力してください', 'error');
            return;
        }

        const folder   = this.folderSel.value;
        const title    = this.titleInput.value;
        const fileName = this.buildFileName(title);
        const filePath = `${folder}/${fileName}`;

        try {
            await this.ensureFolder(folder);
            await this.app.vault.create(filePath, this.buildContent(title, body));
            this.setStatus(`保存しました: ${filePath}`, 'success');
            new Notice(`保存完了: ${fileName}`);
        } catch (err) {
            const msg = err.message || String(err);
            this.setStatus(`エラー: ${msg}`, 'error');
            new Notice(`保存失敗: ${msg}`);
        }
    }
}

// ─────────────────────────────────────────────
//  Settings tab
// ─────────────────────────────────────────────
class SaveFromAISettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Save from AI' });

        // ── API Keys ─────────────────────────────
        containerEl.createEl('h3', { text: 'API キー' });
        containerEl.createEl('p', {
            text: 'APIキーはこのデバイス上のdata.jsonにのみ保存され、外部に送信されることはありません。',
            cls: 'sfa-setting-desc',
        });

        new Setting(containerEl)
            .setName('Anthropic API Key（Claude）')
            .setDesc('Claude API を使用する場合に入力してください。')
            .addText(t => {
                t.inputEl.type = 'password';
                t.setPlaceholder('sk-ant-...')
                 .setValue(this.plugin.settings.claudeApiKey)
                 .onChange(async v => {
                     this.plugin.settings.claudeApiKey = v.trim();
                     await this.plugin.saveSettings();
                 });
            })
            .addExtraButton(btn => btn
                .setIcon('eye')
                .setTooltip('表示/非表示')
                .onClick(() => {
                    const el = containerEl.querySelector('input[placeholder="sk-ant-..."]');
                    if (el) el.type = el.type === 'password' ? 'text' : 'password';
                }));

        new Setting(containerEl)
            .setName('OpenAI API Key（ChatGPT）')
            .setDesc('OpenAI API を使用する場合に入力してください。')
            .addText(t => {
                t.inputEl.type = 'password';
                t.setPlaceholder('sk-...')
                 .setValue(this.plugin.settings.openaiApiKey)
                 .onChange(async v => {
                     this.plugin.settings.openaiApiKey = v.trim();
                     await this.plugin.saveSettings();
                 });
            })
            .addExtraButton(btn => btn
                .setIcon('eye')
                .setTooltip('表示/非表示')
                .onClick(() => {
                    const el = containerEl.querySelector('input[placeholder="sk-..."]');
                    if (el) el.type = el.type === 'password' ? 'text' : 'password';
                }));

        // ── General ──────────────────────────────
        containerEl.createEl('h3', { text: '一般設定' });

        new Setting(containerEl)
            .setName('Local REST API ポート')
            .setDesc('Obsidian Local REST API プラグインのポート番号（参照用）')
            .addText(t => t
                .setPlaceholder('27124')
                .setValue(String(this.plugin.settings.restApiPort))
                .onChange(async v => {
                    this.plugin.settings.restApiPort = parseInt(v, 10) || 27124;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('ソース自動検出')
            .setDesc('貼り付けたテキストからソース（Claude / ChatGPT）を自動判定する')
            .addToggle(t => t
                .setValue(this.plugin.settings.autoDetect)
                .onChange(async v => {
                    this.plugin.settings.autoDetect = v;
                    await this.plugin.saveSettings();
                }));
    }
}

// ─────────────────────────────────────────────
//  Plugin entry point
// ─────────────────────────────────────────────
class SaveFromAIPlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        this.registerView(VIEW_TYPE, leaf => new SaveFromAIView(leaf, this));

        this.addRibbonIcon('bot', 'AI会話を保存', () => this.activateView());

        this.addCommand({
            id: 'open-panel',
            name: 'Save from AI パネルを開く',
            callback: () => this.activateView(),
        });

        this.addSettingTab(new SaveFromAISettingTab(this.app, this));
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE);
    }

    async activateView() {
        const { workspace } = this.app;
        let [leaf] = workspace.getLeavesOfType(VIEW_TYPE);
        if (!leaf) {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE, active: true });
        }
        workspace.revealLeaf(leaf);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

module.exports = SaveFromAIPlugin;
