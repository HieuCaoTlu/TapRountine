package com.habittap.app.widget

import android.content.Context
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.graphics.Color

/**
 * HabitTap Modern Android Glance Widget 4x2:
 * Bo tròn mềm mại, mỗi thói quen là 1 ô trong 4 ở cùng 1 dòng ngang.
 * Chạm trực tiếp vào ô thói quen để tab tức thì ngay từ màn hình chính.
 */
class HabitGlanceWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            HabitGlanceContent()
        }
    }
}

@Composable
fun HabitGlanceContent() {
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
                text = "Hôm nay",
                style = TextStyle(
                    color = ColorProvider(Color(0xFFA3A3A3)),
                    fontSize = 10.sp
                )
            )
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        // Dòng 4 ô thói quen trong cùng 1 hàng ngang (4 slots per row)
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            HabitGlanceSlot(title = "Nước", count = "3/8", isDone = false, habitId = 1L)
            Spacer(modifier = GlanceModifier.width(6.dp))
            HabitGlanceSlot(title = "Sách", count = "Xong", isDone = true, habitId = 2L)
            Spacer(modifier = GlanceModifier.width(6.dp))
            HabitGlanceSlot(title = "Gym", count = "Tab", isDone = false, habitId = 3L)
            Spacer(modifier = GlanceModifier.width(6.dp))
            HabitGlanceSlot(title = "Ngủ", count = "Tab", isDone = false, habitId = 4L)
        }
    }
}

@Composable
fun RowScope.HabitGlanceSlot(
    title: String,
    count: String,
    isDone: Boolean,
    habitId: Long
) {
    val habitParamKey = ActionParameters.Key<Long>("habitId")
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
                    actionParametersOf(habitParamKey to habitId)
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
            )
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = if (isDone) "✓ $count" else "+ $count",
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
        // Tương tác cập nhật trạng thái thói quen và re-render widget
    }
}
