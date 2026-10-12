package com.habittap.app.ui.viewmodel

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

    fun clearAllData() {
        viewModelScope.launch {
            repository.clearAllData()
        }
    }
}
