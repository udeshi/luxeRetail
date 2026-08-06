import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Registration side (working): asks permission and mints an Expo push
 * token on a real device. The send side is a documented extension point —
 * see ARCHITECTURE.md "Push notifications" — it needs an Apple/Google push
 * credential this project doesn't have, so there's nowhere to POST the
 * token to yet. Swap the console.log for an API call once that exists.
 */
export function usePushNotificationRegistration(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !Device.isDevice) return;

    (async () => {
      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
      }
      if (status !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.DEFAULT });
      }

      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
      // TODO: POST expoPushToken to the API once a push-notification send
      // path exists (e.g. `notifications` module gains a device-token
      // registry + a real push provider adapter, same port/adapter pattern
      // as email).
      console.log('Expo push token (not yet sent to API):', expoPushToken);
    })();
  }, [enabled]);
}
