import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TamaguiProvider } from "tamagui";
import { PortalProvider } from "@tamagui/portal";
import "react-native-reanimated";

import config from "../tamagui.config";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { UserProvider } from "@/components/ui/UserProvider";

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <PortalProvider shouldAddRootHost>
        <ThemeProvider value={DefaultTheme}>
          <UserProvider>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="input" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen
                name="post-detail"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="auto" />
          </UserProvider>
        </ThemeProvider>
      </PortalProvider>
    </TamaguiProvider>
  );
}
