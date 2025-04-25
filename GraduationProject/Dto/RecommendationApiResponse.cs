using System.Text.Json.Serialization;

namespace GraduationProject.Dto
{
    public class RecommendationApiResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("status_code")]
        public int StatusCode { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("data")]
        public List<RecommendationResult> Data { get; set; }
    }
}
