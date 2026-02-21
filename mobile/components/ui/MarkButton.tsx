import React from "react";
import { Button } from "tamagui";

type Props = {
  icon: React.ReactNode;
  onPress?: () => void;
};

export const MarkButton: React.FC<Props> = ({ icon, onPress }) => (
  <Button
    onPress={onPress}
    size="$4"
    chromeless
    borderRadius="$3"
    pressStyle={{ opacity: 0.8 }}
  >
    {icon}
  </Button>
);
