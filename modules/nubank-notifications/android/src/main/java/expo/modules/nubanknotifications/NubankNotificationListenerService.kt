package expo.modules.nubanknotifications

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.NotificationManager.IMPORTANCE_HIGH
import android.app.PendingIntent
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.sqlite.SQLiteDatabase
import android.net.Uri
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import java.io.File
import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private const val NUBANK_PACKAGE = "com.nu.production"
private const val NOTIFICATION_CHANNEL_ID = "finance-alerts"
private const val CATEGORY_NAME = "Compras Nubank"
private const val TAG = "NubankNotificationListener"
private const val ROUTE_TRANSACTIONS = "transactions"

class NubankNotificationListenerService : NotificationListenerService() {
  override fun onNotificationPosted(statusBarNotification: StatusBarNotification) {
    if (statusBarNotification.packageName != NUBANK_PACKAGE) {
      return
    }

    Log.i(TAG, "Notificação do Nubank recebida.")
    val extras = statusBarNotification.notification.extras ?: return
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
    val body = (
      extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
        ?: extras.getCharSequence(Notification.EXTRA_TEXT)
      )?.toString().orEmpty()
    val fullText = "$title\n$body"
    val purchase = parseApprovedPurchase(fullText)
    if (purchase == null) {
      Log.i(TAG, "Notificação do Nubank ignorada: não corresponde a uma compra aprovada com valor.")
      return
    }
    val notificationId = createNotificationId(statusBarNotification, title, body)
    val purchaseDate = SimpleDateFormat("yyyy-MM-dd", Locale.US)
      .format(Date(statusBarNotification.postTime))

    val capture = try {
      insertPurchase(notificationId, purchase.amount, purchase.merchant, purchaseDate)
    } catch (error: Exception) {
      Log.e(TAG, "Falha ao registrar compra capturada do Nubank.", error)
      CaptureResult(false, null)
    }

    if (capture.inserted) {
      Log.i(TAG, "Compra aprovada do Nubank capturada e registrada.")
      val body = buildString {
        append(purchase.merchant)
        append(" • ")
        append(formatCurrency(purchase.amount))
        capture.budgetMessage?.let {
          append('\n')
          append(it)
        }
      }
      showNotification(notificationId, "Compra Nubank registrada", body)
    } else {
      Log.w(TAG, "Compra Nubank não foi registrada; confira se o banco local já foi inicializado.")
      showNotification(
        notificationId,
        "Revisar compra Nubank",
        "Não foi possível salvar a compra capturada. Confira o FinControl."
      )
    }
  }

  private fun insertPurchase(
    notificationId: String,
    amount: Double,
    merchant: String,
    date: String
  ): CaptureResult {
    val databaseFile = File(File(filesDir, "SQLite"), "fincontrol.db")
    if (!databaseFile.exists()) {
      return CaptureResult(false, null)
    }

    val database = SQLiteDatabase.openDatabase(
      databaseFile.absolutePath,
      null,
      SQLiteDatabase.OPEN_READWRITE
    )

    try {
      database.beginTransaction()
      database.execSQL(
        """
        CREATE TABLE IF NOT EXISTS imported_bank_notifications (
          notification_id TEXT PRIMARY KEY NOT NULL,
          transaction_id INTEGER NOT NULL,
          imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """.trimIndent()
      )

      database.rawQuery(
        "SELECT 1 FROM imported_bank_notifications WHERE notification_id = ? LIMIT 1",
        arrayOf(notificationId)
      ).use { cursor ->
        if (cursor.moveToFirst()) {
          database.setTransactionSuccessful()
          return CaptureResult(false, null)
        }
      }

      if (!tableExists(database, "transactions") || !tableExists(database, "categories")) {
        return CaptureResult(false, null)
      }

      val categoryId = findOrCreateCategory(database)
      val transactionValues = ContentValues().apply {
        put("description", merchant)
        put("amount", amount)
        put("date", date)
        put("type", "expense")
        put("category_id", categoryId)
        put("is_fixed", 0)
      }
      val transactionId = database.insertOrThrow("transactions", null, transactionValues)
      database.execSQL(
        "INSERT INTO imported_bank_notifications (notification_id, transaction_id) VALUES (?, ?)",
        arrayOf(notificationId, transactionId)
      )
      val budgetMessage = buildBudgetMessage(database, date)
      database.setTransactionSuccessful()
      return CaptureResult(true, budgetMessage)
    } finally {
      database.endTransaction()
      database.close()
    }
  }

  /**
   * Calcula, a partir do banco local, quanto ainda resta do orçamento mensal após a
   * compra capturada, no mesmo critério usado pelo BudgetAlertService do app:
   * despesas do mês + gastos fixos ativos, comparados ao salário configurado.
   */
  private fun buildBudgetMessage(database: SQLiteDatabase, date: String): String? {
    val salary = queryDouble(
      database,
      "SELECT monthly_salary FROM settings WHERE id = 1",
      null
    )
    if (salary <= 0.0) {
      return null
    }

    val month = date.take(7)
    val transactionExpense = queryDouble(
      database,
      "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense' AND strftime('%Y-%m', date) = ?",
      arrayOf(month)
    )
    val fixedExpenseTotal = queryDouble(
      database,
      "SELECT COALESCE(SUM(amount), 0) FROM fixed_expenses WHERE active = 1",
      null
    )

    val totalExpense = transactionExpense + fixedExpenseTotal
    val available = salary - totalExpense
    if (available <= 0.0) {
      return "Limite mensal excedido."
    }

    val availablePercent = (available / salary) * 100
    return String.format(
      Locale("pt", "BR"),
      "Restam %.0f%% do orçamento (%s).",
      availablePercent,
      formatCurrency(available)
    )
  }

  private fun queryDouble(database: SQLiteDatabase, sql: String, args: Array<String>?): Double {
    database.rawQuery(sql, args).use { cursor ->
      return if (cursor.moveToFirst()) cursor.getDouble(0) else 0.0
    }
  }

  private fun tableExists(database: SQLiteDatabase, tableName: String): Boolean {
    database.rawQuery(
      "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
      arrayOf(tableName)
    ).use { cursor ->
      return cursor.moveToFirst()
    }
  }

  private fun findOrCreateCategory(database: SQLiteDatabase): Long {
    database.rawQuery(
      "SELECT id FROM categories WHERE name = ? AND type = 'expense' LIMIT 1",
      arrayOf(CATEGORY_NAME)
    ).use { cursor ->
      if (cursor.moveToFirst()) {
        return cursor.getLong(0)
      }
    }

    val values = ContentValues().apply {
      put("name", CATEGORY_NAME)
      put("icon", "credit-card")
      put("color", "#8A05BE")
      put("type", "expense")
      put("rule_group", "wants")
    }
    return database.insertOrThrow("categories", null, values)
  }

  private fun showNotification(
    notificationId: String,
    title: String,
    body: String,
    route: String = ROUTE_TRANSACTIONS
  ) {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) {
      Log.w(TAG, "Permissão POST_NOTIFICATIONS não concedida; compra registrada sem aviso na barra.")
      return
    }

    val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        NOTIFICATION_CHANNEL_ID,
        "Avisos financeiros",
        IMPORTANCE_HIGH
      ).apply {
        description = "Compras capturadas do Nubank e alertas de orçamento"
        enableVibration(true)
      }
      notificationManager.createNotificationChannel(channel)
    }

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
    } else {
      Notification.Builder(this)
    }

    builder
      .setSmallIcon(android.R.drawable.stat_notify_chat)
      .setContentTitle(title)
      .setContentText(body)
      .setStyle(Notification.BigTextStyle().bigText(body))
      .setAutoCancel(true)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .setContentIntent(buildContentIntent(notificationId, route))

    notificationManager.notify(notificationId.hashCode(), builder.build())
  }

  /**
   * Abre o app na aba correspondente ao tocar na notificação, usando o deep link
   * `fincontrol://<route>` tratado pelo roteamento do app.
   */
  private fun buildContentIntent(notificationId: String, route: String): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("fincontrol://$route")).apply {
      setPackage(packageName)
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_SINGLE_TOP or
          Intent.FLAG_ACTIVITY_CLEAR_TOP
      )
    }
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    return PendingIntent.getActivity(this, notificationId.hashCode(), intent, flags)
  }

  private fun formatCurrency(amount: Double): String =
    String.format(Locale("pt", "BR"), "R$ %,.2f", amount)

  private fun parseApprovedPurchase(text: String): ParsedPurchase? {
    if (!text.contains("compra", ignoreCase = true) || !APPROVED_REGEX.containsMatchIn(text)) {
      return null
    }

    val amountText = AMOUNT_REGEX.find(text)?.groupValues?.get(1) ?: return null
    val amount = amountText.replace(".", "").replace(",", ".").toDoubleOrNull() ?: return null
    if (amount <= 0) {
      return null
    }

    val merchant = MERCHANT_REGEX.find(text)
      ?.groupValues
      ?.get(1)
      ?.trim()
      ?.trimEnd('.', ',', ';', '…')
      ?.takeIf { it.isNotBlank() && !it.equals("nubank", ignoreCase = true) }
      ?: "Compra Nubank (revisar estabelecimento)"

    return ParsedPurchase(amount, merchant)
  }

  private fun createNotificationId(
    statusBarNotification: StatusBarNotification,
    title: String,
    body: String
  ): String {
    val source = "${statusBarNotification.packageName}|${statusBarNotification.key}|${statusBarNotification.postTime}|$title|$body"
    return MessageDigest.getInstance("SHA-256")
      .digest(source.toByteArray())
      .joinToString("") { byte -> "%02x".format(byte) }
  }

  private data class ParsedPurchase(val amount: Double, val merchant: String)

  private data class CaptureResult(val inserted: Boolean, val budgetMessage: String?)

  companion object {
    private val APPROVED_REGEX = Regex("""aprovad[ao]""", RegexOption.IGNORE_CASE)
    private val AMOUNT_REGEX = Regex("""R\$\s*([\d.]+,\d{2})""", RegexOption.IGNORE_CASE)
    private val MERCHANT_REGEX = Regex(
      """aprovad[ao]\s+em\s+(.+?)(?=\s+(?:no|na)\s+(?:(?:seu|meu)\s+)?(?:cart[aã]o|cr[eé]dito)|[.!?,]|\.\.\.|…|$)""",
      RegexOption.IGNORE_CASE
    )
  }
}
