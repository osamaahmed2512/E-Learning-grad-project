using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using GraduationProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class RecommendationsController : ControllerBase
    {
        private readonly RecommendationService _recommendationService;
        private readonly AppDBContext _context;
        private readonly ILogger<RecommendationsController> _logger;

        public RecommendationsController(
            RecommendationService recommendationService,
            AppDBContext context,
            ILogger<RecommendationsController> logger)
        {
            _recommendationService = recommendationService;
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous] // Allow both authenticated and unauthenticated users
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<RecommendationResult>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRecommendations()
        {
            try
            {
                User? user = null;

                // Check if user is authenticated
                if (User.Identity?.IsAuthenticated == true)
                {
                    var userIdClaim = User.FindFirst("Id")?.Value;
                    if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
                    {
                        // Get user with their preferences
                        user = await _context.users
                            .AsNoTracking()
                            .FirstOrDefaultAsync(u => u.Id == userId);

                        if (user != null)
                        {
                            // Log user preferences
                            _logger.LogInformation(
                                "Fetching recommendations for authenticated user {UserId}. " +
                                "Category: {Category}, Skill Level: {SkillLevel}",
                                userId,
                                user.PreferredCategory ?? "Not set",
                                user.SkillLevel ?? "Not set"
                            );

                            // Check if preferences are set
                            if (string.IsNullOrWhiteSpace(user.PreferredCategory) ||
                                string.IsNullOrWhiteSpace(user.SkillLevel))
                            {
                                _logger.LogWarning(
                                    "User {UserId} has incomplete preferences. Falling back to unregistered recommendations",
                                    userId
                                );
                                // Make user null to fall back to unregistered recommendations
                                user = null;
                            }
                        }
                        else
                        {
                            _logger.LogWarning("User ID {UserId} not found in database", userId);
                        }
                    }
                }
                else
                {
                    _logger.LogInformation("Fetching recommendations for unauthenticated user");
                }

                // Get recommendations (will be random for unregistered users or users without preferences)
                var response = await _recommendationService.GetRecommendationsAsync(user);

                if (!response.Success)
                {
                    _logger.LogWarning(
                        "Failed to get recommendations. Status: {Status}, Message: {Message}",
                        response.StatusCode,
                        response.Message
                    );
                }
                else
                {
                    _logger.LogInformation(
                        "Successfully retrieved {Count} recommendations for {UserType}",
                        response.Data?.Count() ?? 0,
                        user != null ? $"user {user.Id}" : "unregistered user"
                    );
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error processing recommendation request for {UserType}",
                    User.Identity?.IsAuthenticated == true ? "authenticated user" : "unauthenticated user"
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.Error(
                        ApiStatusCodes.InternalServerError,
                        "An unexpected error occurred while processing your request"
                    )
                );
            }
        }

        
    }
}
