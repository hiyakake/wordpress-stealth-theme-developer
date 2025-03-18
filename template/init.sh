#!/bin/bash

# カラー設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}WordPress テーマ開発環境セットアップスクリプト${NC}"
echo "---------------------------------------------"
echo ""

# プロジェクト名を尋ねる
read -p "プロジェクト名を入力してください: " project_name
project_dir=$(echo "$project_name" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

if [ -z "$project_dir" ]; then
  project_dir="wp-theme-dev"
fi

echo -e "${GREEN}プロジェクトを作成しています: ${project_dir}${NC}"

# プロジェクトディレクトリを作成
mkdir -p ../$project_dir

# テンプレートからファイルをコピー
cp -r ./{script,package.json,.env.example,.gitignore,README.md} ../$project_dir/

# srcディレクトリを作成
mkdir -p ../$project_dir/src

echo "テンプレートファイルをコピーしました"

# 新しいプロジェクトディレクトリに移動
cd ../$project_dir

# .envファイルの作成
cp .env.example .env
echo ".envファイルを作成しました（後で編集してください）"

# package.jsonのプロジェクト名を更新
sed -i '' "s/wp-theme-dev-solution/$project_dir/g" package.json 2>/dev/null || sed -i "s/wp-theme-dev-solution/$project_dir/g" package.json

# .gitの初期化
git init
echo ".gitリポジトリを初期化しました"

echo -e "${GREEN}セットアップが完了しました！${NC}"
echo ""
echo "次のステップ:"
echo "1. cd $project_dir"
echo "2. .envファイルを編集して設定を行ってください"
echo "3. npm install で依存パッケージをインストールしてください"
echo "4. npm run prepare でセットアップウィザードを実行してください"
echo ""
echo -e "${BLUE}開発の準備が整いました！${NC}" 