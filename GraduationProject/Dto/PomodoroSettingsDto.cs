namespace GraduationProject.Dto
{
    public class PomodoroSettingsDto
    {
        public int WorkDuration { get; set; } = 25;
        public int ShortBreakDuration { get; set; } = 5;
        public int LongBreakDuration { get; set; } = 20;
        public int? CustomWorkDuration { get; set; }
        public int? CustomBreakDuration { get; set; }
    }
    public class StartPomodoroSessionDto
    {
        public string SessionType { get; set; }
        public int Duration { get; set; }
        public string? Notes { get; set; }
    }
    public class UpdatePomodoroSessionDto
    {
        public int CompletedDuration { get; set; }
        public bool IsCompleted { get; set; }
        public string? Notes { get; set; }
    }

    public class PomodoroStatsDto
    {
        public int TotalSessions { get; set; }
        public int CompletedSessions { get; set; }
        public int TotalMinutes { get; set; }
        public Dictionary<string, int> SessionTypeBreakdown { get; set; }
        public List<DailyStatsDto> DailyStats { get; set; }
    }

    public class DailyStatsDto
    {
        public DateTime Date { get; set; }
        public int TotalSessions { get; set; }
        public int CompletedMinutes { get; set; }
    }
}
