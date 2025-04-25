using Stripe;

namespace GraduationProject.Services
{
    public interface IStripeService
    {
        Task<string> CreateCheckoutSession(int courseId, int studentId);
        Task<PaymentIntent> CreatePaymentIntent(long amount, string currency = "usd");
    }
}
