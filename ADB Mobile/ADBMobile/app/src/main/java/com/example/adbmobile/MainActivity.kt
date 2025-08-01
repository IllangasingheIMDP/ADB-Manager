package com.example.adbmobile

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Base64
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import java.io.IOException
import java.net.URI
import org.json.JSONObject
import java.io.File
import android.os.Environment



class MainActivity : AppCompatActivity() {
    private lateinit var ipInput: EditText
    private lateinit var portInput: EditText
    private lateinit var connectButton: Button
    private lateinit var statusText: TextView
    private lateinit var uploadButton: Button
    private lateinit var notificationToggleButton: Button
    private lateinit var sharedPreferences: SharedPreferences
    private var webSocketClient: WebSocketClient? = null
    private var selectedFileUri: Uri? = null
    private var isNotificationSharingEnabled = false
    private val TAG = "MainActivity"
    private val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001

    private val notificationListenerPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (isNotificationListenerEnabled()) {
            toggleNotificationSharing() // Retry enabling notification sharing
        } else {
            Toast.makeText(this, "Notification listener permission denied", Toast.LENGTH_SHORT).show()
        }
    }
    private fun saveConfigToAppExternalDir(ip: String, port: String) {
        try {
            val configDir = getExternalFilesDir("ADB_Client")
            if (configDir != null) {
                if (!configDir.exists()) {
                    configDir.mkdirs()
                }
                val configFile = File(configDir, "ws-config.json")
                val jsonObject = JSONObject()
                jsonObject.put("ip", ip)
                jsonObject.put("port", port)
                configFile.writeText(jsonObject.toString())
                Log.i(TAG, "Saved IP and Port to config: $ip:$port")
            } else {
                Log.w(TAG, "App external files directory is null, cannot save config")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save config file: ${e.message}", e)
        }
    }


    private fun loadConfigFromAppExternalDir() {
        try {
            val configDir = getExternalFilesDir("ADB_Client")
            if (configDir != null) {
                val configFile = File(configDir, "ws-config.json")
                if (configFile.exists()) {
                    val json = configFile.readText()
                    val jsonObject = JSONObject(json)
                    val ip = jsonObject.getString("ip")
                    val port = jsonObject.getString("port")

                    if (ip.isNotBlank() && port.isNotBlank()) {
                        sharedPreferences.edit().putString("ip", ip).putString("port", port).apply()
                        Log.i(TAG, "Loaded IP and Port from config: $ip:$port")
                    }
                } else {
                    Log.w(TAG, "Config file does not exist at ${configFile.absolutePath}")
                }
            } else {
                Log.w(TAG, "App external files directory is null")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to read config file: ${e.message}", e)
        }
    }


    private val filePicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {
            selectedFileUri = uri
            uploadFile(uri) // No silent parameter needed here, as UI is active
        } else {
            statusText.text = "No file selected"
            Log.e(TAG, "File picker returned null URI")
        }
    }

    private fun createNotificationChannel() {
        val name = "Upload Status"
        val descriptionText = "Shows status of background file uploads"
        val importance = NotificationManager.IMPORTANCE_DEFAULT
        val channel = NotificationChannel("upload_channel", name, importance).apply {
            description = descriptionText
        }
        val notificationManager: NotificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }

    private fun showNotification(title: String, message: String) {
        val builder = NotificationCompat.Builder(this, "upload_channel")
            .setSmallIcon(android.R.drawable.stat_sys_upload_done)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)

        val notificationManager = NotificationManagerCompat.from(this)
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
                return
            }
            return
        }
        notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
    }

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)



        createNotificationChannel()
        loadConfigFromAppExternalDir()
        try {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                )
            }
            sharedPreferences = getSharedPreferences("WebSocketPrefs", MODE_PRIVATE)
            loadConfigFromAppExternalDir()
            val savedIp = sharedPreferences.getString("ip", "")
            val savedPort = sharedPreferences.getString("port", "")

            val launchedFromShare = intent?.action == Intent.ACTION_SEND && intent.type != null

            if (launchedFromShare) {
                selectedFileUri = intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                if (selectedFileUri != null && !savedIp.isNullOrEmpty() && !savedPort.isNullOrEmpty()) {
                    connectToWebSocket(savedIp, savedPort, silent = true)
                } else {
                    Toast.makeText(this, "Invalid shared file or saved IP/Port missing", Toast.LENGTH_LONG).show()
                    finish()
                }
                return
            }

            setContentView(R.layout.activity_main)

            ipInput = findViewById(R.id.ipInput)
            portInput = findViewById(R.id.portInput)
            connectButton = findViewById(R.id.connectButton)
            statusText = findViewById(R.id.statusText)
            uploadButton = findViewById(R.id.uploadButton)
            notificationToggleButton = findViewById(R.id.notificationToggleButton)

            if (!savedIp.isNullOrEmpty() && !savedPort.isNullOrEmpty()) {
                ipInput.setText(savedIp)
                portInput.setText(savedPort)
                connectToWebSocket(savedIp, savedPort)
            }

            isNotificationSharingEnabled = sharedPreferences.getBoolean("notification_sharing_enabled", false)
            if (isNotificationSharingEnabled && isNotificationListenerEnabled()) {
                notificationToggleButton.text = "Disable Notification Sharing"
                NotificationListener.webSocketClient = webSocketClient
                val intent = Intent(this, NotificationListener::class.java)
                startService(intent)
            }

            connectButton.setOnClickListener {
                val ip = ipInput.text.toString().trim()
                val port = portInput.text.toString().trim()
                if (ip.isNotEmpty() && port.isNotEmpty()) {
                    sharedPreferences.edit().putString("ip", ip).putString("port", port).apply()
                    saveConfigToAppExternalDir(ip, port)
                    connectToWebSocket(ip, port)
                } else {
                    statusText.text = "Please enter IP and port"
                    Log.e(TAG, "IP or port input is empty")
                }
            }

            uploadButton.setOnClickListener {
                filePicker.launch("*/*")
            }

            notificationToggleButton.setOnClickListener {
                toggleNotificationSharing()
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error in onCreate: ${e.message}", e)
            Toast.makeText(this, "Error initializing app: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                showNotification("Shared File", "Your file was successfully shared.")
            } else {
                Toast.makeText(this, "Notification permission denied", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun isNotificationListenerEnabled(): Boolean {
        val component = ComponentName(this, NotificationListener::class.java)
        val enabledListeners = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        return enabledListeners?.contains(component.flattenToString()) == true
    }

    @SuppressLint("SetTextI18n")
    private fun toggleNotificationSharing() {
        if (!isNotificationSharingEnabled) {
            if (!isNotificationListenerEnabled()) {
                val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                notificationListenerPermissionLauncher.launch(intent)
                return
            }

            isNotificationSharingEnabled = true
            notificationToggleButton.text = "Disable Notification Sharing"
            sharedPreferences.edit().putBoolean("notification_sharing_enabled", true).apply()
            statusText.text = "Notification sharing enabled"

            NotificationListener.webSocketClient = webSocketClient
            val intent = Intent(this, NotificationListener::class.java)
            startService(intent)
        } else {
            isNotificationSharingEnabled = false
            notificationToggleButton.text = "Enable Notification Sharing"
            sharedPreferences.edit().putBoolean("notification_sharing_enabled", false).apply()
            statusText.text = "Notification sharing disabled"

            val intent = Intent(this, NotificationListener::class.java)
            stopService(intent)
        }
    }

    @SuppressLint("SetTextI18n")
    private fun connectToWebSocket(ip: String, port: String, silent: Boolean = false) {
        val serverUri = try {
            URI("ws://$ip:$port")
        } catch (e: Exception) {
            if (!silent) {
                statusText.text = "Invalid IP or port"
            }
            Log.e(TAG, "Invalid URI: ${e.message}", e)
            if (silent) finish()
            return
        }

        webSocketClient?.close()

        webSocketClient = object : WebSocketClient(serverUri) {
            override fun onOpen(handshakedata: ServerHandshake?) {
                runOnUiThread {
                    NotificationListener.webSocketClient = this
                    if (silent) {
                        val fileName = getFileName(selectedFileUri!!) ?: "Shared File"
                        uploadFile(selectedFileUri!!, silent = true)
                        finish()
                    } else {
                        statusText.text = "Connected to server"
                        uploadButton.isEnabled = true
                        selectedFileUri?.let {
                            uploadFile(it)
                        }
                    }
                }
            }
            override fun onMessage(message: String) {
                runOnUiThread {
                    if (!silent) statusText.text = message
                }
            }

            override fun onClose(code: Int, reason: String?, remote: Boolean) {
                runOnUiThread {
                    if (!silent) {
                        statusText.text = "Disconnected from server"
                        uploadButton.isEnabled = false
                    }
                }
            }

            override fun onError(ex: Exception?) {
                runOnUiThread {
                    if (silent) {
                        Toast.makeText(this@MainActivity, "WebSocket error: ${ex?.message}", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        statusText.text = "Error: ${ex?.message}"
                        uploadButton.isEnabled = false
                    }
                }
            }
        }

        try {
            webSocketClient?.connect()
            if (!silent) {
                statusText.text = "Connecting to server..."
            }
        } catch (e: Exception) {
            Log.e(TAG, "Connection failed: ${e.message}", e)
            if (silent) {
                Toast.makeText(this, "Connection failed: ${e.message}", Toast.LENGTH_SHORT).show()
                finish()
            } else {
                statusText.text = "Connection failed: ${e.message}"
            }
        }
    }

    @SuppressLint("SetTextI18n")
    private fun uploadFile(uri: Uri, silent: Boolean = false) {
        if (webSocketClient?.isOpen != true) {
            if (!silent) {
                statusText.text = "Not connected to server"
            }
            Log.e(TAG, "WebSocket not connected")
            return
        }

        try {
            val fileName = getFileName(uri) ?: "unknown_file"
            val inputStream = contentResolver.openInputStream(uri)
            val fileBytes = inputStream?.readBytes()
            inputStream?.close()

            if (fileBytes == null) {
                if (!silent) {
                    statusText.text = "Could not read file"
                }
                Log.e(TAG, "Failed to read file bytes")
                return
            }

            val base64Data = Base64.encodeToString(fileBytes, Base64.NO_WRAP)
            val message = """{"filename":"$fileName","filedata":"$base64Data"}"""
            webSocketClient?.send(message)
            if (!silent) {
                statusText.text = "Uploading file: $fileName"
            }
            Log.i(TAG, "Uploading file: $fileName")
            showNotification("File Shared", "Successfully shared: $fileName")
        } catch (e: IOException) {
            if (!silent) {
                statusText.text = "Error reading file: ${e.message}"
            }
            Log.e(TAG, "Error reading file: ${e.message}", e)
        }
    }

    private fun getFileName(uri: Uri): String? {
        var result: String? = null
        try {
            if (uri.scheme == "content") {
                contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val columnIndex = cursor.getColumnIndexOrThrow("_display_name")
                        result = cursor.getString(columnIndex)
                    }
                }
            }
            if (result == null) {
                result = uri.path
                val cut = result?.lastIndexOf('/')
                if (cut != null && cut != -1) {
                    result = result?.substring(cut + 1)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting file name: ${e.message}", e)
        }
        return result
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            webSocketClient?.close()
            Log.i(TAG, "WebSocket closed in onDestroy")
        } catch (e: Exception) {
            Log.e(TAG, "Error closing WebSocket: ${e.message}", e)
        }
    }
}