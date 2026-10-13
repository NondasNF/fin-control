import { requireOptionalNativeModule } from 'expo';

interface NubankNotificationsNativeModule {
  isNotificationAccessEnabled(): boolean;
  openNotificationAccessSettings(): void;
}

const nativeModule = requireOptionalNativeModule<NubankNotificationsNativeModule>(
  'NubankNotifications'
);

export const isNubankListenerAvailable = nativeModule !== null;

export function isNubankNotificationAccessEnabled(): boolean {
  return nativeModule?.isNotificationAccessEnabled() ?? false;
}

export function openNubankNotificationAccessSettings(): void {
  if (!nativeModule) {
    throw new Error('A captura do Nubank exige um build Android com o módulo nativo instalado.');
  }

  nativeModule.openNotificationAccessSettings();
}
