// src/components/InputPost.jsx

import { Textarea } from '@chakra-ui/react';
import React from 'react';

export const PostInput = (props) => {
  // propsを分割して、残りを...restに格納
  const { ...rest } = props;

  return (
    <Textarea
      placeholder="いまどうしてる？"
      size="lg" // 少し大きめのサイズ
      minH="120px" // 最低でも120pxの高さを確保
      resize="vertical" // 垂直方向のリサイズのみ許可
      {...rest} // valueやonChangeなどをまとめて渡す
    />
  );
};