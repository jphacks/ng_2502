// react-iconsライブラリから、実績で使うアイコンの「部品」をインポートします。
// （もし react-icons をインストールしていない場合は、ターミナルで
//   npm install react-icons
//   を実行してください）
import {
  FaCrown,
  FaFire,
  FaRegCommentAlt,
  FaQuestion // 予備の「？」アイコン
} from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { MdSunny } from "react-icons/md";
import { TbEyeglassFilled } from "react-icons/tb";
import { IoPersonSharp } from "react-icons/io5";
import { LuSwords } from "react-icons/lu";

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
  "welcome_snr": {
    "name": "いだいなるよあけ",
    "description": "SNRをはじめた！でんせつのまくあけだ。",
    "icon": LuSwords // ← インポートしたアイコンを指定
  },
  // --- いいね ---
  "like_total_100": {
    "name": "ハリウッドスター",
    "description": "ごうけい100いいねもらった。もうひとつどうぞ❤",
    "icon": TbEyeglassFilled
  },
  "reply_total_20": {
    "name": "わだいのあのこ",
    "description": "ごうけい20このコメントもらった。じぶんをつらぬけばいいんだよ。",
    "icon": FaRegCommentAlt
  },
  // --- 炎上 ---
  "fired_1": {
    "name": "やけど",
    "description": "えんじょうした。だれだってしっぱいからまなぶんだ。",
    "icon": FaFire
  },
  // --- 投稿数 ---
  "post_10": {
    "name": "インフルエンサー？",
    "description": "10かいとうこうした。おそとでもしっかりあそぶんだよ。",
    "icon": IoPersonSharp
  },
  "post_30": {
    "name": "インフルエンサー！",
    "description": "30かいとうこうした。ひまなの？",
    "icon": FaPeopleGroup
  },
  "positive_20": {
    "name": "みんなのたいよう",
    "description": "まえむきなとうこうを20かいした。きみがせかいをてらしているよ。",
    "icon": MdSunny
  },
  "all_achievements_unlocked": {
    "name": "SNRマスター",
    "description": "すべてのバッジをあつめた！きみはSNRマスターだ！",
    "icon": FaCrown
  }
};