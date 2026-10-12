package com.habittap.app.data.entity

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
