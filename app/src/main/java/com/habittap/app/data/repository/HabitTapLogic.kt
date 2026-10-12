package com.habittap.app.data.repository

import com.habittap.app.data.entity.HabitEntity
import com.habittap.app.data.entity.HabitLogEntity
import com.habittap.app.data.entity.HabitType

/**
 * Nguồn logic duy nhất cho thao tác chạm thói quen.
 * App (ViewModel) và Widget cùng gọi vào đây để luôn đồng bộ 100%.
 */
object HabitTapLogic {

    fun isCompleted(habit: HabitEntity, count: Int): Boolean = when (habit.type) {
        HabitType.ONE_TAP -> count >= 1
        HabitType.N_TAP -> count >= habit.targetCount
        HabitType.UNLIMITED -> count > 0
    }

    /**
     * Áp dụng 1 lần chạm cho [date].
     * @return true nếu lần chạm này vừa chuyển thói quen sang trạng thái hoàn thành.
     */
    suspend fun applyTap(repository: HabitRepository, habit: HabitEntity, date: String): Boolean {
        val existing = repository.getLog(habit.id, date)
        val currentCount = existing?.count ?: 0
        val wasCompleted = isCompleted(habit, currentCount)

        val newCount = when (habit.type) {
            HabitType.ONE_TAP -> if (currentCount >= 1) 0 else 1
            HabitType.N_TAP, HabitType.UNLIMITED -> currentCount + 1
        }
        val newCompleted = isCompleted(habit, newCount)

        repository.upsertLog(
            HabitLogEntity(
                id = existing?.id ?: 0,
                habitId = habit.id,
                date = date,
                count = newCount,
                completed = newCompleted
            )
        )
        return newCompleted && !wasCompleted
    }
}
