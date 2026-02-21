import React from "react";
import { Button } from "tamagui";

interface WhiteTextButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  [key: string]: any;
}

export const WhiteTextButton: React.FC<WhiteTextButtonProps> = ({
  children,
  onPress,
  disabled = false,
  ...rest
}) => {
  return (
    <Button
      {...rest}
      onPress={onPress}
      disabled={disabled}
      backgroundColor="#FFFFFF"
      color="#FFB433"
      borderColor="#FFB433"
      borderWidth={2}
      borderRadius="$2"
      paddingHorizontal="$4"
      fontWeight="600"
      fontSize={16}
      opacity={disabled ? 0.5 : 1}
      $platform-web={{
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      hoverStyle={{
        opacity: 0.8,
        borderColor: "#c78728",
      }}
      pressStyle={{
        opacity: 0.7,
      }}
    >
      {children}
    </Button>
  );
};

export default WhiteTextButton;
