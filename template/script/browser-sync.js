/**
 * BrowserSync設定スクリプト
 * .envファイルから設定を読み込み、BrowserSyncを起動します
 */

// .envファイルから環境変数を読み込む
require("dotenv").config();

const browserSync = require("browser-sync");

// 環境変数から設定を取得
const previewUrl = process.env.PREVIEW_URL;
const themeSwitch = process.env.THEME_SWITCH_PARAM;
const themeDir = process.env.SFTP_REMOTE_THEME_DIR;
const passkey = process.env.PASSKEY;
const reloadDelay = parseInt(process.env.RELOAD_DELAY || "1000", 10);

// プロキシURLを構築
const proxyUrl = `${previewUrl}/?${themeSwitch}=${themeDir}&passkey=${passkey}`;

console.log(`プレビューURL: ${proxyUrl}`);
console.log(`リロード遅延: ${reloadDelay}ms`);

// BrowserSyncを起動
browserSync({
  proxy: proxyUrl,
  files: [
    "src/**/*.php",
    "src/**/*.css",
    "src/**/*.js",
    "src/**/*.html",
    "src/**/*.jpg",
    "src/**/*.jpeg",
    "src/**/*.png",
    "src/**/*.gif",
    "src/**/*.svg",
  ],
  reloadDelay: reloadDelay,
  noInject: true,
  notify: true,
  open: true,
});
