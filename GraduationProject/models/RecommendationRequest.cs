namespace GraduationProject.models
{
    public class RecommendationRequest
    {
        public int UserId { get; set; }
        public string PreferredCategory { get; set; }
        public string SkillLevel { get; set; }
        public int TopN { get; set; }
        public string RequestId { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
