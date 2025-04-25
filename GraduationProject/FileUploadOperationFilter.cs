using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace GraduationProject
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var methodInfo = context.MethodInfo;

            // Check if this is a file upload operation
            if (methodInfo.CustomAttributes.Any(attr => attr.AttributeType == typeof(Microsoft.AspNetCore.Mvc.ConsumesAttribute)
                && attr.ConstructorArguments.Any(arg => arg.Value?.ToString() == "multipart/form-data")))
            {
                operation.RequestBody = new OpenApiRequestBody
                {
                    Required = true,
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Required = new HashSet<string> { "file" },
                                Properties = new Dictionary<string, OpenApiSchema>
                                {
                                    ["file"] = new OpenApiSchema
                                    {
                                        Type = "string",
                                        Format = "binary",
                                        Description = "The CSV file to import"
                                    }
                                }
                            }
                        }
                    }
                };
            }
        }
    }
}
