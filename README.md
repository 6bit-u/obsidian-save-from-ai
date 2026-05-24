# obsidian-save-from-ai

ClaudeやChatGPTの会話を、Obsidianのサイドパネルからワンクリックでノートに保存するプラグインです。

---

## 日本語

### 機能

- **サイドパネル UI** — リボンアイコンまたはコマンドパレットから開く
- **ソース選択** — Claude / ChatGPT を切り替え（テキストから自動検出も可）
- **フォルダ選択** — よく使うフォルダをドロップダウンから選択
- **タイトル自動生成** — 空欄のとき `YYYY-MM-DD_HHmm_claude.md` 形式で生成
- **Frontmatter 付き保存** — `source`, `date`, `title`, `tags` を自動付与
- **API キー管理** — Anthropic / OpenAI のキーを設定画面で安全に管理（ローカルのみ保存）

### 対応フォルダ（デフォルト）

```
30_AI_Logs/claude
30_AI_Logs/chatgpt
10_Projects/cafe
10_Projects/6bit
10_Projects/vrchat
20_Daily
00_Profile
```

### インストール

1. [Releases](../../releases) から最新の `main.js`, `manifest.json`, `styles.css` をダウンロード
2. Vaultの `.obsidian/plugins/obsidian-save-from-ai/` フォルダに配置
3. Obsidian → 設定 → コミュニティプラグイン → `Save from AI` を有効化

### 使い方

1. 左サイドバーの **bot アイコン** をクリック、またはコマンドパレットで `Save from AI パネルを開く`
2. ソース（Claude / ChatGPT）を選択
3. タイトルと保存先フォルダを選択
4. AI との会話内容を貼り付け
5. **保存** ボタンをクリック

### 設定

| 項目 | 説明 |
|------|------|
| Anthropic API Key | Claude API キー（`sk-ant-...`）をローカルに保存 |
| OpenAI API Key | OpenAI API キー（`sk-...`）をローカルに保存 |
| Local REST API ポート | Obsidian Local REST API のポート番号（デフォルト: 27124） |
| ソース自動検出 | 貼り付けテキストからClause/ChatGPTを自動判定 |

> **注意:** APIキーは Vault 内の `data.json` にのみ保存されます。外部へは一切送信されません。

---

## English

### Features

- **Side-panel UI** — open via ribbon icon or command palette
- **Source toggle** — switch between Claude and ChatGPT (auto-detection supported)
- **Folder picker** — choose from a dropdown of preset folders
- **Auto-generated title** — falls back to `YYYY-MM-DD_HHmm_claude.md` format
- **Frontmatter** — auto-injects `source`, `date`, `title`, and `tags`
- **API key management** — securely store Anthropic / OpenAI keys in plugin settings (local only)

### Default Folders

```
30_AI_Logs/claude
30_AI_Logs/chatgpt
10_Projects/cafe
10_Projects/6bit
10_Projects/vrchat
20_Daily
00_Profile
```

### Installation

1. Download the latest `main.js`, `manifest.json`, and `styles.css` from [Releases](../../releases)
2. Place them in your Vault under `.obsidian/plugins/obsidian-save-from-ai/`
3. Go to Obsidian → Settings → Community Plugins → enable **Save from AI**

### Usage

1. Click the **bot icon** in the left ribbon, or open the command palette and run `Save from AI パネルを開く`
2. Select the source (Claude or ChatGPT)
3. Set the title and destination folder
4. Paste your AI conversation
5. Click **保存** (Save)

### Settings

| Setting | Description |
|---------|-------------|
| Anthropic API Key | Store your Claude API key (`sk-ant-...`) locally |
| OpenAI API Key | Store your OpenAI API key (`sk-...`) locally |
| Local REST API Port | Port for Obsidian Local REST API (default: 27124) |
| Auto-detect source | Auto-detect Claude vs ChatGPT from pasted text |

> **Note:** API keys are stored only in `data.json` inside your Vault and are never transmitted externally.

---

## License

[MIT](./LICENSE) © 2026 6bit
