# WordPress Stealth Theme Developer (WSTD)

このプロジェクトは、WordPress の本番環境データを使用しながら安全にテーマ開発を行うためのソリューションです。本番サイトのデータを使いながらも、実際のサイト訪問者には影響を与えず、開発者だけが新しいテーマを確認できる環境を提供します。

## 特徴

- **実データを使った開発**: 本番環境のデータを使用して開発を行うため、実際のコンテンツで正確にテストできます
- **安全な環境**: 訪問者には影響を与えず、開発者のみが新しいテーマを確認できます
- **リアルタイム更新**: ファイル変更を検知して自動的にサーバーにアップロードし、ブラウザも自動リロード
- **対話式セットアップ**: 簡単なセットアップウィザードで環境構築が可能
- **環境変数による設定**: `.env` ファイルで簡単に設定を管理
- **VSCode との連携**: VSCode の SFTP プラグインと連携して効率的な開発が可能

## 前提条件

- WordPress サイトに [Theme Switcha](https://wordpress.org/plugins/theme-switcha/) プラグインがインストールされていること
- Visual Studio Code に [SFTP プラグイン](https://marketplace.visualstudio.com/items?itemName=Natizyskunk.sftp) がインストールされていること
- Node.js と npm がインストールされていること
- SFTP 接続用の SSH キーが設定済みであること

## インストール方法

1. このリポジトリをクローンまたはダウンロードします
2. プロジェクトディレクトリで依存パッケージをインストールします

```bash
npm install
```

3. セットアップウィザードを実行します

```bash
npm run prepare
```

4. ウィザードの指示に従って設定を行います
   - WordPress サイトのホスト名
   - SFTP 接続情報
   - テーマディレクトリのパス
   - Theme Switcha の設定情報など

## 使用方法

### 開発の開始

以下のコマンドで開発環境を起動します：

```bash
npm run dev
```

このコマンドで以下の機能が同時に起動します：

- BrowserSync によるブラウザの自動リロード
- SFTP による自動ファイルアップロード

### 初期ファイルのアップロード

VS Code の SFTP プラグインを使って、初期ファイルをアップロードできます：

1. VS Code で SFTP: Upload Project コマンドを実行
2. 必要なファイルを選択してアップロード

### ファイル監視

`src` ディレクトリ内のファイルを編集すると、自動的にサーバーにアップロードされ、ブラウザが自動的にリロードされます。

### テーマの確認

Theme Switcha プラグインの設定に従って、開発中のテーマを確認できます。通常は以下のような URL でアクセスします：

```
https://example.com/?theme-switch=theme-dev&passkey=yourpasskey
```

## 構成ファイル

- `package.json`: npm パッケージと開発スクリプトの設定
- `.env`: 環境変数（セットアップウィザードで自動生成）
- `.vscode/sftp.json`: VS Code SFTP プラグインの設定（セットアップウィザードで自動生成）
- `script/`: 開発スクリプト
  - `setup.js`: セットアップウィザード
  - `deploy.js`: 自動アップロードスクリプト
  - `browser-sync.js`: ブラウザ自動リロードスクリプト
- `src/`: テーマファイル（ここに WordPress テーマファイルを配置）

## 技術的な詳細

### 自動アップロード（SFTP）

`chokidar` と `ssh2-sftp-client` を使用して、ファイルの変更を監視し自動的にサーバーにアップロードします。

- 監視対象: `src` ディレクトリ内のファイル
- 除外対象: `.vscode`, `.git`, `.DS_Store`, `node_modules`, `script`, `template`

### ブラウザ自動リロード（BrowserSync）

`browser-sync` を使用して、ブラウザの自動リロードを実現します。

- 監視対象: PHP, CSS, JavaScript, HTML, 画像ファイル
- リロード遅延: 環境変数で設定可能（デフォルト: 1000ms）

### Theme Switcha プラグイン

Theme Switcha プラグインを利用して、一般訪問者には影響を与えずに開発者だけが新しいテーマを確認できるようにします。

- パラメータ設定: `theme-switch` パラメータと `passkey` で保護可能
- 詳細情報: [Theme Switcha プラグイン公式ページ](https://wordpress.org/plugins/theme-switcha/)

## セキュリティ上の注意点

1. `.env` ファイルには機密情報が含まれるため、バージョン管理システムにコミットしないでください
2. 本番環境でのテーマ変更には十分注意し、必ずテストを行ってから適用してください
3. Theme Switcha のパスキーは十分に複雑なものを使用してください

## ライセンス

MIT ライセンスの下で公開されています。詳細はプロジェクトの LICENSE ファイルを参照してください。
