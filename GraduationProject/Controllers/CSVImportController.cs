using CsvHelper.Configuration;
using GraduationProject.data;
using GraduationProject.models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using CsvHelper;


namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CSVImportController : ControllerBase
    {
        private readonly AppDBContext _context;
        public CSVImportController(AppDBContext context)
        {
            _context = context;
        }


        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportCSV(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("CSV file is missing or empty.");

                // Create default instructor if not exists
                var defaultInstructor = await CreateOrGetDefaultInstructor();

                using var streamReader = new StreamReader(file.OpenReadStream());
                var config = new CsvConfiguration(CultureInfo.InvariantCulture);
                using var csv = new CsvHelper.CsvReader(streamReader, config);

                var records = csv.GetRecords<CourseCsvRecord>().ToList();

                foreach (var record in records)
                {
                    // A) Handle the User - Using Email as unique identifier instead of Id
                    var userEmail = $"user{record.UserId}@test.com";
                    var user = await _context.users.FirstOrDefaultAsync(u => u.Email == userEmail);

                    if (user == null)
                    {
                        user = new User
                        {
                            Name = $"User {record.UserId}",
                            Role = "student",
                            PreferredCategory = record.PreferredCategory,
                            SkillLevel = record.SkillLevel,
                            Email = userEmail,
                            Password = "DefaultPassword", // In production, use proper password hashing
                            IsApproved = true // Set default value
                        };
                        _context.users.Add(user);
                        await _context.SaveChangesAsync();
                    }
                    else
                    {
                        user.PreferredCategory = record.PreferredCategory;
                        user.SkillLevel = record.SkillLevel;
                        _context.users.Update(user);
                        await _context.SaveChangesAsync();
                    }

                    // B) Handle the Course - Using Name as unique identifier
                    var course = await _context.courses
                        .FirstOrDefaultAsync(c => c.Name == record.CourseTitle);

                    if (course == null)
                    {
                        course = new Course
                        {
                            Name = record.CourseTitle,
                            CourseCategory = record.CourseCategory,
                            LevelOfCourse = record.DifficultyLevel,
                            Describtion = $"Imported from CSV (User {record.UserId})",
                            Instructor_Id = defaultInstructor.Id
                        };
                        _context.courses.Add(course);
                        await _context.SaveChangesAsync();
                    }

                    // C) Handle the Rating
                    var rating = await _context.Rating
                        .FirstOrDefaultAsync(r => r.StudentId == user.Id && r.CourseId == course.Id);

                    if (rating == null)
                    {
                        rating = new Rating
                        {
                            StudentId = user.Id,
                            CourseId = course.Id,
                            Stars = record.Rating,
                            TimeSpentHours = record.TimeSpentHours,
                            CompletionStatus = record.CompletionStatus,
                            ClickCount = record.ClickCount
                        };
                        _context.Rating.Add(rating);
                    }
                    else
                    {
                        rating.Stars = record.Rating;
                        rating.TimeSpentHours = record.TimeSpentHours;
                        rating.CompletionStatus = record.CompletionStatus;
                        rating.ClickCount = record.ClickCount;
                        _context.Rating.Update(rating);
                    }

                    // D) Handle the Tags (Keywords)
                    if (!string.IsNullOrEmpty(record.Keywords))
                    {
                        var splitKeywords = record.Keywords
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(k => k.Trim())
                            .Distinct()
                            .ToList();

                        foreach (var keyword in splitKeywords)
                        {
                            var tagEntity = await _context.Tags
                                .FirstOrDefaultAsync(t => t.Name == keyword);

                            if (tagEntity == null)
                            {
                                tagEntity = new Tag { Name = keyword };
                                _context.Tags.Add(tagEntity);
                                await _context.SaveChangesAsync();
                            }

                            var courseTagExists = await _context.CourseTags
                                .AnyAsync(ct => ct.CourseId == course.Id && ct.TagId == tagEntity.Id);

                            if (!courseTagExists)
                            {
                                var courseTag = new CourseTag
                                {
                                    CourseId = course.Id,
                                    TagId = tagEntity.Id
                                };
                                _context.CourseTags.Add(courseTag);
                            }
                        }
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok("CSV data imported successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error importing CSV: {ex.Message}");
            }
        }

        private async Task<User> CreateOrGetDefaultInstructor()
        {
            var defaultInstructor = await _context.users
                .FirstOrDefaultAsync(u => u.Email == "default.instructor@example.com" && u.Role == "teacher");

            if (defaultInstructor == null)
            {
                defaultInstructor = new User
                {
                    Name = "Default Instructor",
                    Role = "teacher",
                    Email = "default.instructor@example.com",
                    Password = "DefaultPassword", // In production, use proper password hashing
                    PreferredCategory = "General",
                    SkillLevel = "Expert",
                    IsApproved = true
                };
                _context.users.Add(defaultInstructor);
                await _context.SaveChangesAsync();
            }

            return defaultInstructor;
        }
    }
}



