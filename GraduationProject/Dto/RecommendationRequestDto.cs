using System.Text.Json.Serialization;

namespace GraduationProject.Dto
{
    public class RecommendationRequestDto
    {
        [JsonPropertyName("user_id")]
        public int UserId { get; set; }

        [JsonPropertyName("preferred_category")]
        public string PreferredCategory { get; set; }

        [JsonPropertyName("skill_level")]
        public string SkillLevel { get; set; }

        [JsonPropertyName("top_n")]
        public int TopN { get; set; }

        [JsonPropertyName("request_id")]
        public string RequestId { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; }
    }
}
