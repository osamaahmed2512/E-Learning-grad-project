using System.ComponentModel.DataAnnotations;

namespace GraduationProject.models
{
    public class FlashCardDifficultiesAttribute:ValidationAttribute
    {
        private static readonly string[] difficulties = new[]
        {
            "mastered",
            "easy",
            "medium",
            "hard",
            "new"
        };
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            string difficulty = value.ToString().ToLower();

            if (difficulties.Contains(difficulty))
                return ValidationResult.Success;

            return new ValidationResult($"'{difficulty}' is not a valid difficulty. Allowed values are: {string.Join(", ", difficulties)}.");
        }

    }
}
