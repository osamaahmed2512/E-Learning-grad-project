using GraduationProject.Services;
using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Helpers.Attribute
{
    public class UniqueEmailAttribute:ValidationAttribute
    {   

        protected override  ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var unitOfWork = (IUnitOfWork)validationContext.GetService(typeof(IUnitOfWork))!;
            string email = value?.ToString();

            if (email == null)
            {
                return new ValidationResult("Email is required");
            }
            var ExistingUser = unitOfWork.Users.FindOneAsync(u =>u.Email==email).GetAwaiter().GetResult();
            if (ExistingUser !=null)
            {
                return new ValidationResult("Email is already in use");
            }
            return ValidationResult.Success;
        }
    }
}
