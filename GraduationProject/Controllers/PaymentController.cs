using GraduationProject.data;
using GraduationProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;  
using GraduationProject.models;
using GraduationProject.consts;
namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IStripeService _stripeService;
        private readonly AppDBContext _context;
        private readonly IConfiguration _configuration;

        public PaymentController(
            IStripeService stripeService,
            AppDBContext context,
            IConfiguration configuration)
        {
            _stripeService = stripeService;
            _context = context;
            _configuration = configuration;
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

                var sessionId = await _stripeService.CreateCheckoutSession(courseId, studentId);

                // Get the session details to return the URL
                var sessionService = new SessionService();
                var session = await sessionService.GetAsync(sessionId);

                return Ok(new
                {
                    SessionId = sessionId,
                    CheckoutUrl = session.Url // This will give you the complete Stripe hosted checkout URL
                });   
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }
        #region Old implementation of webhochk
        //stripe listen --forward-to https://localhost:7018/api/Payment/webhook
        //[HttpPost("webhook")]
        //[AllowAnonymous] // Ensure this is present to allow Stripe to access the endpoint
        //public async Task<IActionResult> WebhookHandler()
        //{
        //    var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        //    Console.WriteLine($"Webhook received at {DateTime.UtcNow}: {json}");

        //    try
        //    {
        //        var stripeEvent = EventUtility.ConstructEvent(
        //            json,
        //            Request.Headers["Stripe-Signature"],
        //            _configuration["Stripe:WebhookSecret"]
        //        );
        //        Console.WriteLine($"Stripe event constructed: Type: {stripeEvent.Type}, ID: {stripeEvent.Id}");

        //        if (stripeEvent.Type == "checkout.session.completed")
        //        {
        //            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
        //            Console.WriteLine($"Checkout session completed: Session ID: {session?.Id}");

        //            if (session?.Metadata != null)
        //            {
        //                if (int.TryParse(session.Metadata.GetValueOrDefault("CourseId"), out int courseId) &&
        //                    int.TryParse(session.Metadata.GetValueOrDefault("StudentId"), out int studentId))
        //                {
        //                    Console.WriteLine($"Metadata extracted: CourseId: {courseId}, StudentId: {studentId}");
        //                    decimal moneyPaid = session.AmountTotal.HasValue ? session.AmountTotal.Value / 100m : 0m;
        //                    var subscription = new GraduationProject.models.Subscription
        //                    {
        //                        StudentId = studentId,
        //                        CourseId = courseId,
        //                        SubscriptionDate = DateTime.UtcNow,
        //                        Isactive = true,
        //                        MoneyPaid = moneyPaid,
        //                        PlatformProfit = moneyPaid * 0.2m,  // 20% platform fee
        //                        InstructorProfit = moneyPaid * 0.8m, // 80% instructor fee
        //                        PaymentStatus = PaymentStatus.Success
        //                    };

        //                    _context.Subscriptions.Add(subscription);
        //                    Console.WriteLine("Subscription record created in memory");

        //                    var course = await _context.courses.FindAsync(courseId);
        //                    if (course != null)
        //                    {
        //                        course.no_of_students += 1;
        //                        Console.WriteLine($"Incremented no_of_students for CourseId: {courseId}, New count: {course.no_of_students}");
        //                    }
        //                    else
        //                    {
        //                        Console.WriteLine($"Course not found: CourseId: {courseId}");
        //                        return BadRequest(new { Error = "Course not found" });
        //                    }

        //                    await _context.SaveChangesAsync();
        //                    Console.WriteLine("Database changes saved successfully");
        //                }
        //                else
        //                {
        //                    Console.WriteLine("Failed to parse CourseId or StudentId from metadata");
        //                    return BadRequest(new { Error = "Invalid metadata" });
        //                }
        //            }
        //            else
        //            {
        //                Console.WriteLine("Metadata is null or missing");
        //                return BadRequest(new { Error = "Missing metadata" });
        //            }
        //        }
        //        else
        //        {
        //            Console.WriteLine($"Unhandled event type: {stripeEvent.Type}");
        //        }

        //        return Ok();
        //    }
        //    catch (StripeException e)
        //    {
        //        Console.WriteLine($"StripeException in WebhookHandler: {e.Message}\nStackTrace: {e.StackTrace}");
        //        return BadRequest(new { Error = e.Message });
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Error in WebhookHandler: {ex.Message}\nStackTrace: {ex.StackTrace}");
        //        return StatusCode(500, new { Error = ex.Message });
        //    }
        //} 
        #endregion

        //stripe listen --forward-to https://localhost:7018/api/Payment/webhook

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> WebhookHandler()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _configuration["Stripe:WebhookSecret"]
                );

                switch (stripeEvent.Type)
                {
                    case "checkout.session.completed":
                        var successSession = stripeEvent.Data.Object as Stripe.Checkout.Session;
                        await HandleSuccessfulPayment(successSession);
                        break;

                    case "payment_intent.payment_failed":
                        var failedPaymentIntent = stripeEvent.Data.Object as PaymentIntent;
                        await HandleFailedPayment(failedPaymentIntent);
                        break;

                    case "charge.failed":
                        var failedCharge = stripeEvent.Data.Object as Charge;
                        await HandleFailedCharge(failedCharge);
                        break;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in WebhookHandler: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        private async Task HandleFailedPayment(PaymentIntent paymentIntent)
        {
            if (paymentIntent?.Metadata != null &&
                int.TryParse(paymentIntent.Metadata.GetValueOrDefault("CourseId"), out int courseId) &&
                int.TryParse(paymentIntent.Metadata.GetValueOrDefault("StudentId"), out int studentId))
            {
                var subscription = new GraduationProject.models.Subscription
                {
                    StudentId = studentId,
                    CourseId = courseId,
                    SubscriptionDate = DateTime.UtcNow,
                    Isactive = false,
                    MoneyPaid = paymentIntent.Amount / 100m, // Convert from cents to dollars
                    PlatformProfit = 0,
                    InstructorProfit = 0,
                    PaymentStatus = PaymentStatus.Failed
                };

                _context.Subscriptions.Add(subscription);
                await _context.SaveChangesAsync();

                // Optional: Notify user about failed payment
                // await _emailService.SendPaymentFailedNotification(studentId, courseId);
            }
        }

        private async Task HandleFailedCharge(Charge charge)
        {
            if (charge?.Metadata != null &&
                int.TryParse(charge.Metadata.GetValueOrDefault("CourseId"), out int courseId) &&
                int.TryParse(charge.Metadata.GetValueOrDefault("StudentId"), out int studentId))
            {
                var subscription = new GraduationProject.models.Subscription
                {
                    StudentId = studentId,
                    CourseId = courseId,
                    SubscriptionDate = DateTime.UtcNow,
                    Isactive = false,
                    MoneyPaid = charge.Amount / 100m,
                    PlatformProfit = 0,
                    InstructorProfit = 0,
                    PaymentStatus = PaymentStatus.Failed
                };

                _context.Subscriptions.Add(subscription);
                await _context.SaveChangesAsync();
            }
        }

        private async Task HandleSuccessfulPayment(Session session)
        {
            if (session?.Metadata != null &&
                int.TryParse(session.Metadata.GetValueOrDefault("CourseId"), out int courseId) &&
                int.TryParse(session.Metadata.GetValueOrDefault("StudentId"), out int studentId))
            {
                decimal moneyPaid = session.AmountTotal.HasValue ? session.AmountTotal.Value / 100m : 0m;

                var subscription = new GraduationProject.models.Subscription
                {
                    StudentId = studentId,
                    CourseId = courseId,
                    SubscriptionDate = DateTime.UtcNow,
                    Isactive = true,
                    MoneyPaid = moneyPaid,
                    PlatformProfit = moneyPaid * 0.2m,
                    InstructorProfit = moneyPaid * 0.8m,
                    PaymentStatus = PaymentStatus.Success
                };

                _context.Subscriptions.Add(subscription);

                var course = await _context.courses.FindAsync(courseId);
                if (course != null)
                {
                    course.no_of_students += 1;
                }

                await _context.SaveChangesAsync();
            }
        }

        [HttpGet("payments")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> GetPaymentsList(
        [FromQuery] string? searchQuery,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Subscriptions
                    .Include(s => s.Student)
                    .Include(s => s.Course)
                        .ThenInclude(c => c.Instructor)
                    .AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(searchQuery))
                {
                    searchQuery = searchQuery.ToLower();
                    query = query.Where(s =>
                        s.Student.Name.ToLower().Contains(searchQuery) ||
                        s.Course.Instructor.Name.ToLower().Contains(searchQuery));
                }

                // Filter by status
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(s => s.PaymentStatus == status);
                }

                var totalCount = await query.CountAsync();

                var payments = await query
                    .OrderByDescending(s => s.SubscriptionDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(s => new
                    {
                        StudentName = s.Student.Name,
                        Amount = s.MoneyPaid,
                        PlatformProfit = s.PlatformProfit,
                        EducatorProfit = s.InstructorProfit,
                        EducatorName = s.Course.Instructor.Name,
                        Date = s.SubscriptionDate,
                        Status = s.PaymentStatus,
                        CourseId = s.CourseId,
                        StudentId = s.StudentId
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Items = payments,
                    TotalCount = totalCount,
                    PageCount = (int)Math.Ceiling(totalCount / (double)pageSize),
                    CurrentPage = page,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error retrieving payments", Error = ex.Message });
            }
        }

        //[HttpGet("export")]
        //[Authorize(Policy = "AdminPolicy")]
        //public async Task<IActionResult> ExportPayments()
        //{
        //    try
        //    {
        //        var payments = await _context.Subscriptions
        //            .Include(s => s.Student)
        //            .Include(s => s.Course)
        //                .ThenInclude(c => c.Instructor)
        //            .Select(s => new
        //            {
        //                StudentName = s.Student.Name,
        //                Amount = s.MoneyPaid,
        //                PlatformProfit = s.MoneyPaid * 0.2m,
        //                EducatorProfit = s.MoneyPaid * 0.8m,
        //                EducatorName = s.Course.Instructor.Name,
        //                Date = s.SubscriptionDate,
        //                Status = s.PaymentStatus
        //            })
        //            .ToListAsync();

        //        // Convert to CSV or Excel format
        //        // Return file download
        //        return File(/* your export logic here */);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { Message = "Error exporting payments", Error = ex.Message });
        //    }
        //}
    }
}

