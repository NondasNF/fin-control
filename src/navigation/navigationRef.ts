import { createNavigationContainerRef } from '@react-navigation/native';

export type TabRouteName =
  | 'Dashboard'
  | 'Transações'
  | 'Gastos Fixos'
  | 'Relatórios'
  | 'Ajustes';

export const navigationRef = createNavigationContainerRef();

let pendingRoute: TabRouteName | null = null;

/**
 * Navega para uma aba a partir de fora da árvore do React (deep links,
 * respostas de notificação). Se a navegação ainda não estiver pronta, a rota
 * fica pendente e é aplicada quando o container ficar pronto.
 */
export function navigateToTab(route: TabRouteName): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(route as never);
  } else {
    pendingRoute = route;
  }
}

export function flushPendingNavigation(): void {
  if (pendingRoute && navigationRef.isReady()) {
    navigationRef.navigate(pendingRoute as never);
    pendingRoute = null;
  }
}
