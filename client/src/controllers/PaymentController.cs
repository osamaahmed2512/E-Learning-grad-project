using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly StripeService _stripeService;

        public PaymentController(ApplicationDbContext context, StripeService stripeService)
        {
            _context = context;
            _stripeService = stripeService;
        }

        [HttpPost("create-checkout-session")]
        [Authorize(Policy = "StudentPolicy")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] int courseId)
        {
            try
            {
                var studentIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(studentIdClaim))
                    return Unauthorized(new { Message = "Invalid token" });

                int studentId = int.Parse(studentIdClaim);

                // Check if already subscribed
                var existingSubscription = await _context.Subscriptions
                    .FirstOrDefaultAsync(s => s.StudentId == studentId && s.CourseId == courseId);

                if (existingSubscription != null)
                    return BadRequest(new { Message = "Already subscribed to this course" });

                var (sessionId, checkoutUrl) = await _stripeService.CreateCheckoutSession(courseId, studentId);

                return Ok(new
                {
                    SessionId = sessionId,
                    CheckoutUrl = checkoutUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
}