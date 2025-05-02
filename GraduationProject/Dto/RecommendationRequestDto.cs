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
        [JsonPropertyName("is_registered")]
        public bool IsRegistered { get; set; }
    }
}
