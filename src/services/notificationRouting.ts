import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { navigateToTab, TabRouteName } from '../navigation/navigationRef';

/**
 * Chaves usadas no campo `data.route` das notificações locais e no host do
 * deep link nativo (`fincontrol://<key>`). Cada uma aponta para uma aba.
 */
export type NotificationRouteKey = 'transactions' | 'dashboard';

const ROUTE_BY_KEY: Record<NotificationRouteKey, TabRouteName> = {
  transactions: 'Transações',
  dashboard: 'Dashboard',
};

function routeFromKey(key: unknown): TabRouteName | null {
  if (typeof key !== 'string') {
    return null;
  }
  return ROUTE_BY_KEY[key as NotificationRouteKey] ?? null;
}

function routeFromUrl(url: string): TabRouteName | null {
  const withoutScheme = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const key = withoutScheme.split(/[/?#]/)[0];
  return routeFromKey(key);
}

function handleNotificationResponse(
  response: Notifications.NotificationResponse | null
): void {
  if (!response) {
    return;
  }
  const route = routeFromKey(response.notification.request.content.data?.route);
  if (route) {
    navigateToTab(route);
  }
}

/**
 * Conecta as notificações ao roteamento do app:
 * - Notificações locais (expo-notifications) com `data.route`.
 * - Deep links nativos (`fincontrol://transactions`) usados pelo serviço
 *   Android de captura do Nubank.
 */
export function setupNotificationRouting(): () => void {
  const handleUrl = ({ url }: { url: string }) => {
    const route = routeFromUrl(url);
    if (route) {
      navigateToTab(route);
    }
  };

  const linkingSubscription = Linking.addEventListener('url', handleUrl);
  void Linking.getInitialURL().then((url) => {
    if (url) {
      handleUrl({ url });
    }
  });

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
  void Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      handleNotificationResponse(response);
      void Notifications.clearLastNotificationResponseAsync();
    }
  });

  return () => {
    linkingSubscription.remove();
    responseSubscription.remove();
  };
}
