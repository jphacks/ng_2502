import React from "react";
import { Input, Label, YStack } from "tamagui";
import { TextInputProps, ViewStyle } from "react-native";

type Props = TextInputProps & {
  label?: string;
  width?: number | string;
  alignSelf?: ViewStyle["alignSelf"];
};

export const InputText: React.FC<Props> = ({
  label,
  width,
  alignSelf,
  ...rest
}) => (
  <YStack gap="$2" marginBottom="$3" width={width} alignSelf={alignSelf}>
    {label ? (
      <Label fontSize={14} fontWeight="600" color="$color">
        {label}
      </Label>
    ) : null}
    <Input
      {...rest}
      width={width}
      alignSelf={alignSelf}
      borderWidth={1}
      borderColor="#FFB433"
      borderRadius="$3"
      paddingHorizontal="$3"
      paddingVertical="$2"
      fontSize={16}
      placeholderTextColor="#999"
    />
  </YStack>
);
