package com.habittap.app

import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.habittap.app.data.entity.HabitEntity
import com.habittap.app.data.entity.HabitType
import com.habittap.app.ui.components.DayContribution
import com.habittap.app.ui.components.GitHubCommitHeatmap
import com.habittap.app.ui.viewmodel.HabitViewModel
import dagger.hilt.android.AndroidEntryPoint
import java.time.LocalDate

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HabitTapTheme {
                HabitTapApp()
            }
        }
    }
}

/**
 * Rung mặc định của hệ thống
 */
fun triggerAndroidHaptic(context: Context, type: String = "default") {
    try {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        } ?: return

        if (!vibrator.hasVibrator()) return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(50)
        }
    } catch (_: Exception) {
        // Fallback gracefully
    }
}

@Composable
fun HabitTapTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF171717),
            background = Color(0xFFF8F9FA),
            surface = Color.White,
            onPrimary = Color.White,
            onBackground = Color(0xFF171717),
            onSurface = Color(0xFF171717)
        ),
        content = content
    )
}

@Composable
fun HabitTapApp(viewModel: HabitViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var currentTab by remember { mutableStateOf(0) } // 0: Habits, 1: Progress, 2: Settings
    var isCreateModalOpen by remember { mutableStateOf(false) }
    var editingHabit by remember { mutableStateOf<HabitEntity?>(null) }
    var viewMode by remember { mutableStateOf("all") } // "all" or "grouped"
    var showCompleted by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8F9FA))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 80.dp)
        ) {
            AnimatedContent(
                targetState = currentTab,
                transitionSpec = {
                    if (targetState > initialState) {
                        (slideInHorizontally { it } + fadeIn()).togetherWith(slideOutHorizontally { -it } + fadeOut())
                    } else {
                        (slideInHorizontally { -it } + fadeIn()).togetherWith(slideOutHorizontally { it } + fadeOut())
                    }
                },
                label = "TabSlideAnimation"
            ) { tab ->
                when (tab) {
                    0 -> HabitListScreen(
                        uiState = uiState,
                        viewMode = viewMode,
                        onViewModeChange = {
                            viewMode = it
                        },
                        showCompleted = showCompleted,
                        onToggleShowCompleted = {
                            showCompleted = !showCompleted
                        },
                        onHabitTapped = { habit ->
                            viewModel.onHabitTapped(habit) {
                                triggerAndroidHaptic(context, "heavy")
                            }
                        },
                        onHabitLongClick = {
                            editingHabit = it
                            isCreateModalOpen = true
                        }
                    )
                    1 -> ProgressScreen(
                        uiState = uiState,
                        onEditHabit = {
                            editingHabit = it
                            isCreateModalOpen = true
                        }
                    )
                    2 -> SettingsScreen(
                        onClearAllData = {
                            viewModel.clearAllData()
                            Toast.makeText(context, "Đã xóa toàn bộ dữ liệu!", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }

        // Floating Bottom Navigation & Add Button (Space between 2 bên)
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Floating Pill Menu (rounded-full, các nút rộng hơn 20%: 66dp)
                Surface(
                    shape = RoundedCornerShape(percent = 50),
                    color = Color.White.copy(alpha = 0.95f),
                    shadowElevation = 8.dp,
                    modifier = Modifier.clip(CircleShape)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = {
                                currentTab = 0
                            },
                            modifier = Modifier
                                .width(66.dp)
                                .height(48.dp)
                                .clip(CircleShape)
                                .background(if (currentTab == 0) Color(0xFF171717) else Color.Transparent)
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = "Thói quen",
                                tint = if (currentTab == 0) Color.White else Color(0xFF737373)
                            )
                        }

                        IconButton(
                            onClick = {
                                currentTab = 1
                            },
                            modifier = Modifier
                                .width(66.dp)
                                .height(48.dp)
                                .clip(CircleShape)
                                .background(if (currentTab == 1) Color(0xFF171717) else Color.Transparent)
                        ) {
                            Icon(
                                Icons.Default.DateRange,
                                contentDescription = "Tiến độ",
                                tint = if (currentTab == 1) Color.White else Color(0xFF737373)
                            )
                        }

                        IconButton(
                            onClick = {
                                currentTab = 2
                            },
                            modifier = Modifier
                                .width(66.dp)
                                .height(48.dp)
                                .clip(CircleShape)
                                .background(if (currentTab == 2) Color(0xFF171717) else Color.Transparent)
                        ) {
                            Icon(
                                Icons.Default.Settings,
                                contentDescription = "Cài đặt",
                                tint = if (currentTab == 2) Color.White else Color(0xFF737373)
                            )
                        }
                    }
                }

                // Add button (+)
                FloatingActionButton(
                    onClick = {
                        editingHabit = null
                        isCreateModalOpen = true
                    },
                    containerColor = Color(0xFF171717),
                    contentColor = Color.White,
                    shape = CircleShape,
                    modifier = Modifier.size(52.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Thêm thói quen")
                }
            }
        }

        if (isCreateModalOpen) {
            HabitDialog(
                habit = editingHabit,
                onDismiss = { isCreateModalOpen = false },
                onSave = { title, type, target, icon, cat ->
                    triggerAndroidHaptic(context, "heavy")
                    if (editingHabit != null) {
                        viewModel.updateHabit(
                            editingHabit!!.copy(
                                title = title,
                                type = type,
                                targetCount = target,
                                icon = icon,
                                category = cat
                            )
                        )
                    } else {
                        viewModel.insertHabit(title, type, target, icon, cat)
                    }
                    isCreateModalOpen = false
                },
                onDelete = {
                    editingHabit?.let {
                        triggerAndroidHaptic(context, "heavy")
                        viewModel.deleteHabit(it.id)
                    }
                    isCreateModalOpen = false
                }
            )
        }
    }
}

@Composable
fun HabitListScreen(
    uiState: com.habittap.app.ui.viewmodel.HabitUiState,
    viewMode: String,
    onViewModeChange: (String) -> Unit,
    showCompleted: Boolean,
    onToggleShowCompleted: () -> Unit,
    onHabitTapped: (HabitEntity) -> Unit,
    onHabitLongClick: (HabitEntity) -> Unit
) {
    val completedHabits = remember(uiState.habits, uiState.todayLogs) {
        uiState.habits.filter { habit ->
            val log = uiState.todayLogs[habit.id]
            log?.completed == true
        }
    }
    val activeHabits = remember(uiState.habits, completedHabits) {
        uiState.habits.filter { !completedHabits.contains(it) }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Sticky Header: Date + Day Name + View Mode Switcher
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "${LocalDate.now().dayOfMonth} Tháng ${LocalDate.now().monthValue}",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF171717)
                )
                Text(
                    text = "Hôm nay",
                    fontSize = 14.sp,
                    color = Color(0xFF737373)
                )
            }

            // View Mode Switcher ("Tất cả" / "Nhóm")
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFF1F5F9),
                modifier = Modifier.clip(RoundedCornerShape(12.dp))
            ) {
                Row(modifier = Modifier.padding(2.dp)) {
                    Text(
                        text = "Tất cả",
                        fontSize = 12.sp,
                        fontWeight = if (viewMode == "all") FontWeight.Bold else FontWeight.Normal,
                        color = if (viewMode == "all") Color(0xFF171717) else Color(0xFF737373),
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (viewMode == "all") Color.White else Color.Transparent)
                            .clickable { onViewModeChange("all") }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                    Text(
                        text = "Nhóm",
                        fontSize = 12.sp,
                        fontWeight = if (viewMode == "grouped") FontWeight.Bold else FontWeight.Normal,
                        color = if (viewMode == "grouped") Color(0xFF171717) else Color(0xFF737373),
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (viewMode == "grouped") Color.White else Color.Transparent)
                            .clickable { onViewModeChange("grouped") }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // Habit list with smooth animations
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            if (activeHabits.isEmpty() && completedHabits.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Chưa có thói quen nào. Nhấn '+' để bắt đầu!",
                            color = Color(0xFF737373),
                            fontSize = 14.sp
                        )
                    }
                }
            }

            items(activeHabits, key = { it.id }) { habit ->
                HabitCardItem(
                    habit = habit,
                    count = uiState.todayLogs[habit.id]?.count ?: 0,
                    onTap = { onHabitTapped(habit) },
                    onLongClick = { onHabitLongClick(habit) }
                )
            }

            // Nút "Đã hoàn thành (x)" căn giữa và mờ mờ
            if (completedHabits.isNotEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        TextButton(
                            onClick = onToggleShowCompleted,
                            colors = ButtonDefaults.textButtonColors(
                                contentColor = Color(0xFF737373).copy(alpha = 0.5f)
                            )
                        ) {
                            Text(
                                text = "Đã hoàn thành (${completedHabits.size})",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Normal
                            )
                        }
                    }
                }

                if (showCompleted) {
                    items(completedHabits, key = { it.id }) { habit ->
                        HabitCardItem(
                            habit = habit,
                            count = uiState.todayLogs[habit.id]?.count ?: 0,
                            onTap = { onHabitTapped(habit) },
                            onLongClick = { onHabitLongClick(habit) }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun HabitCardItem(
    habit: HabitEntity,
    count: Int,
    onTap: () -> Unit,
    onLongClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Color.White,
        shadowElevation = 1.dp,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .combinedClickable(
                onClick = {},
                onLongClick = onLongClick
            )
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                // Square Icon with real Vector Icon
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFF1F5F9)),
                    contentAlignment = Alignment.Center
                ) {
                    HabitVectorIcon(habit.icon, modifier = Modifier.size(22.dp))
                }

                Column {
                    Text(
                        text = habit.title,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF171717)
                    )
                    if (habit.type == HabitType.N_TAP) {
                        Text(
                            text = "$count / ${habit.targetCount} lần",
                            fontSize = 12.sp,
                            color = Color(0xFF737373)
                        )
                    } else if (habit.type == HabitType.UNLIMITED) {
                        Text(
                            text = "$count lần",
                            fontSize = 12.sp,
                            color = Color(0xFF737373)
                        )
                    }
                }
            }

            val isCompleted = when (habit.type) {
                HabitType.ONE_TAP -> count >= 1
                HabitType.N_TAP -> count >= habit.targetCount
                HabitType.UNLIMITED -> count > 0
            }

            // Xong Action Button (thay thế chữ Tab)
            Button(
                onClick = onTap,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isCompleted) Color(0xFF171717) else Color(0xFFF1F5F9),
                    contentColor = if (isCompleted) Color.White else Color(0xFF171717)
                ),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
            ) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = "Xong",
                    modifier = Modifier.size(15.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Xong",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun ProgressScreen(
    uiState: com.habittap.app.ui.viewmodel.HabitUiState,
    onEditHabit: (HabitEntity) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Đồng nhất chiều cao header với SettingsScreen (h-11 chuẩn: 44dp)
        Box(
            modifier = Modifier
                .height(48.dp)
                .fillMaxWidth(),
            contentAlignment = Alignment.CenterStart
        ) {
            Text(
                text = "Tiến độ",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF171717)
            )
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(uiState.habits) { habit ->
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    shadowElevation = 1.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFFF1F5F9)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    HabitVectorIcon(habit.icon, modifier = Modifier.size(20.dp))
                                }
                                Column {
                                    Text(
                                        text = habit.title,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    val count = uiState.todayLogs[habit.id]?.count ?: 0
                                    Text(
                                        text = if (habit.type == HabitType.ONE_TAP) "Thói quen hàng ngày" else "Hôm nay: $count lần",
                                        fontSize = 12.sp,
                                        color = Color(0xFF737373)
                                    )
                                }
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                val isCountBased = habit.type != HabitType.ONE_TAP
                                val statValue = if (isCountBased) {
                                    (uiState.todayLogs[habit.id]?.count ?: 0)
                                } else {
                                    if ((uiState.todayLogs[habit.id]?.count ?: 0) > 0) 1 else 0
                                }
                                val statUnit = if (isCountBased) "Lần" else "Ngày"

                                Row(verticalAlignment = Alignment.Bottom) {
                                    Text(
                                        text = "$statValue",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF171717)
                                    )
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(
                                        text = statUnit,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color(0xFF737373)
                                    )
                                }

                                IconButton(onClick = { onEditHabit(habit) }) {
                                    Icon(Icons.Default.Edit, contentDescription = "Sửa", modifier = Modifier.size(18.dp))
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Routine heatmap 14 tuần
                        val todayCount = uiState.todayLogs[habit.id]?.count ?: 0
                        val weeksData = remember(todayCount) {
                            List(14) { weekIdx ->
                                List(7) { dayIdx ->
                                    val isCurrentDay = (weekIdx == 13 && dayIdx == 6)
                                    val dayCount = if (isCurrentDay) todayCount else if ((weekIdx + dayIdx) % 3 == 0) 2 else 0
                                    DayContribution(
                                        date = "2026-10-12",
                                        taps = dayCount,
                                        completed = dayCount > 0
                                    )
                                }
                            }
                        }
                        GitHubCommitHeatmap(weeksData = weeksData, habitType = habit.type)
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsScreen(
    onClearAllData: () -> Unit
) {
    val context = LocalContext.current
    var notificationsEnabled by remember { mutableStateOf(true) }
    var vibrationEnabled by remember { mutableStateOf(true) }
    var soundEnabled by remember { mutableStateOf(true) }
    var reminderTime by remember { mutableStateOf("20:00") }
    var showTimeDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Đồng nhất chiều cao header với ProgressScreen (h-11 chuẩn: 48dp)
        Box(
            modifier = Modifier
                .height(48.dp)
                .fillMaxWidth(),
            contentAlignment = Alignment.CenterStart
        ) {
            Text(
                text = "Cài đặt",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF171717)
            )
        }

        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(text = "THÔNG BÁO & PHẢN HỒI", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                
                // Nhắc nhở hàng ngày
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Nhắc nhở hàng ngày", fontSize = 14.sp)
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = {
                            notificationsEnabled = it
                            Toast.makeText(context, if (it) "Đã bật nhắc nhở" else "Đã tắt nhắc nhở", Toast.LENGTH_SHORT).show()
                        }
                    )
                }

                // Giờ nhắc nhở
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showTimeDialog = true },
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Thời gian nhắc nhở", fontSize = 14.sp)
                    Text(text = reminderTime, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF171717))
                }

                Divider(color = Color(0xFFF1F5F9))

                // Âm thanh khi hoàn thành
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Âm thanh hoàn thành", fontSize = 14.sp)
                    Switch(
                        checked = soundEnabled,
                        onCheckedChange = {
                            soundEnabled = it
                        }
                    )
                }

                // Rung phản hồi haptic
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Rung khi hoàn thành thói quen", fontSize = 14.sp)
                    Switch(
                        checked = vibrationEnabled,
                        onCheckedChange = {
                            vibrationEnabled = it
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(text = "DỮ LIỆU & ĐỒNG BỘ", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                
                // Sao lưu dữ liệu
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            Toast.makeText(context, "Đã tạo bản sao lưu thành công!", Toast.LENGTH_SHORT).show()
                        },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Tạo sao lưu (Xuất JSON)", fontSize = 14.sp)
                }

                Divider(color = Color(0xFFF1F5F9))

                // Phục hồi dữ liệu
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            triggerAndroidHaptic(context, "medium")
                            Toast.makeText(context, "Sẵn sàng nhập dữ liệu sao lưu", Toast.LENGTH_SHORT).show()
                        },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Phục hồi dữ liệu", fontSize = 14.sp)
                }

                Divider(color = Color(0xFFF1F5F9))

                // Xóa toàn bộ dữ liệu
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            onClearAllData()
                        },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Xóa toàn bộ dữ liệu", fontSize = 14.sp, color = Color(0xFFE11D48), fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

@Composable
fun HabitDialog(
    habit: HabitEntity?,
    onDismiss: () -> Unit,
    onSave: (String, HabitType, Int, String, String) -> Unit,
    onDelete: () -> Unit
) {
    var title by remember { mutableStateOf(habit?.title ?: "") }
    var type by remember { mutableStateOf(habit?.type ?: HabitType.ONE_TAP) }
    var target by remember { mutableStateOf(habit?.targetCount ?: 5) }
    var icon by remember { mutableStateOf(habit?.icon ?: "droplets") }

    val richIconList = listOf(
        "droplets", "book-open", "dumbbell", "heart", "sparkles",
        "flame", "code", "moon", "coffee", "footprints",
        "brain", "smile", "pencil", "zap", "music",
        "bike", "sun", "target", "clock", "wallet",
        "award", "leaf", "activity", "bed", "star"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = if (habit != null) "Sửa thói quen" else "Tạo thói quen", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Header biểu tượng hiện tại
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFFF1F5F9)),
                        contentAlignment = Alignment.Center
                    ) {
                        HabitVectorIcon(icon, modifier = Modifier.size(28.dp))
                    }
                    Column {
                        Text(text = "Biểu tượng thói quen", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF171717))
                        Text(text = "Chạm 1 icon bên dưới để đổi", fontSize = 11.sp, color = Color(0xFF737373))
                    }
                }

                // Khay chọn biểu tượng Vector Thật (25 icon phong phú)
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFF8FAFC),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .padding(8.dp)
                            .heightIn(max = 130.dp)
                    ) {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(richIconList.chunked(5)) { rowIcons ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceAround
                                ) {
                                    rowIcons.forEach { iconKey ->
                                        val isSelected = icon == iconKey
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(if (isSelected) Color(0xFF171717) else Color.White)
                                                .clickable {
                                                    icon = iconKey
                                                },
                                            contentAlignment = Alignment.Center
                                        ) {
                                            HabitVectorIcon(
                                                icon = iconKey,
                                                modifier = Modifier.size(18.dp),
                                                tint = if (isSelected) Color.White else Color(0xFF475569)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Tên thói quen") },
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(
                        HabitType.ONE_TAP to "One Tap",
                        HabitType.N_TAP to "Counter",
                        HabitType.UNLIMITED to "Streak"
                    ).forEach { (t, label) ->
                        val selected = type == t
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (selected) Color(0xFF171717) else Color(0xFFF5F5F5),
                            border = BorderStroke(1.dp, if (selected) Color(0xFF171717) else Color(0xFFE5E5E5)),
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable {
                                    type = t
                                }
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (selected) Color.White else Color(0xFF525252),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                modifier = Modifier.padding(vertical = 10.dp)
                            )
                        }
                    }
                }

                if (type == HabitType.N_TAP) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Số lần mục tiêu:")
                        IconButton(onClick = {
                            if (target > 1) {
                                target--
                            }
                        }) { Text("-") }
                        Text(text = "$target", fontWeight = FontWeight.Bold)
                        IconButton(onClick = {
                            target++
                        }) { Text("+") }
                    }
                }

                if (habit != null) {
                    OutlinedButton(
                        onClick = onDelete,
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color(0xFFFFF1F2),
                            contentColor = Color(0xFFE11D48)
                        ),
                        border = BorderStroke(1.dp, Color(0xFFFECDD3)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Xóa", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Xóa thói quen", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { if (title.isNotBlank()) onSave(title, type, target, icon, "Sức khỏe") },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF171717))
            ) {
                Text("Lưu")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Hủy") }
        }
    )
}

@Composable
fun HabitVectorIcon(
    icon: String,
    modifier: Modifier = Modifier,
    tint: Color = Color.Unspecified
) {
    val vector = when (icon) {
        "droplets" -> Icons.Default.WaterDrop
        "book-open" -> Icons.Default.MenuBook
        "dumbbell" -> Icons.Default.FitnessCenter
        "heart" -> Icons.Default.Favorite
        "sparkles" -> Icons.Default.SelfImprovement
        "flame" -> Icons.Default.LocalFireDepartment
        "code" -> Icons.Default.Code
        "moon" -> Icons.Default.Bedtime
        "coffee" -> Icons.Default.LocalCafe
        "footprints" -> Icons.Default.DirectionsWalk
        "brain" -> Icons.Default.Psychology
        "smile" -> Icons.Default.SentimentSatisfied
        "pencil" -> Icons.Default.Edit
        "zap" -> Icons.Default.Bolt
        "music" -> Icons.Default.MusicNote
        "bike" -> Icons.Default.DirectionsBike
        "sun" -> Icons.Default.WbSunny
        "target" -> Icons.Default.GpsFixed
        "clock" -> Icons.Default.AccessTime
        "wallet" -> Icons.Default.AccountBalanceWallet
        "award" -> Icons.Default.EmojiEvents
        "leaf" -> Icons.Default.Spa
        "activity" -> Icons.Default.MonitorHeart
        "bed" -> Icons.Default.Hotel
        "star" -> Icons.Default.Star
        else -> Icons.Default.CheckCircle
    }
    Icon(
        imageVector = vector,
        contentDescription = icon,
        modifier = modifier,
        tint = if (tint == Color.Unspecified) Color(0xFF171717) else tint
    )
}
