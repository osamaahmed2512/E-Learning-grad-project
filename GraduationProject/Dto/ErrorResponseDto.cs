using System.Text.Json.Serialization;

namespace GraduationProject.Dto
{
    public class ErrorResponseDto
    {
        [JsonPropertyName("detail")]
        public string Detail { get; set; }
    }
}
