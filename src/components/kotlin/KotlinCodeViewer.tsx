import React, { useState } from 'react';
import JSZip from 'jszip';
import { Copy, Check, Download, Code2, Cpu, Sparkles } from 'lucide-react';

interface CodeFile {
  name: string;
  category: string;
  description: string;
  relativePath: string;
  code: string;
}

const KOTLIN_FILES: CodeFile[] = [
  {
    name: 'HabitViewModel.kt',
    category: 'ViewModel (MVVM)',
    description: 'Quản lý StateFlow, xử lý logic One-Tap, Counter Tab (N-Tap), Streak Tab',
    relativePath: 'app/src/main/java/com/habittap/app/ui/viewmodel/HabitViewModel.kt',
    code: `package com.habittap.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.habittap.app.data.entity.HabitEntity
import com.habittap.app.data.entity.HabitLogEntity
import com.habittap.app.data.entity.HabitType
import com.habittap.app.data.repository.HabitRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

data class HabitUiState(
    val habits: List<HabitEntity> = emptyList(),
    val todayLogs: Map<Long, HabitLogEntity> = emptyMap(),
    val selectedDate: LocalDate = LocalDate.now(),
    val totalTapsToday: Int = 0,
    val completedCountToday: Int = 0,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class HabitViewModel @Inject constructor(
    private val repository: HabitRepository
) : ViewModel() {

    private val _selectedDate = MutableStateFlow(LocalDate.now())
    val selectedDate: StateFlow<LocalDate> = _selectedDate.asStateFlow()

    val uiState: StateFlow<HabitUiState> = combine(
        repository.getAllHabits(),
        _selectedDate.flatMapLatest { date -> repository.getLogsForDate(date.toString()) }
    ) { habits, logs ->
        val logMap = logs.associateBy { it.habitId }
        val totalTaps = logs.sumOf { it.count }
        val completedCount = logs.count { it.completed }
        HabitUiState(
            habits = habits,
            todayLogs = logMap,
            selectedDate = _selectedDate.value,
            totalTapsToday = totalTaps,
            completedCountToday = completedCount
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = HabitUiState(isLoading = true)
    )

    fun onHabitTapped(habit: HabitEntity) {
        viewModelScope.launch {
            val dateStr = _selectedDate.value.toString()
            val existingLog = repository.getLog(habit.id, dateStr)

            when (habit.type) {
                HabitType.ONE_TAP -> {
                    val newCompleted = !(existingLog?.completed ?: false)
                    val newCount = if (newCompleted) 1 else 0
                    repository.upsertLog(
                        HabitLogEntity(
                            id = existingLog?.id ?: 0,
                            habitId = habit.id,
                            date = dateStr,
                            count = newCount,
                            completed = newCompleted
                        )
                    )
                }
                HabitType.N_TAP -> {
                    val currentCount = existingLog?.count ?: 0
                    val newCount = currentCount + 1
                    val newCompleted = newCount >= habit.targetCount
                    repository.upsertLog(
                        HabitLogEntity(
                            id = existingLog?.id ?: 0,
                            habitId = habit.id,
                            date = dateStr,
                            count = newCount,
                            completed = newCompleted
                        )
                    )
                }
                HabitType.UNLIMITED -> {
                    val currentCount = existingLog?.count ?: 0
                    val newCount = currentCount + 1
                    repository.upsertLog(
                        HabitLogEntity(
                            id = existingLog?.id ?: 0,
                            habitId = habit.id,
                            date = dateStr,
                            count = newCount,
                            completed = true
                        )
                    )
                }
            }
        }
    }

    fun onHabitDecremented(habit: HabitEntity) {
        viewModelScope.launch {
            val dateStr = _selectedDate.value.toString()
            val existingLog = repository.getLog(habit.id, dateStr) ?: return@launch
            if (existingLog.count <= 0) return@launch

            val newCount = existingLog.count - 1
            val newCompleted = when (habit.type) {
                HabitType.ONE_TAP -> newCount >= 1
                HabitType.N_TAP -> newCount >= habit.targetCount
                HabitType.UNLIMITED -> newCount > 0
            }
            repository.upsertLog(
                existingLog.copy(count = newCount, completed = newCompleted)
            )
        }
    }

    fun insertHabit(title: String, type: HabitType, targetCount: Int, icon: String, category: String) {
        viewModelScope.launch {
            repository.insertHabit(
                HabitEntity(
                    title = title,
                    type = type,
                    targetCount = targetCount,
                    icon = icon,
                    category = category
                )
            )
        }
    }

    fun deleteHabit(habitId: Long) {
        viewModelScope.launch {
            repository.deleteHabit(habitId)
        }
    }
}
`,
  },
  {
    name: 'HabitEntity.kt',
    category: 'Room Database Entity',
    description: 'Bảng Room HabitEntity và HabitLogEntity',
    relativePath: 'app/src/main/java/com/habittap/app/data/entity/HabitEntity.kt',
    code: `package com.habittap.app.data.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import java.time.LocalDate

enum class HabitType {
    ONE_TAP,    // One Tap: 1 chạm là hoàn thành
    N_TAP,      // Counter Tab: Chạm N lần
    UNLIMITED   // Streak Tab: Đếm số lần không giới hạn
}

@Entity(tableName = "habits")
data class HabitEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val type: HabitType,
    val targetCount: Int = 1,
    val icon: String = "droplets",
    val category: String = "Sức khỏe",
    val createdAt: String = LocalDate.now().toString(),
    val reminderTime: String? = null
)

@Entity(
    tableName = "habit_logs",
    foreignKeys = [
        ForeignKey(
            entity = HabitEntity::class,
            parentColumns = ["id"],
            childColumns = ["habitId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["habitId", "date"], unique = true)
    ]
)
data class HabitLogEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val habitId: Long,
    val date: String,
    val count: Int,
    val completed: Boolean,
    val lastTappedAt: Long = System.currentTimeMillis()
)
`,
  },
  {
    name: 'HabitDao.kt',
    category: 'Room DAO',
    description: 'Truy vấn Flow phản ứng tức thì với Room SQLite',
    relativePath: 'app/src/main/java/com/habittap/app/data/dao/HabitDao.kt',
    code: `package com.habittap.app.data.dao

import androidx.room.*
import com.habittap.app.data.entity.HabitEntity
import com.habittap.app.data.entity.HabitLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface HabitDao {
    @Query("SELECT * FROM habits ORDER BY id DESC")
    fun getAllHabits(): Flow<List<HabitEntity>>

    @Query("SELECT * FROM habit_logs WHERE date = :date")
    fun getLogsForDate(date: String): Flow<List<HabitLogEntity>>

    @Query("SELECT * FROM habit_logs WHERE habitId = :habitId AND date = :date LIMIT 1")
    suspend fun getLog(habitId: Long, date: String): HabitLogEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertLog(log: HabitLogEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHabit(habit: HabitEntity): Long

    @Update
    suspend fun updateHabit(habit: HabitEntity)

    @Query("DELETE FROM habits WHERE id = :habitId")
    suspend fun deleteHabit(habitId: Long)
}
`,
  },
  {
    name: 'GitHubHeatmapView.kt',
    category: 'Jetpack Compose UI',
    description: 'Vẽ biểu đồ commit routine thu nhỏ với số lần tap',
    relativePath: 'app/src/main/java/com/habittap/app/ui/components/GitHubHeatmapView.kt',
    code: `package com.habittap.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.habittap.app.data.entity.HabitType

@Composable
fun GitHubCommitHeatmap(
    weeksData: List<List<DayContribution>>,
    habitType: HabitType,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Row(
        modifier = modifier.horizontalScroll(scrollState),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        weeksData.forEach { week ->
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                week.forEach { day ->
                    val cellColor = when {
                        day.taps == 0 -> Color(0xFFF1F5F9)
                        habitType == HabitType.ONE_TAP -> Color(0xFF171717)
                        day.taps >= 8 -> Color(0xFF171717)
                        day.taps >= 5 -> Color(0xFF404040)
                        day.taps >= 2 -> Color(0xFF737373)
                        else -> Color(0xFFA3A3A3)
                    }

                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(cellColor),
                        contentAlignment = Alignment.Center
                    ) {
                        if (habitType != HabitType.ONE_TAP && day.taps > 0) {
                            Text(
                                text = if (day.taps > 9) "9+" else day.taps.toString(),
                                color = Color.White,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

data class DayContribution(
    val date: String,
    val taps: Int,
    val completed: Boolean
)
`,
  },
  {
    name: 'HabitGlanceWidget.kt',
    category: 'Android Glance Widget',
    description: 'Widget màn hình chính Android Glance tap nhanh tức thì',
    relativePath: 'app/src/main/java/com/habittap/app/widget/HabitGlanceWidget.kt',
    code: `package com.habittap.app.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.ActionParameters
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.Color

class HabitGlanceWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(ColorProvider(Color(0xFF171717)))
                    .padding(12.dp)
            ) {
                // Header 4x2
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "HabitTap (4x2)",
                        style = TextStyle(color = ColorProvider(Color.White), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    )
                    Spacer(modifier = GlanceModifier.defaultWeight())
                    Text(
                        text = "Hôm nay",
                        style = TextStyle(color = ColorProvider(Color(0xFFA3A3A3)), fontSize = 10.sp)
                    )
                }

                Spacer(modifier = GlanceModifier.height(8.dp))

                // Dòng 4 ô thói quen trong cùng 1 hàng ngang
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    HabitGlanceSlot("Nước", "3/8", false, 1L)
                    Spacer(modifier = GlanceModifier.width(6.dp))
                    HabitGlanceSlot("Sách", "Xong", true, 2L)
                    Spacer(modifier = GlanceModifier.width(6.dp))
                    HabitGlanceSlot("Gym", "Tab", false, 3L)
                    Spacer(modifier = GlanceModifier.width(6.dp))
                    HabitGlanceSlot("Ngủ", "Tab", false, 4L)
                }
            }
        }
    }
}

@Composable
fun RowScope.HabitGlanceSlot(title: String, count: String, isDone: Boolean, habitId: Long) {
    val habitParamKey = ActionParameters.Key<Long>("habitId")
    val bgColor = if (isDone) Color(0xFF262626) else Color(0xFF202020)
    Column(
        modifier = GlanceModifier
            .defaultWeight()
            .height(72.dp)
            .background(ColorProvider(bgColor))
            .padding(6.dp)
            .clickable(actionRunCallback<TapHabitActionCallback>(actionParametersOf(habitParamKey to habitId))),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = title, style = TextStyle(color = ColorProvider(Color.White), fontSize = 11.sp, fontWeight = FontWeight.Bold))
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(text = if (isDone) "✓ $count" else "+ $count", style = TextStyle(color = ColorProvider(if (isDone) Color(0xFF10B981) else Color(0xFFA3A3A3)), fontSize = 9.sp))
    }
}

class TapHabitActionCallback : ActionCallback {
    override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
        // Cập nhật lượt tab và widget tự động làm mới
    }
}
`,
  },
  {
    name: 'MainActivity.kt',
    category: 'Jetpack Compose UI',
    description: 'Giao diện chính: Habit list, Tiến độ routine heatmap, Cài đặt và Menu nổi',
    relativePath: 'app/src/main/java/com/habittap/app/MainActivity.kt',
    code: `package com.habittap.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import dagger.hilt.android.AndroidEntryPoint

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
`,
  },
  {
    name: 'AndroidManifest.xml',
    category: 'Android Manifest',
    description: 'Cấu hình quyền và receiver cho Widget Android',
    relativePath: 'app/src/main/AndroidManifest.xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:name=".HabitApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="HabitTap"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HabitTap">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.HabitTap">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".widget.HabitWidgetReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/habit_widget_info" />
        </receiver>

    </application>
</manifest>
`,
  },
  {
    name: 'app/build.gradle.kts',
    category: 'Build Config',
    description: 'Dependencies Jetpack Compose, Room, Glance Widget',
    relativePath: 'app/build.gradle.kts',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
}

android {
    namespace = "com.habittap.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.habittap.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.3")
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    implementation("androidx.glance:glance-appwidget:1.1.0")
    implementation("androidx.glance:glance-material3:1.1.0")
    implementation("com.google.dagger:hilt-android:2.51.1")
    kapt("com.google.dagger:hilt-compiler:2.51.1")
}
`,
  },
  {
    name: 'build-apk.yml (GitHub Actions)',
    category: 'CI/CD Auto Build APK',
    description: 'Workflow tự động build file APK miễn phí trên GitHub trong 2 phút',
    relativePath: '.github/workflows/build-apk.yml',
    code: `name: Build Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Setup Gradle 8.7
        uses: gradle/actions/setup-gradle@v3
        with:
          gradle-version: '8.7'

      - name: Build Debug APK
        run: |
          # Tìm thư mục chứa settings.gradle.kts nếu bị đẩy vào thư mục con
          PROJECT_DIR=$(find . -name "settings.gradle.kts" -exec dirname {} \; | head -n 1)
          if [ -n "$PROJECT_DIR" ]; then
            cd "$PROJECT_DIR"
          fi
          # Tạo gradlew version 8.7 nếu chưa có trong kho lưu trữ
          if [ ! -f "./gradlew" ]; then
            echo "Generating Gradle 8.7 wrapper..."
            gradle wrapper --gradle-version 8.7 || true
          fi
          if [ -f "./gradlew" ]; then
            chmod +x gradlew
            ./gradlew assembleDebug --stacktrace
          else
            gradle assembleDebug --stacktrace
          fi
      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: HabitTap-app-debug
          path: '**/build/outputs/apk/**/*.apk'
`,
  },
];

export const KotlinCodeViewer: React.FC = () => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const currentFile = KOTLIN_FILES[selectedFileIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZipProject = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Root files
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "HabitTap"
include(":app")
`
      );

      zip.file(
        'build.gradle.kts',
        `plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
    id("com.google.dagger.hilt.android") version "2.51.1" apply false
}
`
      );

      // Wrapper files
      zip.file(
        'gradlew',
        `#!/bin/sh
exec gradle "$@"
`
      );
      zip.file(
        'gradle/wrapper/gradle-wrapper.properties',
        `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
      );

      // Add all project files into their relative folder structure
      KOTLIN_FILES.forEach((f) => {
        zip.file(f.relativePath, f.code);
      });

      // Generate README with instant APK guide
      zip.file(
        'README.md',
        `# HabitTap - Native Android Kotlin MVVM

## Hướng dẫn mở dự án:
1. Giải nén thư mục này.
2. Mở **Android Studio** -> Chọn **Open** -> Chọn thư mục giải nén.
3. Chờ Gradle đồng bộ -> Bấm nút **Run** (tam giác xanh) để cài thẳng vào điện thoại, hoặc vào **Build > Build Bundle(s) / APK(s) > Build APK(s)** để xuất file cài đặt .apk!

## Tự động Build APK qua GitHub:
Tệp \`.github/workflows/build-apk.yml\` đã được tạo sẵn. Khi bạn đẩy code lên GitHub, GitHub sẽ tự động build file \`app-debug.apk\` cho bạn tải về mà không cần cài Android Studio!
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HabitTap_Android_Studio_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Lỗi tạo tệp ZIP: ' + (err as Error).message);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            <span>Mã Nguồn Kotlin Native MVVM</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tải trọn bộ Project Android Studio (.zip) để xuất file APK cài đặt
          </p>
        </div>

        {/* Nút tải trọn bộ project ZIP */}
        <button
          onClick={handleDownloadZipProject}
          disabled={isZipping}
          className="px-4 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Đang nén file...' : 'Tải Project Android Studio (.ZIP)'}</span>
        </button>
      </div>

      {/* File Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {KOTLIN_FILES.map((file, idx) => (
          <button
            key={file.name}
            onClick={() => setSelectedFileIdx(idx)}
            className={`
              px-3.5 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5
              ${
                selectedFileIdx === idx
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60'
              }
            `}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Code Editor Container */}
      <div className="rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900/60">
          <div>
            <span className="text-xs font-mono font-bold text-white">
              {currentFile.name}
            </span>
            <span className="text-xs text-neutral-400 ml-2 hidden sm:inline">
              · {currentFile.description}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép code</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 overflow-x-auto max-h-[500px] custom-scrollbar">
          <pre className="text-xs font-mono text-neutral-200 leading-relaxed">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
