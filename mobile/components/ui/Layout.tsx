import React from "react";
import { YStack } from "tamagui";

type Props = { header?: React.ReactNode; children?: React.ReactNode };

const Layout: React.FC<Props> = ({ header, children }) => (
  <YStack flex={1} backgroundColor="$background">
    {header}
    <YStack flex={1}>{children}</YStack>
  </YStack>
);

export default Layout;
