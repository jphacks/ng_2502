const DEFAULT_PRODUCTION_API_URL = "https://ng-2502testesu.onrender.com";
const defaultLocalHost =
  process.env.EXPO_PUBLIC_LOCAL_BACKEND_HOST ?? "localhost";

const useLocalBackend =
  __DEV__ && process.env.EXPO_PUBLIC_USE_LOCAL_BACKEND !== "false";

export const API_BASE_URL = useLocalBackend
  ? `http://${defaultLocalHost}:8000`
  : DEFAULT_PRODUCTION_API_URL;
