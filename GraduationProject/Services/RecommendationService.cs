using GraduationProject.models;
using Polly.Retry;
using Polly;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using GraduationProject.Dto;
using Microsoft.Extensions.Logging;

namespace GraduationProject.Services
{
    public class RecommendationService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RecommendationService> _logger;
        private readonly ResiliencePipeline<HttpResponseMessage> _retryPolicy;
        private readonly JsonSerializerOptions _jsonOptions;
        private const int MAX_RETRIES = 3;
        private const string RECOMMENDATION_ENDPOINT = "http://localhost:8000/recommend";

        public RecommendationService(HttpClient httpClient, ILogger<RecommendationService> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                WriteIndented = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                Converters = { new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower) }
            };

            var retryOptions = new RetryStrategyOptions<HttpResponseMessage>
            {
                ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
                    .Handle<HttpRequestException>()
                    .Handle<TimeoutException>(),
                MaxRetryAttempts = MAX_RETRIES,
                Delay = TimeSpan.FromSeconds(1),
                BackoffType = DelayBackoffType.Exponential,
                OnRetry = args =>
                {
                    _logger.LogWarning(
                        "Retry attempt {RetryCount} of {MaxRetries} after {Delay}ms",
                        args.AttemptNumber,
                        MAX_RETRIES,
                        args.RetryDelay.TotalMilliseconds
                    );
                    return ValueTask.CompletedTask;
                }
            };

            _retryPolicy = new ResiliencePipelineBuilder<HttpResponseMessage>()
                .AddRetry(retryOptions)
                .Build();
        }

        public async Task<ApiResponse<IEnumerable<RecommendationResult>>> GetRecommendationsAsync(User user, int topN = 10)
        {
            var requestId = Guid.NewGuid().ToString();
            var timestamp = DateTime.UtcNow;
            string responseContent = null;

            try
            {
                _logger.LogInformation(
                    "Starting recommendation request {RequestId} for user {UserId} at {Timestamp}",
                    requestId,
                    user.Id,
                    timestamp.ToString("yyyy-MM-dd HH:mm:ss")
                );

                ValidateUserInput(user, topN);

                var requestData = new RecommendationRequestDto
                {
                    UserId = user.Id,
                    PreferredCategory = user.PreferredCategory?.Trim(),
                    SkillLevel = user.SkillLevel?.Trim(),
                    TopN = topN,
                    RequestId = requestId,
                    Timestamp = timestamp
                };

                var requestJson = JsonSerializer.Serialize(requestData, _jsonOptions);
                _logger.LogInformation(
                    "Request {RequestId} payload for user {UserId}: {Payload}",
                    requestId,
                    user.Id,
                    requestJson
                );

                using var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

                HttpResponseMessage response;
                try
                {
                    response = await _retryPolicy.ExecuteAsync(async (cancellationToken) =>
                    {
                        var result = await _httpClient.PostAsync(RECOMMENDATION_ENDPOINT, content, cancellationToken);
                        _logger.LogInformation(
                            "Request {RequestId}: Service returned status {StatusCode}",
                            requestId,
                            result.StatusCode
                        );
                        return result;
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Request {RequestId}: Failed to communicate with recommendation service for user {UserId}",
                        requestId,
                        user.Id
                    );
                    return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                        ApiStatusCodes.ServiceUnavailable,
                        "Unable to reach recommendation service. Please try again later."
                    );
                }

                responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation(
                    "Request {RequestId} raw response for user {UserId}: {Response}",
                    requestId,
                    user.Id,
                    responseContent
                );

                if (!response.IsSuccessStatusCode)
                {
                    var statusCode = MapHttpStatusToApiStatus(response.StatusCode);
                    _logger.LogError(
                        "Request {RequestId}: Service returned error status {StatusCode} for user {UserId}",
                        requestId,
                        statusCode,
                        user.Id
                    );
                    return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                        statusCode,
                        $"Recommendation service returned an error: {response.ReasonPhrase}"
                    );
                }

                var recommendationResponse = JsonSerializer.Deserialize<RecommendationResponseDto>(
                    responseContent,
                    _jsonOptions
                );

                if (recommendationResponse?.Recommendations == null)
                {
                    _logger.LogError(
                        "Request {RequestId}: Invalid response format from service for user {UserId}",
                        requestId,
                        user.Id
                    );
                    return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                        ApiStatusCodes.InternalServerError,
                        "Invalid response format from recommendation service"
                    );
                }

                if (!recommendationResponse.Recommendations.Any())
                {
                    _logger.LogInformation(
                        "Request {RequestId}: No recommendations found for user {UserId}",
                        requestId,
                        user.Id
                    );
                    return ApiResponse<IEnumerable<RecommendationResult>>.Ok(
                        Enumerable.Empty<RecommendationResult>(),
                        "No recommendations available for your preferences"
                    );
                }

                var validRecommendations = recommendationResponse.Recommendations
                    .Where(r => r.CourseId > 0 && !string.IsNullOrWhiteSpace(r.Name))
                    .ToList();

                if (validRecommendations.Count < recommendationResponse.Recommendations.Count)
                {
                    _logger.LogWarning(
                        "Request {RequestId}: {InvalidCount} invalid recommendations filtered out for user {UserId}",
                        requestId,
                        recommendationResponse.Recommendations.Count - validRecommendations.Count,
                        user.Id
                    );
                }

                _logger.LogInformation(
                    "Request {RequestId}: Retrieved {Count} valid recommendations for user {UserId}",
                    requestId,
                    validRecommendations.Count,
                    user.Id
                );

                return ApiResponse<IEnumerable<RecommendationResult>>.Ok(
                    validRecommendations,
                    $"Successfully retrieved {validRecommendations.Count} recommendations"
                );
            }
            catch (JsonException ex)
            {
                _logger.LogError(
                    ex,
                    "Request {RequestId}: JSON deserialization error for user {UserId}",
                    requestId,
                    user.Id
                );
                return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                    ApiStatusCodes.InternalServerError,
                    "Error processing recommendation response"
                );
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(
                    ex,
                    "Request {RequestId}: Invalid input parameters for user {UserId}",
                    requestId,
                    user.Id
                );
                return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                    ApiStatusCodes.BadRequest,
                    ex.Message
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Request {RequestId}: Unexpected error for user {UserId}",
                    requestId,
                    user.Id
                );
                return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                    ApiStatusCodes.InternalServerError,
                    "An unexpected error occurred while processing your request"
                );
            }
        }

        private void ValidateUserInput(User user, int topN)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(user.PreferredCategory))
                errors.Add("Preferred category is required");

            if (string.IsNullOrWhiteSpace(user.SkillLevel))
                errors.Add("Skill level is required");

            if (topN <= 0 || topN > 100)
                errors.Add("TopN must be between 1 and 100");

            if (errors.Any())
                throw new ArgumentException(string.Join(", ", errors));
        }

        private static ApiStatusCodes MapHttpStatusToApiStatus(HttpStatusCode httpStatus)
        {
            return httpStatus switch
            {
                HttpStatusCode.OK => ApiStatusCodes.Success,
                HttpStatusCode.Created => ApiStatusCodes.Created,
                HttpStatusCode.NoContent => ApiStatusCodes.NoContent,
                HttpStatusCode.BadRequest => ApiStatusCodes.BadRequest,
                HttpStatusCode.Unauthorized => ApiStatusCodes.Unauthorized,
                HttpStatusCode.Forbidden => ApiStatusCodes.Forbidden,
                HttpStatusCode.NotFound => ApiStatusCodes.NotFound,
                HttpStatusCode.Conflict => ApiStatusCodes.Conflict,
                HttpStatusCode.UnprocessableEntity => ApiStatusCodes.ValidationError,
                HttpStatusCode.ServiceUnavailable => ApiStatusCodes.ServiceUnavailable,
                HttpStatusCode.NotImplemented => ApiStatusCodes.NotImplemented,
                _ => ApiStatusCodes.InternalServerError
            };
        }
    }
}