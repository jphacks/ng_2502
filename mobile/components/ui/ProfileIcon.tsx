import React from "react";
import { Avatar, Text } from "tamagui";

interface ProfileIconProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  [key: string]: any;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  src,
  name = "",
  size = "md",
  ...rest
}) => {
  const sizePixels = sizeMap[size] || sizeMap.md;

  return (
    <Avatar size={sizePixels} circular {...rest}>
      {src ? (
        <Avatar.Image source={typeof src === "string" ? { uri: src } : src} />
      ) : (
        <Avatar.Fallback
          backgroundColor="$blue10"
          justifyContent="center"
          alignItems="center"
        >
          {/* フォールバック用の頭文字を表示 */}
          {name && <Text color="$white">{name.charAt(0).toUpperCase()}</Text>}
        </Avatar.Fallback>
      )}
    </Avatar>
  );
};

export default ProfileIcon;
