package com.habittap.app.data.repository

import com.habittap.app.data.dao.HabitDao
import com.habittap.app.data.entity.HabitEntity
import com.habittap.app.data.entity.HabitLogEntity
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

interface HabitRepository {
    fun getAllHabits(): Flow<List<HabitEntity>>
    fun getLogsForDate(date: String): Flow<List<HabitLogEntity>>
    suspend fun getLog(habitId: Long, date: String): HabitLogEntity?
    suspend fun upsertLog(log: HabitLogEntity)
    suspend fun insertHabit(habit: HabitEntity): Long
    suspend fun updateHabit(habit: HabitEntity)
    suspend fun deleteHabit(habitId: Long)
    suspend fun clearAllData()
}

@Singleton
class HabitRepositoryImpl @Inject constructor(
    private val dao: HabitDao
) : HabitRepository {
    override fun getAllHabits(): Flow<List<HabitEntity>> = dao.getAllHabits()
    override fun getLogsForDate(date: String): Flow<List<HabitLogEntity>> = dao.getLogsForDate(date)
    override suspend fun getLog(habitId: Long, date: String): HabitLogEntity? = dao.getLog(habitId, date)
    override suspend fun upsertLog(log: HabitLogEntity) = dao.upsertLog(log)
    override suspend fun insertHabit(habit: HabitEntity): Long = dao.insertHabit(habit)
    override suspend fun updateHabit(habit: HabitEntity) = dao.updateHabit(habit)
    override suspend fun deleteHabit(habitId: Long) = dao.deleteHabit(habitId)
    override suspend fun clearAllData() {
        dao.clearAllHabits()
        dao.clearAllLogs()
    }
}
