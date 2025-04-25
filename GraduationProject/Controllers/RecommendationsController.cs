using GraduationProject.data;
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
    [Authorize("StudentPolicy")]
    [Produces("application/json")]
    public class RecommendationsController : ControllerBase
    {
        private readonly RecommendationService _recommendationService;
        private readonly AppDBContext _context;
        private readonly ILogger<RecommendationsController> _logger;
        public RecommendationsController(RecommendationService recommendationService, AppDBContext context, ILogger<RecommendationsController> logger)
        {
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
       
        

        [HttpPost]
        public async Task<IActionResult> GetRecommendations()
        {
            try
            {
                var userIdClaim = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(
                        ApiResponse<object>.Error(
                            ApiStatusCodes.Unauthorized,
                            "Invalid token: User ID not found."
                        )
                    );
                }

                var user = await _context.users
                    .AsNoTracking()
                    .Where(u => u.Id == userId)
                    .Select(u => new User
                    {
                        Id = u.Id,
                        PreferredCategory = u.PreferredCategory,
                        SkillLevel = u.SkillLevel
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(
                        ApiResponse<object>.Error(
                            ApiStatusCodes.NotFound,
                            "User not found."
                        )
                    );
                }

                const int topN = 10;
                var recommendationResponse = await _recommendationService.GetRecommendationsAsync(user, topN);

                return recommendationResponse.Success
                    ? Ok(recommendationResponse)
                    : StatusCode(
                        (int)recommendationResponse.StatusCode,
                        recommendationResponse
                    );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recommendation request: {Message}", ex.Message);
                return StatusCode(
                    (int)ApiStatusCodes.InternalServerError,
                    ApiResponse<object>.Error(
                        ApiStatusCodes.InternalServerError,
                        "An error occurred while processing your request: " + ex.Message
                    )
                );
            }
        }
    }
}
