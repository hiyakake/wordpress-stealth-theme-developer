/**
 * ファイル監視と自動SFTPアップロードスクリプト
 * ローカルファイルの変更を検知し、自動的にリモートサーバーにアップロードします
 */

// .envファイルから環境変数を読み込む
require("dotenv").config();

const chokidar = require("chokidar");
const SftpClient = require("ssh2-sftp-client");
const path = require("path");
const fs = require("fs");
const os = require("os");

// SSHキーのパスを正しく解決
const resolveSshKeyPath = (keyPath) => {
  // チルダ(~)から始まるパスの場合、ホームディレクトリに置き換える
  if (keyPath.startsWith("~")) {
    return path.join(os.homedir(), keyPath.substring(1));
  }
  return keyPath;
};

// .envファイルから設定を読み込む
const config = {
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT || "22", 10),
  username: process.env.SFTP_USER,
  privateKey: fs.readFileSync(resolveSshKeyPath(process.env.SFTP_KEY_PATH)),
  // リモートパスをベースパスとテーマディレクトリ名から構築
  remotePath: path.posix.join(
    process.env.SFTP_REMOTE_BASE_PATH,
    process.env.SFTP_REMOTE_THEME_DIR
  ),
};

console.log(`リモートパス: ${config.remotePath}`);
console.log(`SSHキーパス: ${resolveSshKeyPath(process.env.SFTP_KEY_PATH)}`);

// 無視するパターン
const ignorePatterns = [
  ".vscode",
  ".git",
  ".DS_Store",
  "node_modules",
  "script",
  "template",
];

// SFTPクライアントの初期化
const sftp = new SftpClient();

/**
 * ファイルをアップロードする関数
 * @param {string} localPath - ローカルのファイルパス
 */
async function uploadFile(localPath) {
  try {
    const relativePath = path.relative(process.cwd(), localPath);
    // srcディレクトリ内のファイルをリモートのルートディレクトリに直接アップロード
    const remoteRelativePath = relativePath.replace(/^src\//, "");
    const remotePath = path.posix.join(
      config.remotePath,
      remoteRelativePath.replace(/\\/g, "/")
    );

    console.log(`アップロード中: ${relativePath} -> ${remotePath}`);

    // リモートディレクトリの作成（必要な場合）
    const remoteDir = path.posix.dirname(remotePath);
    await createRemoteDirectory(remoteDir);

    // ファイルのアップロード
    await sftp.put(localPath, remotePath);
    console.log(`アップロード完了: ${relativePath}`);
  } catch (err) {
    console.error(`アップロードエラー: ${localPath}`, err);
  }
}

/**
 * リモートディレクトリを再帰的に作成
 * @param {string} remoteDir - 作成するリモートディレクトリパス
 */
async function createRemoteDirectory(remoteDir) {
  try {
    // ルートディレクトリかどうかをチェック
    if (remoteDir === config.remotePath || remoteDir === "/") {
      return;
    }

    // 親ディレクトリを確認
    const parentDir = path.posix.dirname(remoteDir);
    if (parentDir !== config.remotePath && parentDir !== "/") {
      await createRemoteDirectory(parentDir);
    }

    // ディレクトリの存在確認
    try {
      const stats = await sftp.stat(remoteDir);
      if (stats.isDirectory) {
        return; // すでに存在する場合は何もしない
      }
    } catch (error) {
      // ディレクトリが存在しない場合は作成
      await sftp.mkdir(remoteDir, true);
      console.log(`ディレクトリ作成: ${remoteDir}`);
    }
  } catch (err) {
    console.error(`ディレクトリ作成エラー: ${remoteDir}`, err);
  }
}

/**
 * ファイルを削除する関数
 * @param {string} localPath - 削除されたローカルのファイルパス
 */
async function deleteFile(localPath) {
  try {
    const relativePath = path.relative(process.cwd(), localPath);
    // srcディレクトリ内のファイルをリモートのルートディレクトリに直接アップロード
    const remoteRelativePath = relativePath.replace(/^src\//, "");
    const remotePath = path.posix.join(
      config.remotePath,
      remoteRelativePath.replace(/\\/g, "/")
    );

    console.log(`削除中: ${remotePath}`);
    await sftp.delete(remotePath);
    console.log(`削除完了: ${remotePath}`);
  } catch (err) {
    console.error(`削除エラー: ${localPath}`, err);
  }
}

// メイン処理
async function main() {
  try {
    console.log("SFTPサーバーに接続しています...");
    await sftp.connect(config);
    console.log("接続成功！ファイル監視を開始します...");

    // ファイル監視の設定（srcディレクトリのみ監視）
    const watcher = chokidar.watch("src", {
      ignored: [/(^|[\/\\])\../, ...ignorePatterns.map((p) => `**/${p}/**`)],
      persistent: true,
      ignoreInitial: true,
    });

    // ファイル追加・変更イベント
    watcher.on("add", uploadFile);
    watcher.on("change", uploadFile);

    // ファイル削除イベント
    watcher.on("unlink", deleteFile);

    console.log(
      "srcディレクトリ内のファイル変更を監視しています... Ctrl+Cで終了"
    );
  } catch (err) {
    console.error("エラー:", err);
    process.exit(1);
  }
}

// 終了時の処理
process.on("SIGINT", async () => {
  console.log("\n監視を終了します...");
  await sftp.end();
  process.exit(0);
});

// スクリプト実行
main();
