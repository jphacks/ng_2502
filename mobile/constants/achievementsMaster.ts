/**
 * 実績アイコンの定義
 * React Nativeではアイコンコンポーネントを直接保存できないため、
 * アイコンファミリーと名前を文字列で保存し、使用時に動的にレンダリングする
 */
export type AchievementIcon = {
  family:
    | "FontAwesome"
    | "MaterialIcons"
    | "MaterialCommunityIcons"
    | "Ionicons";
  name: string;
};

/**
 * 実績の型定義
 */
export type Achievement = {
  name: string;
  description: string;
  icon: AchievementIcon;
};

/**
 * 実績のマスターデータ（設定資料）
 *
 * バックエンドから返される実績ID（キー）と、
 * フロントエンドで表示する内容（名前、説明、アイコン）を
 * 紐付けるための「翻訳辞書」です。
 */
export const ACHIEVEMENTS_MASTER: Record<string, Achievement> = {
  // キーの名前 (例: "post_10") は、必ずバックエンド（main.py）で
  // 定義されている実績IDと *完全に* 一致させてください。
  welcome_snr: {
    name: "いだいなるよあけ",
    description: "SNRをはじめた！でんせつのまくあけだ。",
    icon: {
      family: "MaterialCommunityIcons",
      name: "sword-cross",
    },
  },
  // --- いいね ---
  like_total_100: {
    name: "ハリウッドスター",
    description: "ごうけい100いいねもらった。もうひとつどうぞ❤",
    icon: {
      family: "MaterialCommunityIcons",
      name: "glasses",
    },
  },
  reply_total_20: {
    name: "わだいのあのこ",
    description:
      "ごうけい20このコメントもらった。じぶんをつらぬけばいいんだよ。",
    icon: {
      family: "FontAwesome",
      name: "comment-o",
    },
  },
  // --- 炎上 ---
  fired_1: {
    name: "やけど",
    description: "えんじょうした。だれだってしっぱいからまなぶんだ。",
    icon: {
      family: "FontAwesome",
      name: "fire",
    },
  },
  // --- 投稿数 ---
  post_10: {
    name: "インフルエンサー？",
    description: "10かいとうこうした。おそとでもしっかりあそぶんだよ。",
    icon: {
      family: "Ionicons",
      name: "person-sharp",
    },
  },
  post_30: {
    name: "インフルエンサー！",
    description: "30かいとうこうした。ひまなの？",
    icon: {
      family: "MaterialCommunityIcons",
      name: "account-group",
    },
  },
  positive_20: {
    name: "みんなのたいよう",
    description:
      "まえむきなとうこうを20かいした。きみがせかいをてらしているよ。",
    icon: {
      family: "MaterialIcons",
      name: "wb-sunny",
    },
  },
  all_achievements_unlocked: {
    name: "SNRマスター",
    description: "すべてのバッジをあつめた！きみはSNRマスターだ！",
    icon: {
      family: "FontAwesome",
      name: "trophy",
    },
  },
};
