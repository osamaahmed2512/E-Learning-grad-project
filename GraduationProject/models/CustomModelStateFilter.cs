using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace GraduationProject.models
{
    public class CustomModelStateFilter:IActionFilter
    {
  

        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var allErrors = context.ModelState.Values
                                               .SelectMany(v => v.Errors)
                                               .Select(e => e.ErrorMessage)
                                               .ToList();

                context.Result = new BadRequestObjectResult(new { message = allErrors.FirstOrDefault() ?? "Invalid data", status= StatusCodes.Status400BadRequest });

            }

        }
        public void OnActionExecuted(ActionExecutedContext context)
        {
           
        }
    }
}
