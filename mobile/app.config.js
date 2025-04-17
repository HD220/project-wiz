export default {
  expo: {
    name: "project-wiz-mobile",
    slug: "project-wiz-mobile",
    version: "0.1.0",
    orientation: "portrait",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.company.projectwiz",
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.company.projectwiz",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      permissions: []
    },
    plugins: [
      [
        "expo-secure-store",
        {
          "accessible": "AccessibleWhenUnlocked"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};