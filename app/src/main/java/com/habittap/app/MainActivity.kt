package com.habittap.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
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
            when (currentTab) {
                0 -> HabitListScreen(
                    uiState = uiState,
                    viewMode = viewMode,
                    onViewModeChange = { viewMode = it },
                    showCompleted = showCompleted,
                    onToggleShowCompleted = { showCompleted = !showCompleted },
                    onHabitTapped = { viewModel.onHabitTapped(it) },
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
                2 -> SettingsScreen()
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
                // Floating Pill Menu (rounded-full, icons only)
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
                            onClick = { currentTab = 0 },
                            modifier = Modifier
                                .size(44.dp)
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
                            onClick = { currentTab = 1 },
                            modifier = Modifier
                                .size(44.dp)
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
                            onClick = { currentTab = 2 },
                            modifier = Modifier
                                .size(44.dp)
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

                // Nút tròn thêm thói quen nằm bên phải
                FloatingActionButton(
                    onClick = {
                        editingHabit = null
                        isCreateModalOpen = true
                    },
                    shape = CircleShape,
                    containerColor = Color(0xFF171717),
                    contentColor = Color.White,
                    elevation = FloatingActionButtonDefaults.elevation(8.dp),
                    modifier = Modifier.size(52.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Thêm thói quen", modifier = Modifier.size(26.dp))
                }
            }
        }

        // Create / Edit Habit Dialog
        if (isCreateModalOpen) {
            HabitDialog(
                habit = editingHabit,
                onDismiss = {
                    isCreateModalOpen = false
                    editingHabit = null
                },
                onSave = { title, type, target, icon, cat ->
                    if (editingHabit != null) {
                        // Update
                    } else {
                        viewModel.insertHabit(title, type, target, icon, cat)
                    }
                    isCreateModalOpen = false
                    editingHabit = null
                },
                onDelete = {
                    editingHabit?.let { viewModel.deleteHabit(it.id) }
                    isCreateModalOpen = false
                    editingHabit = null
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
    // Phân loại: Thói quen hoàn thành (One Tap xong hoặc Counter Tab đủ target) thì tự ẩn
    val activeHabits = mutableListOf<HabitEntity>()
    val completedHabits = mutableListOf<HabitEntity>()

    uiState.habits.forEach { habit ->
        val log = uiState.todayLogs[habit.id]
        val count = log?.count ?: 0
        val isDone = (habit.type == HabitType.ONE_TAP && count >= 1) ||
                     (habit.type == HabitType.N_TAP && count >= habit.targetCount)
        if (isDone) {
            completedHabits.add(habit)
        } else {
            activeHabits.add(habit)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Date Navigation: < Hôm nay >
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = {}) {
                Icon(Icons.Default.ChevronLeft, contentDescription = "Trước")
            }
            Text(
                text = "Hôm nay",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF171717)
            )
            IconButton(onClick = {}) {
                Icon(Icons.Default.ChevronRight, contentDescription = "Sau")
            }
        }

        // View Mode Switcher
        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(percent = 50))
                .background(Color(0xFFE5E7EB))
                .padding(3.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(percent = 50),
                color = if (viewMode == "all") Color.White else Color.Transparent,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { onViewModeChange("all") }
            ) {
                Text(
                    text = "Tất cả",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF171717),
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
            Surface(
                shape = RoundedCornerShape(percent = 50),
                color = if (viewMode == "grouped") Color.White else Color.Transparent,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { onViewModeChange("grouped") }
            ) {
                Text(
                    text = "Theo danh mục",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF171717),
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Habit Items
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (activeHabits.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (completedHabits.isNotEmpty()) "Tất cả thói quen hôm nay đã hoàn thành!" else "Chưa có thói quen. Bấm + để tạo mới.",
                            fontSize = 13.sp,
                            color = Color(0xFF737373)
                        )
                    }
                }
            } else {
                items(activeHabits, key = { it.id }) { habit ->
                    HabitCardItem(
                        habit = habit,
                        count = uiState.todayLogs[habit.id]?.count ?: 0,
                        onTap = { onHabitTapped(habit) },
                        onLongClick = { onHabitLongClick(habit) }
                    )
                }
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
                // Square Icon
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFF1F5F9)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = getEmojiForIcon(habit.icon), fontSize = 20.sp)
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

            // Tab Button
            Button(
                onClick = onTap,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFF1F5F9),
                    contentColor = Color(0xFF171717)
                ),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(text = "Tab", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
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
        Text(
            text = "Tiến độ",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(vertical = 16.dp)
        )

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
                                    Text(text = getEmojiForIcon(habit.icon), fontSize = 16.sp)
                                }
                                Column {
                                    Text(
                                        text = habit.title,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Chuỗi 12 ngày · 34 lần tab",
                                        fontSize = 12.sp,
                                        color = Color(0xFF737373)
                                    )
                                }
                            }

                            IconButton(onClick = { onEditHabit(habit) }) {
                                Icon(Icons.Default.Edit, contentDescription = "Sửa", modifier = Modifier.size(18.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Mini routine heatmap 14 weeks
                        val mockWeeks = remember {
                            List(14) { weekIdx ->
                                List(7) { dayIdx ->
                                    val count = if ((weekIdx * 7 + dayIdx) % 3 == 0) 5 else if ((weekIdx + dayIdx) % 2 == 0) 1 else 0
                                    DayContribution(
                                        date = "2026-09-01",
                                        taps = count,
                                        completed = count > 0
                                    )
                                }
                            }
                        }
                        GitHubCommitHeatmap(weeksData = mockWeeks, habitType = habit.type)
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Cài đặt",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(vertical = 16.dp)
        )

        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(text = "THÔNG BÁO & PHẢN HỒI", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Nhắc nhở hàng ngày", fontSize = 14.sp)
                    Switch(checked = true, onCheckedChange = {})
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Rung phản hồi", fontSize = 14.sp)
                    Switch(checked = true, onCheckedChange = {})
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(text = "DỮ LIỆU", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                Text(text = "Tạo sao lưu", fontSize = 14.sp, modifier = Modifier.clickable {})
                Divider(color = Color(0xFFF1F5F9))
                Text(text = "Phục hồi dữ liệu", fontSize = 14.sp, modifier = Modifier.clickable {})
                Divider(color = Color(0xFFF1F5F9))
                Text(text = "Xóa dữ liệu", fontSize = 14.sp, color = Color.Red, modifier = Modifier.clickable {})
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
    var showAdvanced by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = if (habit != null) "Sửa thói quen" else "Tạo thói quen", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Square Icon
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFFF1F5F9))
                        .align(Alignment.CenterHorizontally),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = getEmojiForIcon(icon), fontSize = 24.sp)
                }

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Tên thói quen") },
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(
                        selected = type == HabitType.ONE_TAP,
                        onClick = { type = HabitType.ONE_TAP },
                        label = { Text("One Tap") }
                    )
                    FilterChip(
                        selected = type == HabitType.N_TAP,
                        onClick = { type = HabitType.N_TAP },
                        label = { Text("Counter") }
                    )
                    FilterChip(
                        selected = type == HabitType.UNLIMITED,
                        onClick = { type = HabitType.UNLIMITED },
                        label = { Text("Streak") }
                    )
                }

                if (type == HabitType.N_TAP) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Số lần mục tiêu:")
                        IconButton(onClick = { if (target > 1) target-- }) { Text("-") }
                        Text(text = "$target", fontWeight = FontWeight.Bold)
                        IconButton(onClick = { target++ }) { Text("+") }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { if (title.isNotBlank()) onSave(title, type, target, icon, "Sức khỏe") }
            ) {
                Text("Lưu")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Hủy") }
        }
    )
}

fun getEmojiForIcon(icon: String): String {
    return when (icon) {
        "droplets" -> "💧"
        "book-open" -> "📖"
        "dumbbell" -> "🏋️"
        "heart" -> "❤️"
        "sparkles" -> "🧘"
        "moon" -> "🌙"
        "code" -> "💻"
        "coffee" -> "☕"
        "footprints" -> "👟"
        else -> "✨"
    }
}
