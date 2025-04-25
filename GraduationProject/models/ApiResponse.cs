namespace GraduationProject.models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public ApiStatusCodes StatusCode { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }

        public ApiResponse(bool success, ApiStatusCodes statusCode, string message, T data = default)
        {
            Success = success;
            StatusCode = statusCode;
            Message = message;
            Data = data;
        }

        public static ApiResponse<T> Ok(T data, string message = "Operation completed successfully")
        {
            return new ApiResponse<T>(true, ApiStatusCodes.Success, message, data);
        }

        public static ApiResponse<T> Error(ApiStatusCodes statusCode, string message)
        {
            return new ApiResponse<T>(false, statusCode, message);
        }
    }
}
