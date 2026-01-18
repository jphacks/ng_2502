import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Button } from 'tamagui';

interface ReactionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  [key: string]: any;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  icon,
  label,
  onPress,
  disabled = false,
  ...rest
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      accessible
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[
        styles.button,
        isPressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      <Button
        backgroundColor="transparent"
        borderWidth={0}
        padding={0}
        minWidth="auto"
        height="auto"
        opacity={isPressed ? 0.8 : 1}
        disabled={disabled}
      >
        {icon}
      </Button>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ReactionButton;
