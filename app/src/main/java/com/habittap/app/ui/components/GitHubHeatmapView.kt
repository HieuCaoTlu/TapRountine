package com.habittap.app.ui.components

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
                        if (day.taps > 0) {
                            Text(
                                text = if (day.taps > 9) "9+" else day.taps.toString(),
                                color = Color.White,
                                fontSize = 8.sp,
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
