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
        private const string RECOMMENDATION_ENDPOINT = "http://localhost:8006/recommend";

        public RecommendationService(HttpClient httpClient, ILogger<RecommendationService> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
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

        public async Task<ApiResponse<IEnumerable<RecommendationResult>>> GetRecommendationsAsync(User? user, int topN = 20)
        {
            try
            {
                if (topN <= 0 || topN > 100)
                {
                    return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                        ApiStatusCodes.BadRequest,
                        "TopN must be between 1 and 100"
                    );
                }

                var requestData = new RecommendationRequestDto
                {
                    IsRegistered = user != null,
                    TopN = topN
                };

                if (user != null)
                {
                    // Only validate user data if they are registered
                    if (string.IsNullOrWhiteSpace(user.PreferredCategory) ||
                        string.IsNullOrWhiteSpace(user.SkillLevel))
                    {
                        return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                            ApiStatusCodes.BadRequest,
                            "Registered users must have preferred category and skill level set"
                        );
                    }

                    requestData.UserId = user.Id;
                    requestData.PreferredCategory = user.PreferredCategory.Trim();
                    requestData.SkillLevel = user.SkillLevel.Trim();
                }

                var requestJson = JsonSerializer.Serialize(requestData, _jsonOptions);
                _logger.LogInformation(
                    "Sending recommendation request for {UserType}: {Request}",
                    user != null ? $"user {user.Id}" : "unregistered user",
                    requestJson
                );

                using var content = new StringContent(
                    requestJson,
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _retryPolicy.ExecuteAsync(async (cancellationToken) =>
                {
                    return await _httpClient.PostAsync(RECOMMENDATION_ENDPOINT, content, cancellationToken);
                });

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation(
                    "Received response for {UserType}: {Response}",
                    user != null ? $"user {user.Id}" : "unregistered user",
                    responseContent
                );

                if (!response.IsSuccessStatusCode)
                {
                    var statusCode = MapHttpStatusToApiStatus(response.StatusCode);
                    return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                        statusCode,
                        $"Recommendation service returned error: {response.ReasonPhrase}"
                    );
                }

                var recommendationResponse = JsonSerializer.Deserialize<RecommendationResponseDto>(responseContent, _jsonOptions);

                if (recommendationResponse?.Recommendations == null || !recommendationResponse.Recommendations.Any())
                {
                    return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                        ApiStatusCodes.NoContent,
                        "No recommendations available"
                    );
                }

                return ApiResponse<IEnumerable<RecommendationResult>>.Ok(
                    recommendationResponse.Recommendations,
                    $"Successfully retrieved {recommendationResponse.Recommendations.Count()} recommendations"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error getting recommendations for {UserType}",
                    user != null ? $"user {user.Id}" : "unregistered user"
                );
                return ApiResponse<IEnumerable<RecommendationResult>>.Error(
                    ApiStatusCodes.InternalServerError,
                    "An error occurred while processing the recommendation request"
                );
            }
        }

        private static ApiStatusCodes MapHttpStatusToApiStatus(HttpStatusCode httpStatus) =>
            httpStatus switch
            {
                HttpStatusCode.OK => ApiStatusCodes.Success,
                HttpStatusCode.NoContent => ApiStatusCodes.NoContent,
                HttpStatusCode.BadRequest => ApiStatusCodes.BadRequest,
                HttpStatusCode.NotFound => ApiStatusCodes.NotFound,
                HttpStatusCode.ServiceUnavailable => ApiStatusCodes.ServiceUnavailable,
                _ => ApiStatusCodes.InternalServerError
            };
    }
}