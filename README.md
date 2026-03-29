# FitQuest 💪 - トレーニング管理アプリ

トレーニングを記録してキャラクターを育てるフィットネスアプリです。

## 機能

- ✅ **トレーニング記録** - 種目・重量・回数を記録
- ✅ **グラフ表示** - 重量・ボリューム・頻度の推移を可視化
- ✅ **SNSシェア** - トレーニング結果をカード画像としてダウンロード
- ✅ **レベルアップシステム** - トレーニングするごとにEXPを獲得しキャラクターが成長
- ✅ **PWA対応** - スマートフォンにインストール可能
- ✅ **ダークモード対応**

## 技術スタック

- **フレームワーク**: React Router v7 (SPA)
- **スタイリング**: Tailwind CSS v4
- **バックエンド**: Firebase (Authentication + Firestore)
- **グラフ**: Recharts
- **画像生成**: html-to-image
- **デプロイ**: Cloudflare Workers

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com) でプロジェクトを作成
2. **Authentication** を有効化（メール/パスワード + Google）
3. **Firestore Database** を作成（本番モード）
4. 「プロジェクトの設定」→「ウェブアプリ」から設定値を取得

### 3. 環境変数の設定

`.env.example` を `.env` にコピーして、Firebase設定値を入力:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore セキュリティルール

Firebaseコンソールで以下のルールを設定:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開く

## デプロイ（Cloudflare Workers）

### Cloudflare設定

`wrangler.jsonc` の `name` をプロジェクト名に変更:

```json
{
  "name": "fitquest"
}
```

### 環境変数をCloudflareに設定

```bash
npx wrangler secret put VITE_FIREBASE_API_KEY
npx wrangler secret put VITE_FIREBASE_AUTH_DOMAIN
# ... 他の変数も同様
```

### デプロイ

```bash
npm run deploy
```

## アプリのレベルシステム

| レベル | 称号 | キャラクターステージ |
|--------|------|-----------------|
| 1-2 | ビギナー | Stage 0（細身） |
| 3-4 | 初中級者 | Stage 1 |
| 5-9 | 中級者 | Stage 2 |
| 10-14 | 経験者 | Stage 3 |
| 15-24 | セミプロ | Stage 4（筋肥大） |
| 25+ | マスター/レジェンド | Stage 5（最強体型） |

### EXP獲得

- 種目1つにつき **+10 EXP**
- ボリューム1,000kgごとに **+5 EXP**