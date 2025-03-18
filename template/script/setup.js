/**
 * セットアップスクリプト
 * プロジェクトの初期設定を対話式で行います
 */

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const os = require("os");

// 設定に使用する質問事項
const questions = [
  {
    type: "input",
    name: "SFTP_HOST",
    message: "WordPressサイトのホスト名を入力してください:",
    default: "example.com",
  },
  {
    type: "input",
    name: "SFTP_PORT",
    message: "SFTPポート番号を入力してください:",
    default: "22",
  },
  {
    type: "input",
    name: "SFTP_USER",
    message: "SFTPユーザー名を入力してください:",
  },
  {
    type: "input",
    name: "SFTP_KEY_PATH",
    message: "SSH秘密鍵のパスを入力してください (チルダ(~)を使用できます):",
    default: "~/.ssh/id_rsa",
  },
  {
    type: "input",
    name: "SFTP_REMOTE_BASE_PATH",
    message: "WordPressテーマディレクトリのパスを入力してください:",
    default: "/path/to/wp-content/themes",
  },
  {
    type: "input",
    name: "SFTP_REMOTE_THEME_DIR",
    message: "開発用テーマディレクトリ名を入力してください:",
    default: "theme-dev",
  },
  {
    type: "input",
    name: "PREVIEW_URL",
    message: "WordPressサイトのURLを入力してください:",
    default: "https://example.com",
  },
  {
    type: "input",
    name: "THEME_SWITCH_PARAM",
    message: "Theme Switchaプラグインのパラメータ名を入力してください:",
    default: "theme-switch",
  },
  {
    type: "input",
    name: "PASSKEY",
    message: "プレビュー用のパスキーを入力してください:",
    default: "yourpasskey",
  },
  {
    type: "input",
    name: "RELOAD_DELAY",
    message: "ブラウザリロードの遅延時間(ミリ秒)を入力してください:",
    default: "1000",
  },
];

// main関数
async function main() {
  try {
    console.log("WordPressテーマ開発環境セットアップウィザード\n");
    console.log(
      "このウィザードは、WordPressテーマ開発環境の設定をサポートします。"
    );
    console.log(
      "Theme Switchaプラグインがインストールされていることを確認してください。\n"
    );

    // ユーザーからの入力を取得
    const answers = await inquirer.prompt(questions);

    // .envファイルの内容を生成
    const envContent = Object.entries(answers)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // .envファイルを作成
    fs.writeFileSync(".env", envContent);
    console.log("\n.envファイルが作成されました！");

    // srcディレクトリとvscodeSftpディレクトリの作成
    if (!fs.existsSync("src")) {
      fs.mkdirSync("src");
      console.log("srcディレクトリが作成されました！");
    }

    if (!fs.existsSync(".vscode")) {
      fs.mkdirSync(".vscode");
    }

    // VS Code SFTP設定ファイルの作成
    const sftpConfig = {
      name: "WordPress Theme Dev",
      host: answers.SFTP_HOST,
      protocol: "sftp",
      port: parseInt(answers.SFTP_PORT, 10),
      username: answers.SFTP_USER,
      privateKeyPath: answers.SFTP_KEY_PATH,
      remotePath: path.posix.join(
        answers.SFTP_REMOTE_BASE_PATH,
        answers.SFTP_REMOTE_THEME_DIR
      ),
      context: "src",
      uploadOnSave: false,
      useTempFile: false,
      ignore: [
        ".vscode",
        ".git",
        ".DS_Store",
        "node_modules",
        "script",
        ".env",
        "package-lock.json",
        "package.json",
        "template",
      ],
    };

    // SFTP設定ファイルを書き込み
    fs.writeFileSync(".vscode/sftp.json", JSON.stringify(sftpConfig, null, 2));
    console.log(".vscode/sftp.jsonファイルが作成されました！");

    console.log("\nセットアップが完了しました！");
    console.log("\n以下のコマンドで開発を開始できます:");
    console.log("npm run dev");
    console.log(
      "\nVS Codeのnatizyskunk.sftpプラグインを使って初期ファイルをアップロードできます。"
    );
    console.log("ファイルの変更はsrcディレクトリ内で行ってください。\n");
  } catch (error) {
    console.error("セットアップ中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプト実行
main();
