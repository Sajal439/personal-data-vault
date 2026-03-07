import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

jest.mock("react-native-keychain", () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

jest.mock("react-native-biometrics", () =>
  jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn().mockResolvedValue({ available: false }),
    simplePrompt: jest.fn().mockResolvedValue({ success: true }),
  })),
);

