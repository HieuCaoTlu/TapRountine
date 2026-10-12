package com.habittap.app.di

import android.content.Context
import com.habittap.app.data.dao.HabitDao
import com.habittap.app.data.database.HabitDatabase
import com.habittap.app.data.repository.HabitRepository
import com.habittap.app.data.repository.HabitRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): HabitDatabase {
        // Dùng chung 1 instance với widget để Flow của app nhận được thay đổi từ widget ngay lập tức
        return HabitDatabase.getInstance(context)
    }

    @Provides
    fun provideHabitDao(database: HabitDatabase): HabitDao {
        return database.habitDao()
    }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindHabitRepository(impl: HabitRepositoryImpl): HabitRepository
}
