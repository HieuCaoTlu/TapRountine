package com.habittap.app.widget

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
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
import com.habittap.app.data.database.HabitDatabase
import com.habittap.app.data.entity.HabitLogEntity
import com.habittap.app.data.entity.HabitType
import java.time.LocalDate

data class GlanceHabitItem(
    val id: Long,
    val title: String,
    val statusText: String,
    val isDone: Boolean
)

/**
 * HabitTap Modern Android Glance Widget 4x2:
 * Bo tròn mềm mại, mỗi thói quen là 1 ô trong 4 ở cùng 1 dòng ngang.
 * Hiển thị dữ liệu thật từ Room Database và chạy tương tác trực tiếp.
 */
class HabitGlanceWidget : GlanceAppWidget() {

    companion object {
        val HabitIdKey = ActionParameters.Key<Long>("habitId")
    }

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val database = HabitDatabase.getInstance(context)
        val today = LocalDate.now().toString()
        val allHabits = database.habitDao().getAllHabitsList().take(4)

        val items = allHabits.map { habit ->
            val log = database.habitDao().getLog(habit.id, today)
            val count = log?.count ?: 0
            val isDone = when (habit.type) {
                HabitType.ONE_TAP -> (log?.completed == true) || count >= 1
                HabitType.N_TAP -> count >= habit.targetCount
                HabitType.UNLIMITED -> count > 0
            }

            val status = when {
                isDone -> "Xong"
                habit.type == HabitType.ONE_TAP -> "Xong"
                habit.type == HabitType.N_TAP -> "$count/${habit.targetCount}"
                else -> "$count"
            }

            GlanceHabitItem(
                id = habit.id,
                title = habit.title,
                statusText = status,
                isDone = isDone
            )
        }

        provideContent {
            HabitGlanceContent(items)
        }
    }
}

@Composable
fun HabitGlanceContent(items: List<GlanceHabitItem>) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color(0xFF171717)))
            .padding(12.dp)
    ) {
        // Widget Header 4x2
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "HabitTap (4x2)",
                style = TextStyle(
                    color = ColorProvider(Color.White),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = "${LocalDate.now().dayOfMonth}/${LocalDate.now().monthValue}",
                style = TextStyle(
                    color = ColorProvider(Color(0xFFA3A3A3)),
                    fontSize = 10.sp
                )
            )
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        // Dòng 4 ô thói quen trong cùng 1 hàng ngang (4 slots per row)
        if (items.isEmpty()) {
            Box(
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .background(ColorProvider(Color(0xFF262626))),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Chưa có thói quen. Mở app để tạo!",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFFA3A3A3)),
                        fontSize = 11.sp
                    )
                )
            }
        } else {
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                items.forEachIndexed { index, item ->
                    if (index > 0) {
                        Spacer(modifier = GlanceModifier.width(6.dp))
                    }
                    HabitGlanceSlot(
                        title = item.title,
                        statusText = item.statusText,
                        isDone = item.isDone,
                        habitId = item.id
                    )
                }
            }
        }
    }
}

@Composable
fun RowScope.HabitGlanceSlot(
    title: String,
    statusText: String,
    isDone: Boolean,
    habitId: Long
) {
    val bgColor = if (isDone) Color(0xFF262626) else Color(0xFF202020)
    val textColor = if (isDone) Color(0xFFE5E5E5) else Color.White

    Column(
        modifier = GlanceModifier
            .defaultWeight()
            .height(72.dp)
            .background(ColorProvider(bgColor))
            .padding(6.dp)
            .clickable(
                actionRunCallback<TapHabitActionCallback>(
                    actionParametersOf(HabitGlanceWidget.HabitIdKey to habitId)
                )
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            style = TextStyle(
                color = ColorProvider(textColor),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            ),
            maxLines = 1
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = if (isDone) "✓ $statusText" else statusText,
            style = TextStyle(
                color = ColorProvider(if (isDone) Color(0xFF10B981) else Color(0xFFA3A3A3)),
                fontSize = 9.sp,
                fontWeight = FontWeight.Medium
            )
        )
    }
}

class TapHabitActionCallback : ActionCallback {
    override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
        val habitId = parameters[HabitGlanceWidget.HabitIdKey] ?: return
        val database = HabitDatabase.getInstance(context)
        val habit = database.habitDao().getHabitById(habitId) ?: return
        val today = LocalDate.now().toString()
        val existingLog = database.habitDao().getLog(habitId, today)
        val currentCount = existingLog?.count ?: 0
        val wasCompleted = existingLog?.completed ?: false

        val newCount = when (habit.type) {
            HabitType.ONE_TAP -> if (wasCompleted || currentCount >= 1) 0 else 1
            HabitType.N_TAP -> currentCount + 1
            HabitType.UNLIMITED -> currentCount + 1
        }

        val newCompleted = when (habit.type) {
            HabitType.ONE_TAP -> newCount >= 1
            HabitType.N_TAP -> newCount >= habit.targetCount
            HabitType.UNLIMITED -> newCount > 0
        }

        database.habitDao().upsertLog(
            HabitLogEntity(
                id = existingLog?.id ?: 0,
                habitId = habitId,
                date = today,
                count = newCount,
                completed = newCompleted
            )
        )

        // Phản hồi rung CHỈ thực hiện khi bấm tap hoàn thành 1 habit
        if (newCompleted && !wasCompleted) {
            val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(120)
            }
        }

        // Cập nhật widget lại ngay lập tức
        HabitGlanceWidget().update(context, glanceId)
    }
}
