import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatCurrency } from '../utils/formatters';

const NOTIFICATION_CHANNEL_ID = 'finance-alerts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let permissionRequest: Promise<boolean> | null = null;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (permissionRequest) {
    return permissionRequest;
  }

  permissionRequest = (async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Avisos financeiros',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    const currentPermission = await Notifications.getPermissionsAsync();
    if (currentPermission.granted) {
      return true;
    }

    const requestedPermission = await Notifications.requestPermissionsAsync();
    if (!requestedPermission.granted) {
      console.warn('[NotificationService] Permissão para notificações não concedida.');
      return false;
    }

    return true;
  })();

  try {
    return await permissionRequest;
  } catch (error) {
    console.error('[NotificationService] Falha ao solicitar permissão de notificações:', error);
    return false;
  } finally {
    permissionRequest = null;
  }
}

export async function showLocalNotification(title: string, body: string): Promise<boolean> {
  try {
    const hasPermission = await ensureNotificationPermission();
    if (!hasPermission) {
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null,
    });
    return true;
  } catch (error) {
    console.error('[NotificationService] Falha ao exibir notificação local:', error);
    return false;
  }
}

export async function notifyTransactionAdded(transaction: {
  description: string;
  amount: number;
  type: 'income' | 'expense';
}): Promise<void> {
  if (transaction.type !== 'expense') {
    return;
  }

  await showLocalNotification(
    'Compra registrada',
    `${transaction.description}: ${formatCurrency(transaction.amount)}`
  );
}
