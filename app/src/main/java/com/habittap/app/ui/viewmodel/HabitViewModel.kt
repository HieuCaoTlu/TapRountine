package com.habittap.app.ui.viewmodel

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.habittap.app.data.entity.HabitEntity
import com.habittap.app.data.entity.HabitLogEntity
import com.habittap.app.data.entity.HabitType
import com.habittap.app.data.repository.HabitRepository
import com.habittap.app.data.repository.HabitTapLogic
import com.habittap.app.widget.HabitGlanceWidget
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.delay
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
    private val repository: HabitRepository,
    @ApplicationContext private val appContext: Context
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

    init {
        // Mọi thay đổi dữ liệu (từ app hoặc widget) -> làm mới widget để luôn khớp với app
        viewModelScope.launch {
            combine(
                repository.getAllHabits(),
                _selectedDate.flatMapLatest { date -> repository.getLogsForDate(date.toString()) }
            ) { habits, logs -> habits to logs }
                .collect { HabitGlanceWidget().updateAll(appContext) }
        }

        // Widget luôn dùng ngày hiện tại -> app cũng tự chuyển sang ngày mới khi qua nửa đêm
        viewModelScope.launch {
            while (true) {
                delay(30_000)
                val today = LocalDate.now()
                if (_selectedDate.value != today) _selectedDate.value = today
            }
        }
    }

    fun onHabitTapped(habit: HabitEntity, onCompleted: (() -> Unit)? = null) {
        viewModelScope.launch {
            val justCompleted = HabitTapLogic.applyTap(repository, habit, LocalDate.now().toString())
            if (justCompleted) {
                onCompleted?.invoke()
            }
        }
    }

    fun onHabitDecremented(habit: HabitEntity) {
        viewModelScope.launch {
            val dateStr = _selectedDate.value.toString()
            val existingLog = repository.getLog(habit.id, dateStr) ?: return@launch
            if (existingLog.count <= 0) return@launch

            val newCount = existingLog.count - 1
            val newCompleted = HabitTapLogic.isCompleted(habit, newCount)
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

    fun updateHabit(habit: HabitEntity) {
        viewModelScope.launch {
            repository.updateHabit(habit)
        }
    }

    fun deleteHabit(habitId: Long) {
        viewModelScope.launch {
            repository.deleteHabit(habitId)
        }
    }

    fun clearAllData() {
        viewModelScope.launch {
            repository.clearAllData()
        }
    }
}
