package expo.modules.nubanknotifications

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NubankNotificationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NubankNotifications")

    Function("isNotificationAccessEnabled") {
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      val enabledListeners = Settings.Secure.getString(
        context.contentResolver,
        "enabled_notification_listeners"
      ).orEmpty()

      val listenerComponent = ComponentName(
        context,
        NubankNotificationListenerService::class.java
      )

      enabledListeners.split(':').any { enabled ->
        ComponentName.unflattenFromString(enabled) == listenerComponent
      }
    }

    Function("openNotificationAccessSettings") {
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }
  }
}
