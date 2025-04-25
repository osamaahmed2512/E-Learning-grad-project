namespace GraduationProject.models
{
    public class CourseCsvRecord
    {
        public int UserId { get; set; }
        public string PreferredCategory { get; set; }
        public string SkillLevel { get; set; }
        public string LearningGoal { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public string CourseCategory { get; set; }
        public string DifficultyLevel { get; set; }
        public string Keywords { get; set; }
        public int Rating { get; set; }
        public double TimeSpentHours { get; set; }
        public string CompletionStatus { get; set; }
        public int ClickCount { get; set; }
        public string RecommendationType { get; set; }
        public double RecommendationScore { get; set; }
    }
}
