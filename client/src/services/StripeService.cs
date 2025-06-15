using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;

namespace GraduationProject.Services
{
    public class StripeService : IStripeService
    {
        private readonly IConfiguration _configuration;
        private readonly AppDBContext _context;

        public StripeService(IConfiguration configuration, AppDBContext context)
        {
            _configuration = configuration;
            _context = context;
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        }

        public async Task<(string SessionId, string CheckoutUrl)> CreateCheckoutSession(int courseId, int studentId)
        {
            try
            {
                var course = await _context.courses.FindAsync(courseId);
                if (course == null)
                    throw new Exception("Course not found");

                var clientUrl = _configuration["Stripe:ClientUrl"];
                if (string.IsNullOrEmpty(clientUrl))
                    throw new Exception("Client URL not configured");

                decimal amountToCharge = course.DiscountedPrice > 0 ? (decimal)course.DiscountedPrice : (decimal)course.Price;

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
                                UnitAmount = (long)(amountToCharge * 100), // Convert to cents
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
                    SuccessUrl = $"{clientUrl}/payment/success/{courseId}?session_id={{CHECKOUT_SESSION_ID}}",
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

                if (session == null || string.IsNullOrEmpty(session.Id) || string.IsNullOrEmpty(session.Url))
                    throw new Exception("Failed to create Stripe session");

                return (session.Id, session.Url);
            }
            catch (StripeException ex)
            {
                throw new Exception($"Stripe error: {ex.Message}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating checkout session: {ex.Message}");
            }
        }

        public async Task<PaymentIntent> CreatePaymentIntent(long amount, string currency = "usd")
        {
            try
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
            catch (StripeException ex)
            {
                throw new Exception($"Stripe error: {ex.Message}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating payment intent: {ex.Message}");
            }
        }
    }
}