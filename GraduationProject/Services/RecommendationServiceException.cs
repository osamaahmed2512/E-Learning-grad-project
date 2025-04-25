using System.Net;

namespace GraduationProject.Services
{
    public class RecommendationServiceException:Exception
    {
        public HttpStatusCode? StatusCode { get; }

        public RecommendationServiceException(string message, Exception innerException = null)
            : base(message, innerException)
        {
        }

        public RecommendationServiceException(string message, HttpStatusCode statusCode)
            : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
