using GraduationProject.data;
using Stripe.Checkout;
using Stripe;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Services
{
    public class StripeService: IStripeService
    {
        private readonly IConfiguration _configuration;
        private readonly AppDBContext _context;
  
        public StripeService(IConfiguration configuration, AppDBContext context)
        {
            _configuration = configuration;
            _context = context;
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        }

        public async Task<string> CreateCheckoutSession(int courseId, int studentId)
        {
            var course = await _context.courses.FindAsync(courseId);
            if (course == null)
                throw new Exception("Course not found");

            var clientUrl = _configuration["Stripe:ClientUrl"];
            decimal amountToCharge = course.DiscountedPrice > 0 ?(decimal) course.DiscountedPrice :(decimal) course.Price;
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
        {
            new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = (long)(amountToCharge* 100), // Convert to cents
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = course.Name,
                        Description = course.Describtion,
                    },
                },
                Quantity = 1,
            },
        },
                Mode = "payment",
                SuccessUrl = $"{clientUrl}/payment/success?courseId={courseId}&studentId={studentId}",
                CancelUrl = $"{clientUrl}/payment/cancel",
                CustomerEmail = await _context.users
                    .Where(u => u.Id == studentId)
                    .Select(u => u.Email)
                    .FirstOrDefaultAsync(),
                Metadata = new Dictionary<string, string>
        {
            { "CourseId", courseId.ToString() },
            { "StudentId", studentId.ToString() }
        }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            // Return both the session ID and the URL
            return session.Id;
        }

        public async Task<PaymentIntent> CreatePaymentIntent(long amount, string currency = "usd")
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = amount,
                Currency = currency,
                PaymentMethodTypes = new List<string> { "card" },
            };

            var service = new PaymentIntentService();
            return await service.CreateAsync(options);
        }
    }
}
