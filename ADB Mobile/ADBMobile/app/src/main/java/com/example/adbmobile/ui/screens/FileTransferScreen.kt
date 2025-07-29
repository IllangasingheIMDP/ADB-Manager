package com.example.adbmobile

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Emerald/Teal Color Palette
object GlassColors {
    val emerald50 = Color(0xFFecfdf5)
    val emerald100 = Color(0xFFd1fae5)
    val emerald200 = Color(0xFFa7f3d0)
    val emerald300 = Color(0xFF6ee7b7)
    val emerald400 = Color(0xFF34d399)
    val emerald500 = Color(0xFF10b981)
    val emerald600 = Color(0xFF059669)
    val emerald700 = Color(0xFF047857)
    val emerald800 = Color(0xFF065f46)
    val emerald900 = Color(0xFF064e3b)

    val teal400 = Color(0xFF2dd4bf)
    val teal500 = Color(0xFF14b8a6)
    val teal600 = Color(0xFF0d9488)
    val teal700 = Color(0xFF0f766e)
    val teal800 = Color(0xFF115e59)

    val glassCardBg = emerald900.copy(alpha = 0.1f)
    val inputBg = emerald700.copy(alpha = 0.2f)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FileTransferScreen() {
    var ipAddress by remember { mutableStateOf("") }
    var port by remember { mutableStateOf("") }
    var isConnected by remember { mutableStateOf(false) }
    var connectionStatus by remember { mutableStateOf("Waiting for connection...") }
    var isLoading by remember { mutableStateOf(false) }

    // Animated background
    val infiniteTransition = rememberInfiniteTransition(label = "background")
    val animatedOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(10000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "offset"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        GlassColors.emerald900,
                        GlassColors.teal800,
                        GlassColors.emerald800
                    ),
                    start = androidx.compose.ui.geometry.Offset(0f, animatedOffset * 1000),
                    end = androidx.compose.ui.geometry.Offset(1000f, (1f - animatedOffset) * 1000)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            // Header Card
            GlassCard {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MailOutline,
                        contentDescription = "File Transfer",
                        modifier = Modifier.size(48.dp),
                        tint = GlassColors.emerald300
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "File Transfer",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = GlassColors.emerald100
                    )

                    Text(
                        text = "Connect and share files securely",
                        fontSize = 14.sp,
                        color = GlassColors.emerald200,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Connection Card
            GlassCard {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text(
                        text = "Server Connection",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = GlassColors.emerald100,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    // IP Input
                    GlassTextField(
                        value = ipAddress,
                        onValueChange = { ipAddress = it },
                        label = "Enter PC IP (e.g. 192.168.1.100)",
                        leadingIcon = Icons.Default.Home,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    // Port Input
                    GlassTextField(
                        value = port,
                        onValueChange = { port = it },
                        label = "Enter Port (e.g. 5000)",
                        leadingIcon = Icons.Default.Settings,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.padding(bottom = 20.dp)
                    )

                    // Connect Button
                    GlassButton(
                        onClick = {
                            isLoading = true
                            connectionStatus = "Connecting..."
                            // Add your connection logic here
                        },
                        text = "Connect to Server",
                        icon = Icons.Default.Lock,
                        enabled = ipAddress.isNotEmpty() && port.isNotEmpty() && !isLoading,
                        isLoading = isLoading
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Status Card
            GlassCard {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Icon(
                        imageVector = if (isConnected) Icons.Default.CheckCircle else Icons.Default.Info,
                        contentDescription = "Status",
                        modifier = Modifier.size(32.dp),
                        tint = if (isConnected) GlassColors.emerald400 else GlassColors.emerald300
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = connectionStatus,
                        fontSize = 16.sp,
                        color = GlassColors.emerald200,
                        textAlign = TextAlign.Center
                    )

                    if (isLoading) {
                        Spacer(modifier = Modifier.height(12.dp))
                        CircularProgressIndicator(
                            color = GlassColors.emerald400,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 3.dp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Upload Card
            GlassCard {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text(
                        text = "File Upload",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = GlassColors.emerald100,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    GlassButton(
                        onClick = {
                            // Add your file selection logic here
                        },
                        text = "Select and Upload File",
                        icon = Icons.Default.Add,
                        enabled = isConnected,
                        backgroundColor = GlassColors.teal500
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = GlassColors.glassCardBg
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        content()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GlassTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    leadingIcon: ImageVector,
    modifier: Modifier = Modifier,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = {
            Text(
                text = label,
                color = GlassColors.emerald300
            )
        },
        leadingIcon = {
            Icon(
                imageVector = leadingIcon,
                contentDescription = null,
                tint = GlassColors.emerald300
            )
        },
        modifier = modifier.fillMaxWidth(),
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = GlassColors.emerald100,
            unfocusedTextColor = GlassColors.emerald100,
            focusedBorderColor = GlassColors.emerald400,
            unfocusedBorderColor = GlassColors.emerald400.copy(alpha = 0.6f),
            focusedContainerColor = GlassColors.inputBg,
            unfocusedContainerColor = GlassColors.inputBg,
            cursorColor = GlassColors.emerald300
        ),
        shape = RoundedCornerShape(12.dp),
        keyboardOptions = keyboardOptions,
        singleLine = true
    )
}

@Composable
fun GlassButton(
    onClick: () -> Unit,
    text: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    backgroundColor: Color = GlassColors.emerald500
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp),
        enabled = enabled && !isLoading,
        colors = ButtonDefaults.buttonColors(
            containerColor = backgroundColor,
            contentColor = Color.White,
            disabledContainerColor = backgroundColor.copy(alpha = 0.5f),
            disabledContentColor = Color.White.copy(alpha = 0.7f)
        ),
        shape = RoundedCornerShape(14.dp),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                color = Color.White,
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp
            )
        } else {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier
                    .size(20.dp)
                    .padding(end = 8.dp)
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        Text(
            text = text,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}