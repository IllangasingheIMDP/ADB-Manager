package com.example.adbmobile

import android.app.Notification
import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Base64
import android.util.Log
import org.java_websocket.client.WebSocketClient
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class NotificationListener : NotificationListenerService() {
    companion object {
        var webSocketClient: WebSocketClient? = null
        private const val TAG = "NotificationListener"
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null || webSocketClient?.isOpen != true) return

        val sharedPrefs = getSharedPreferences("WebSocketPrefs", MODE_PRIVATE)
        if (!sharedPrefs.getBoolean("notification_sharing_enabled", false)) return

        try {
            val notification = sbn.notification
            val packageName = sbn.packageName
            val title = notification.extras.getString(Notification.EXTRA_TITLE) ?: ""
            val text = notification.extras.getString(Notification.EXTRA_TEXT) ?: ""
            val time = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                .format(Date(sbn.postTime))

            // Create JSON object for notification data
            val notificationData = JSONObject().apply {
                put("package", packageName)
                put("title", title)
                put("text", text)
                put("timestamp", time)
            }

            // Base64 encode the JSON string
            val base64Data = Base64.encodeToString(
                notificationData.toString().toByteArray(Charsets.UTF_8),
                Base64.NO_WRAP
            )

            // Create the outer message
            val message = JSONObject().apply {
                put("type", "notification")
                put("data", base64Data)
            }

            // Log the message before sending
            Log.d(TAG, "Sending notification message: ${message.toString()}")

            webSocketClient?.send(message.toString())
            Log.i(TAG, "Sent notification from $packageName")
        } catch (e: Exception) {
            Log.e(TAG, "Error sending notification: ${e.message}", e)
        }
    }
    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "Notification Listener connected")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.i(TAG, "Notification Listener disconnected")
    }
}