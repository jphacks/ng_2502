// src/components/ProfileIcon.jsx

import { Avatar } from '@chakra-ui/react';
import React from 'react';

export const ProfileIcon = (props) => {
  // propsとして渡されたsrc, name, sizeなどを受け取る
  const { src, name, size = 'md', ...rest } = props; // sizeのデフォルト値を'md'に設定

  return (
    <Avatar
      name={name}
      src={src}
      size={size}
      {...rest} // その他のpropsも渡せるようにする
    />
  );
};