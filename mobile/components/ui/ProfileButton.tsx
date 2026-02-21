import React from "react";
import { Button } from "tamagui";

interface ProfileButtonProps {
  isActive?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  [key: string]: any;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  isActive,
  children,
  onPress,
  disabled = false,
  ...rest
}) => {
  // isActiveがtrue、または、isActiveが指定されなかった(undefined)場合にオレンジにする
  const isButtonActive = isActive === true || isActive === undefined;

  const bgColor = isButtonActive ? "#FFB433" : "#E2E8F0";
  const textColor = isButtonActive ? "#FFFFFF" : "#718096";

  return (
    <Button
      {...rest}
      onPress={onPress}
      disabled={disabled}
      backgroundColor={bgColor}
      color={textColor}
      borderWidth={0}
      paddingVertical="$3"
      paddingHorizontal="$4"
      borderRadius="$2"
      fontWeight="600"
      fontSize="$4"
      opacity={disabled ? 0.5 : 1}
      $platform-web={{
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      hoverStyle={{
        opacity: 0.8,
      }}
      pressStyle={{
        opacity: 0.7,
      }}
    >
      {children}
    </Button>
  );
};

export default ProfileButton;
