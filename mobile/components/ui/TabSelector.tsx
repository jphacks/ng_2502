import { FontAwesome } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { XStack } from "tamagui";

export type TabType = "solo" | "friends";

type Props = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

const ACTIVE_COLOR = "#FFB433";
const INACTIVE_COLOR = "#D0D0D0";
const ICON_SIZE = 26;

export const TabSelector = ({ activeTab, onTabChange }: Props) => (
  <XStack
    justifyContent="center"
    gap="$12"
    paddingVertical="$3"
    borderBottomWidth={1}
    borderBottomColor="$gray3"
    backgroundColor="$background"
  >
    <Pressable onPress={() => onTabChange("solo")} hitSlop={12}>
      <FontAwesome
        name="user"
        size={ICON_SIZE}
        color={activeTab === "solo" ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
    </Pressable>
    <Pressable onPress={() => onTabChange("friends")} hitSlop={12}>
      <FontAwesome
        name="users"
        size={ICON_SIZE}
        color={activeTab === "friends" ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
    </Pressable>
  </XStack>
);
