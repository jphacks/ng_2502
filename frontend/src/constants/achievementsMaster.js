// react-iconsライブラリから、実績で使うアイコンの「部品」をインポートします。
// （もし react-icons をインストールしていない場合は、ターミナルで
//   npm install react-icons
//   を実行してください）
import {
  FaHeart,
  FaCrown,
  FaFire,
  FaRegLightbulb, // (例: FaUserEditの代わりに)
  FaPlus,
  FaSeedling,
  FaQuestion // 予備の「？」アイコン
} from "react-icons/fa";

/**
 * 実績のマスターデータ（設定資料）
 *
 * バックエンドから返される実績ID（キー）と、
 * フロントエンドで表示する内容（名前、説明、アイコン部品）を
 * 紐付けるための「翻訳辞書」です。
 */
export const ACHIEVEMENTS_MASTER = {
  // キーの名前 (例: "post_10") は、必ずバックエンド（main.py）で
  // 定義されている実績IDと *完全に* 一致させてください。

  // --- 投稿数 ---
  "post_10": {
    "name": "投稿10件達成",
    "description": "投稿を10回行いました！",
    "icon": FaPlus // 値には、インポートしたアイコン部品そのものを入れます
  },
  "post_30": {
    "name": "投稿30件達成",
    "description": "投稿を30回も行いました！すごい！",
    "icon": FaSeedling
  },

  // --- 炎上 ---
  "fired_1": {
    "name": "炎上経験",
    "description": "不適切な投稿でAIに炎上させられました...",
    "icon": FaFire
  },
  // "peace_10": {
  //   "name": "平和が一番",
  //   "description": "炎上せずに10回連続で投稿しました！",
  //   "icon": FaRegLightbulb // (例: 平和なひらめきアイコン)
  // },

  // --- いいね ---
  "like_total_100": {
    "name": "総いいね100達成",
    "description": "もらった「いいね」の合計が100を超えました！",
    "icon": FaHeart
  },

  "reply_total_20": {
  name: "総リプライ20達成",
  description: "もらったリプライの合計が20を超えました！",
  icon: FaCommentDots // ← FaReplyでもOK、好みに応じて
},
  // "like_once_80": {
  //   "name": "バズった！",
  //   "description": "1つの投稿で80以上のいいねをもらいました！",
  //   "icon": FaCrown
  // },
 
  "all_achievements_unlocked": {
  name: "全実績解除",
  description: "すべての称号を獲得しました！あなたは真の達成者です！",
  icon: FaCrown // 👑 王冠アイコンで特別感を演出
}


  // --- 予備 ---
  // もしバックエンドから、このリストにないIDが送られてきた場合に
  // 表示するための「？」アイコンも定義しておくと安全です。
  // "unknown": {
  //   "name": "？？？",
  //   "description": "未知の実績です",
  //   "icon": FaQuestion
  // }
};