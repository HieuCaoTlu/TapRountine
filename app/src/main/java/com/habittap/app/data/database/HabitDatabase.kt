package com.habittap.app.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.habittap.app.data.dao.HabitDao
import com.habittap.app.data.entity.HabitEntity
import com.habittap.app.data.entity.HabitLogEntity

@Database(entities = [HabitEntity::class, HabitLogEntity::class], version = 1, exportSchema = false)
abstract class HabitDatabase : RoomDatabase() {
    abstract fun habitDao(): HabitDao
}
