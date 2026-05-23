# 開発マニュアル (Firebase / DB / 起動手順)

このドキュメントでは、本リポジトリにおけるFirebase設定の仕組み、主要なデータベース設計、および正しいローカル環境の起動手順について解説します。

---

## 1. Firebase エミュレーターと本番環境の切り替えについて

フロントエンド（js/ts）とバックエンド（Python）では、それぞれ異なる方法で環境を判定し、接続先を切り替えています。

### フロントエンド (mobile/firebase.ts)
JS (Expo) 側での判定は、主に **Expoの開発モードフラグ** と **環境変数** によって行われます。

- **判定方法**: `__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR !== "false"`
- **処理内容**:
  上記が `true` の場合（ローカル開発時）、`connectFirestoreEmulator` や `connectAuthEmulator` などの専用関数を呼び出し、ローカルのPC IP（デフォルトは `localhost`）の指定ポート（Firestore: 8080, Auth: 9099など）に接続します。
- **本番環境**: 上記の条件から外れた場合、`initializeApp` で渡された通常の Firebase config（API Key等）を使って本番環境の Firebase に接続します。

### バックエンド (functions/config/firebase.py)
Python 側での判定は、主に **OSの環境変数** によって行われます。

- **判定方法**: `os.getenv("ENV") == "local"`
- **処理内容**:
  `ENV` が `local` に設定されている場合、プログラム内で強制的に以下の環境変数をセットします。
  - `os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"`
  - `os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099"`
  これにより、Firebase Admin SDK が自動的にエミュレーターを向くようになります。クレデンシャルもローカル用のダミー設定が使われます。
- **本番環境**: `os.getenv("RENDER") is not None` の場合など（本番環境）は、環境変数 `GOOGLE_CREDENTIALS_JSON` からサービスアカウントの認証情報を読み込み、本番の Firebase に接続します。

---

## 2. データベース設計 (Firestore)

主要なコレクションである `users` (ログイン・プロフィール) と `posts` (投稿) の設計は以下の通りです。

### 🧑‍💻 `users` コレクション (ユーザー情報)
| フィールド名 | 型 | 説明 |
| :--- | :--- | :--- |
| `username` | string | ユーザーの表示名 |
| `iconColor` | string | アイコンのカラー設定 (例: "blue") |
| `mode` | string | ユーザーのモード設定など |

> ※ Auth (認証) 自体は Firebase Auth を使用し、Firestore の `users` コレクションのドキュメントIDとして Firebase Auth の `uid` を紐付ける設計となっています。

### 📝 `posts` コレクション (投稿情報)
| フィールド名 | 型 | 説明 |
| :--- | :--- | :--- |
| `userId` | string | 投稿者のユーザーID (users コレクションのIDと紐づく) |
| `content` | string | 投稿のテキスト本文 |
| `imageUrl` | string (Optional) | 添付画像がある場合のURL |
| `replyTo` | string (Optional) | 返信先の投稿ID (返信でない場合は null) |
| `timestamp` | timestamp | 投稿日時 |
| `predictedLikes` | number | 予測される「いいね」数 (デフォルト: 0) |

---

## 3. 正しい起動手順（自動起動スクリプト ＋ Expo別ターミナル）

`package.json` に設定した **一括起動スクリプト** を使用してバックエンド周りを立ち上げ、スマホで読み込むQRコードを表示するためにフロントエンド（Expo）だけ別ターミナルで起動します。

今後のフェーズ（ローカルDB、リモート開発DB）に合わせて以下のコマンドを使い分けます。

### 手順①：バックエンド・DBの起動
プロジェクトのルートディレクトリ（`ng_2502`直下）で、以下のいずれかを実行してください。

**■ 完全ローカル環境（デフォルト）の場合**
Firebaseエミュレーターとバックエンド(ローカルモード)を同時に起動します。
```bash
npm run dev
# または npm run dev:local
```
> 💡 **裏側でやっていること:**
> `firebase emulators:start` と `uvicorn` (環境変数ENV=local付与) を `concurrently` で並行実行しています。

**■ 本番（リモート）DB + ローカルサーバー環境の場合**
将来的に、クラウド上の検証用DBに直接つなぎながら開発する場合はこちらを使います。
```bash
npm run dev:remote-db
```
> 💡 **裏側でやっていること:**
> エミュレーターは起動せず、環境変数 `ENV=dev` を付与してバックエンドのみを立ち上げます。

---

### 手順②：フロントエンド（Expo）の起動
別のターミナルを新しく開き、`mobile` ディレクトリ内で Expo を起動します。
```bash
# 1. mobileディレクトリに移動
cd mobile

# 2. Expoを起動（QRコードが表示されます）
npx expo start
```

### 終了方法
* **フロントエンド:** Expoを動かしているターミナルで `Ctrl + C`
* **バックエンド側:** `npm run dev` を動かしているターミナルで `Ctrl + C` を押し、バッチジョブの終了確認が出たら `Y` を入力してエンター

### 確認ポイント
バックエンド起動時にターミナルに `🔥 ローカルモード: Firebase Emulator に接続します` および `🔥 Firestore Emulator に接続成功` と表示されれば、正しくローカル環境で立ち上がっています。
