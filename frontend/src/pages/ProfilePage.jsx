// src/pages/ProfileEditPage.jsx

import { Button, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
// 作成したコンポーネントをインポートします
import { InputText } from '../components/InputText.jsx'; // フォルダ構成に合わせてパスを修正
import { PostInput } from '../components/PostInput.jsx'; // フォルダ構成に合わせてパスを修正
import { ProfileIcon } from '../components/ProfileIcon.jsx'; // フォルダ構成に合わせてパスを修正

const ProfileEditPage = () => {
  // --- State定義はすべてここにまとめる ---
  const [name, setName] = useState('山田 太郎'); // 初期値を設定しておくと分かりやすい
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');

  // --- 関数定義はすべてここにまとめる ---
  const handleSave = () => {
    // プロフィール保存のロジック
    console.log('プロフィール情報:', { name, email });
  };

  const handleSubmit = () => {
    // 投稿処理のロジック
    console.log('投稿内容:', text);
    setText('');
  };

  // --- returnはコンポーネントに一つだけ ---
  return (
    <VStack spacing={4} p={8} align="stretch">

      {/* --- ここから追加 --- 👤 */}
      <ProfileIcon
        name={name} // nameのstateを渡す
        src="/user-icon.png" // publicフォルダにある画像パス
        size="2xl" // 大きめのサイズで見栄えを良くする
        alignSelf="center" // この要素だけ中央に配置する
      />
      {/* --- ここまで追加 --- */}

      {/* --- プロフィール編集フォーム --- */}
      <InputText
        label="お名前"
        placeholder="山田 太郎"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <InputText
        label="メールアドレス"
        placeholder="example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button colorScheme="blue" onClick={handleSave}>
        保存する
      </Button>

      {/* --- 新規投稿フォーム --- */}
      <PostInput
        placeholder="自己紹介などを入力"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        colorScheme="twitter"
        onClick={handleSubmit}
        isDisabled={!text}
      >
        投稿する
      </Button>
    </VStack>
  );
};

export default ProfileEditPage;