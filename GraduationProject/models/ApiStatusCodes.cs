namespace GraduationProject.models
{
    public enum ApiStatusCodes
    {
        // Success Codes (2xx)
        Success = 200,
        Created = 201,
        NoContent = 204,

        // Client Error Codes (4xx)
        BadRequest = 400,
        Unauthorized = 401,
        Forbidden = 403,
        NotFound = 404,
        Conflict = 409,
        ValidationError = 422,

        // Server Error Codes (5xx)
        InternalServerError = 500,
        NotImplemented = 501,
        ServiceUnavailable = 503
    }
}
