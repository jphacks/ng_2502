import random

# バズり時のpredicted_likesをサンプリングする（100〜10000、右裾が薄い分布）
def sample_viral_predicted_likes() -> int:
    """
    100〜10000の範囲で、値が大きいほど確率が小さくなるスキュー分布から整数を返す。
    """
    min_val = 100.0
    max_val = 10000.0
    alpha = 0.95424
    u = random.random()
    denom = 1.0 - u * (1.0 - (min_val / max_val) ** alpha)
    x = min_val / (denom ** (1.0 / alpha))
    if x < min_val:
        x = min_val
    elif x > max_val:
        x = max_val
    return int(x)