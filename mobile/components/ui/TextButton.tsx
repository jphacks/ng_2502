import React from 'react';
import { Button } from 'tamagui';

interface TextButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  [key: string]: any;
}

export const TextButton: React.FC<TextButtonProps> = ({
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
      backgroundColor="#FFB433"
      color="#FFFFFF"
      borderWidth={0}
      paddingVertical="$3"
      paddingHorizontal="$4"
      borderRadius="$2"
      fontWeight="600"
      fontSize="$md"
      opacity={disabled ? 0.5 : 1}
      $platform-web={{
        cursor: disabled ? 'not-allowed' : 'pointer',
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

export default TextButton;
