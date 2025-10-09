import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  // アプリで使う色を定義
  colors: {
    brand: {
      primary: '#FFC107', // 明るい黄色
      secondary: '#4CAF50',// 優しい緑
      text: '#5D4037',     // 茶色っぽい文字
    },
  },
  // フォントの定義
  fonts: {
    heading: `'M PLUS Rounded 1c', sans-serif`, // 丸ゴシック体
    body: `'M PLUS Rounded 1c', sans-serif`,
  },
  // 全てのボタンの角を丸くするなど、部品の基本スタイルを定義
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full', // 角を完全に丸くする
      },
    },
  },
});

export default theme;