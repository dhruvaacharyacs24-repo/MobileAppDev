import Constants from "expo-constants";

export const notificationService = {
  setup: async () => {
    // Expo Go cannot use remote push token APIs; skip notification setup there.
    if (Constants.appOwnership === "expo") return false;

    const Notifications = await import("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldSetBadge: false,
      }),
    });

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return false;

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "SkillSync AI check-in",
        body: "Review your latest market-aligned roadmap today.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    return true;
  },
};
