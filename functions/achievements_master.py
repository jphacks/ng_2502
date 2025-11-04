# 実績のマスターデータ
# キーが実績ID、値が内容
ACHIEVEMENTS_MASTER = {
    "romance_dawn": {
        "name": "いだいなるよあけ",
        "description": "SNRをはじめた！でんせつのまくあけだ。",
        "goal": 1,
        "icon": "PiSunHorizonDuotone" # (例: react-iconsの名前)
    },
    "model_man": {
        "name": "パリコレモデル",
        "description": "プロフィールアイコンを5かいかえた。ときにおしゃれはがまんらしい。",
        "goal": 5,
        "icon": "GiAmpleDress"
    },
    "cheerup_man": {
        "name": "ほめじょうず",
        "description": "いいねをごうけい50かいおした。いいね！",
        "goal": 50,
        "icon": "FaRegThumbsUp"
    },
    "popular_man": {
        "name": "ハリウッドスター",
        "description": "ごうけい100いいねもらった。もうひとつどうぞ❤",
        "goal": 100,
        "icon": "FaHeart"
    },
    "effort_man": {
        "name": "インフルエンサー",
        "description": "50かいとうこうした。しっかりおそとでもあそぶんだよ。",
        "goal": 50,
        "icon": "FaPersonRays"
    },
    "fired_man": {
        "name": "やけど",
        "description": "えんじょうした。だれだってしっぱいからまなぶんだ。",
        "goal": 1,
        "icon": "FaFire"
    },
    "peacekeeper": {
        "name": "パシフィスタ",
        "description": "えんじょうせず20かいれんぞくでとうこうした。へいわをあいしへいわにあいされた。",
        "goal": 20,
        "icon": "PiBirdLight"
    },
    "SNR_master": {
        "name": "SNRマスター",
        "description": "すべてのバッジをあつめた！きみはSNRマスターだ！",
        "goal": 0, # 下で動的に設定
        "icon": "FaCrown"
    }
}

ACHIEVEMENTS_MASTER["SNR_master"]["goal"] = len(ACHIEVEMENTS_MASTER) - 1