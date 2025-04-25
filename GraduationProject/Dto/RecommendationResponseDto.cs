using GraduationProject.models;
using System.Text.Json.Serialization;

namespace GraduationProject.Dto
{
    public class RecommendationResponseDto
    {
        [JsonPropertyName("recommendations")]
        public List<RecommendationResult> Recommendations { get; set; }
    }
}
