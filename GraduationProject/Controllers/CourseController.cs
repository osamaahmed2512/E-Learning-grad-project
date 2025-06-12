using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using GraduationProject.Repository;
using GraduationProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Web;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IUnitOfWork _unitOfWork;
        public CourseController(AppDBContext context,IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }
        [HttpGet]
        [Route("GetAllCourses")]

        public async Task<IActionResult> GetAllCourses([FromQuery]CourseQueryParameters parameters)
        {
            ////// Retrieve all courses with their associated tags
            //var courses = await _context.courses
            //    .Include(c => c.CourseTags) // Include the CourseTags
            //    .ThenInclude(ct => ct.Tag)
            //    .Include(x => x.Instructor)
            //    .Include(x =>x.Sections)
            //    .ThenInclude(x =>x.Lessons)
            //    .Select(c => new
            //    {
            //        c.Id,
            //        c.Name,
            //        c.Describtion,
            //        c.CourseCategory,
            //        c.No_of_hours,
            //        c.Instructor_Id,
            //        InstructorName = c.Instructor.Name,

            //        c.no_of_students,
            //        c.CreationDate,
            //        c.LevelOfCourse,
            //        c.ImgUrl,
            //        c.AverageRating,

            //        c.Price,
            //        c.Discount,
            //        c.DiscountedPrice,
            //        Tags = c.CourseTags.Select(ct => new { ct.Tag.Name , ct.Tag.Id
            //        }
            //        ).ToList() ,
            //        Sections = c.Sections.
            //        Select(
            //            s =>new
            //            {
            //                s.Id ,
            //                s.Name ,
            //                lessons = s.Lessons
            //                .Select(
            //                    l => new
            //                    {   l.Id ,
            //                        l.Name ,
            //                        l.Description ,
            //                        l.FileBath,
            //                        l.DurationInHours
            //                    }
            //                    ).ToList(),
            //            }


            //            ).ToList()


            //    })
            //   .ToListAsync();

            var result = await _unitOfWork.Courses.GetAllCoursesAsync(parameters);

            return Ok(result);
        }

        [HttpGet]
        [Route("GetAllCoursesstudent")]

        public async Task<IActionResult> GetAllCourseofsstudent()
        {
             var query = _context.courses
               .Include(c => c.CourseTags).ThenInclude(ct => ct.Tag)
               .Include(c => c.Instructor)
               .Include(c => c.Sections).ThenInclude(s => s.Lessons)
               .AsQueryable();

            var data = await query.Select(c => new Allcoursedto
            {
                Id = c.Id,
                Name = c.Name,
                Describtion = c.Describtion,
                CourseCategory = c.CourseCategory,
                No_of_hours = c.No_of_hours,
                Instructor_Id = c.Instructor_Id,
                InstructorName = c.Instructor.Name,
                No_of_students = c.no_of_students,
                CreationDate = c.CreationDate,
                LevelOfCourse = c.LevelOfCourse,
                ImgUrl = c.ImgUrl,
                AverageRating = c.AverageRating,
                Price = c.Price,
                Discount = c.Discount,
                DiscountedPrice = c.DiscountedPrice,
                Tags = c.CourseTags.Select(ct => new AllTagDto
                {
                    Id = ct.Tag.Id,
                    Name = ct.Tag.Name
                }).ToList(),
                Sections = c.Sections.Select(s => new ALLSectionDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Lessons = s.Lessons.Select(l => new AllLessonDto
                    {
                        Id = l.Id,
                        Name = l.Name,
                        Description = l.Description,
                        FileBath = l.FileBath,
                        DurationInHours = l.DurationInHours
                    }).ToList()
                }).ToList()
            }).ToListAsync();

            return Ok(new { data });
        }

        [HttpGet("GetInstructorCourses")]
        [Authorize(Policy = "InstructorPolicy")]
        public async Task<IActionResult> GetInstructorCourses()
        {
            try
            {
                var instructorId = int.Parse(User.FindFirst("Id")?.Value);

                var courses = await _context.courses
                    .Where(c => c.Instructor_Id == instructorId)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.ImgUrl,
                        NoOfStudents = c.no_of_students,
                        c.CreationDate
                    })
                    .ToListAsync();

                return Ok(courses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching courses", error = ex.Message });
            }
        }

        [HttpGet("GetAllCourseOfInstructor")]
        public async Task<IActionResult> GetAllCourseOfInstructor(int instructorId)
        {
            try
            {
                // Get the instructor ID from the authenticated user's claims
                //var instructorId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == "Id")?.Value);


                // Retrieve all courses for the specified instructor, including their associated tags
                var courses = await _context.courses
                    .Where(c => c.Instructor_Id == instructorId) // Filter by instructor ID
                    .Include(c => c.CourseTags) // Include the CourseTags
                    .ThenInclude(ct => ct.Tag)  // Include the Tag within CourseTags
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Describtion,
                        c.No_of_hours,
                        c.Instructor_Id,
                        c.no_of_students,
                        c.CreationDate,
                        c.LevelOfCourse,
                        c.ImgUrl,
                        Tags = c.CourseTags.Select(ct => ct.Tag.Name).ToList() // Extract tag names
                    })
                    .ToListAsync();

                // If no courses are found, return a 404 Not Found response
                if (courses == null || !courses.Any())
                {
                    return NotFound($"No courses found for instructor with ID {instructorId}.");
                }

                // Return the list of courses with a 200 OK response
                return Ok(courses);
            }
            catch (Exception ex)
            {
                // Log the exception and return a 500 Internal Server Error response
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet("GetInstructorCourseCount")]
        [Authorize(Policy = "InstructorPolicy")]
        public async Task<IActionResult> GetInstructorCourseCount()
        {
            // Get Instructor ID from the JWT token
            var instructorId = int.Parse(User.FindFirst("Id")?.Value);

            // Count courses where Instructor_Id matches
            var totalCourses = await _context.courses
                .Where(c => c.Instructor_Id == instructorId)
                .CountAsync();

            return Ok(new { TotalCourses = totalCourses });
        }

        [HttpPost]
        [Route("AddCourse")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        [ServiceFilter(typeof(CustomModelStateFilter))]
        public async Task<IActionResult> AddCourse([FromForm] CourseDto courseDto)
        {


            // Generate a unique file name
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(courseDto.Image.FileName)}";

            // Define the folder to save the image
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "courseImages");
            // Ensure the directory exists
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);
            // Save the image to the server
            var filePath = Path.Combine(uploadPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await courseDto.Image.CopyToAsync(stream);
            }

            var instructorId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == "Id")?.Value);
            var userRole = User.Claims.FirstOrDefault(c => c.Type == "Role")?.Value;

            if (userRole != "teacher")
                return Unauthorized(new { StatusCode = StatusCodes.Status401Unauthorized, Message = "Only instructors can add courses" });

            // Create a new Course object
            var course = new GraduationProject.models.Course
            {
                Name = courseDto.Name,
                Describtion = courseDto.Describtion,
                CourseCategory = courseDto.CourseCategory.ToLower(),
                Instructor_Id = instructorId,
                ImgUrl = $"/courseImages/{fileName}",
                CourseTags = new List<CourseTag>(),
                LevelOfCourse = courseDto.LevelOfCourse.ToLower(),
                Price = courseDto.Price,
                Discount = courseDto.Discount ?? 0,
                Sections = new List<Section>(),
                CourseUrl= $"http://localhost:5173/course/{HttpUtility.UrlEncode(courseDto.Name)}",
            };

            if (courseDto.Tag != null && courseDto.Tag.Any())
            {
                foreach (var tagName in courseDto.Tag)
                {
                    // Check if the tag already exists
                    var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
                    if (tag == null)
                    {
                        // If not, create a new tag
                        tag = new Tag { Name = tagName };
                        _context.Tags.Add(tag);
                    }

                    // Add the tag to the course
                    course.CourseTags.Add(new CourseTag
                    {
                        Tag = tag
                    });
                }
            }
            // Save the course to the database
            _context.courses.Add(course);
            await _context.SaveChangesAsync();

            return Ok(new { id = course.Id, Message = "Course added successfully", statuscode = StatusCodes.Status200OK });
        }

        [HttpDelete]
        [Route("DeleteCourseById/{id}")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        public async Task<IActionResult> DeleteCourseById(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (!int.TryParse(id.ToString(), out var parsedId))
                {
                    return BadRequest("Invalid ID format. Please provide a valid integer.");
                }

                var course = await _context.courses
                    .Include(c => c.Sections)
                        .ThenInclude(x => x.Lessons)
                    .Include(c => c.CourseTags)
                    .Include(c => c.Subscriptions)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (course == null)
                    return NotFound(new { message = "Course Not Found" });

                // Authorization check
                var userrole = User.Claims.FirstOrDefault(c => c.Type == "Role")?.Value;
                var userid = int.Parse(User.Claims.FirstOrDefault(c => c.Type == "Id")?.Value);
                if (userrole == "teacher" && course.Instructor_Id != userid)
                {
                    return Unauthorized(new { Message = "You are not authorized to delete this course" });
                }
                else if (userrole != "teacher" && userrole != "admin")
                {
                    return Unauthorized(new { Message = "You are not authorized to delete this course" });
                }

                // Delete related entities in the correct order
                if (course.Subscriptions?.Any() == true)
                {
                    _context.Subscriptions.RemoveRange(course.Subscriptions);
                }

                foreach (var section in course.Sections ?? Enumerable.Empty<Section>())
                {
                    if (section.Lessons?.Any() == true)
                    {
                        _context.Lesson.RemoveRange(section.Lessons);
                    }
                }

                if (course.Sections?.Any() == true)
                {
                    _context.Sections.RemoveRange(course.Sections);
                }

                if (course.CourseTags?.Any() == true)
                {
                    _context.CourseTags.RemoveRange(course.CourseTags);
                }

                //// Delete the course image
                //if (!string.IsNullOrEmpty(course.ImgUrl))
                //{
                //    var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", course.ImgUrl.TrimStart('/'));
                //    if (System.IO.File.Exists(imagePath))
                //    {
                //        System.IO.File.Delete(imagePath);
                //    }
                //}

                // Remove the course
                _context.courses.Remove(course);
                await _context.SaveChangesAsync();

                // Commit transaction
                await transaction.CommitAsync();

                return Ok(new { Message = "Course deleted successfully" });
            }
            catch (Exception ex)
            {
                // Rollback transaction
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "An error occurred while deleting the course", Error = ex.Message });
            }
        }
        [HttpGet]
        [Route("GetTotalEnrollments")]
        [Authorize(Policy = "InstructorPolicy")]
        public async Task<IActionResult> GetTotalEnrollments()
        {
            // Extract instructor ID from the JWT token
            var instructorIdClaim = User.FindFirst("Id")?.Value;
            if (string.IsNullOrEmpty(instructorIdClaim))
            {
                return Unauthorized(new { status = StatusCodes.Status403Forbidden, Message = "Invalid token" });
            }

            int instructorId = int.Parse(instructorIdClaim);

            var totalEnrollments = await _context.Subscriptions
                .Where(s => _context.courses.Any(c => c.Id == s.CourseId && c.Instructor_Id == instructorId))
                .CountAsync();

            return Ok(new { statuscode = StatusCodes.Status200OK, TotalEnrollments = totalEnrollments });
        }
        [HttpPut]
        [Route("UpdateCourse/{id}")]
        [Authorize(Policy = "InstructorPolicy")]
        [ServiceFilter(typeof(CustomModelStateFilter))]
        public async Task<IActionResult> UpdateCourse(int id, [FromForm] CourseUpdateDto courseUpdateDto)
        {
            try
            {
                // Fetch the course by ID
                var course = await _context.courses.Include(c => c.CourseTags).FirstOrDefaultAsync(c => c.Id == id);
                if (course == null)
                {
                    return NotFound(new { Message = "Course not found" });
                }

                // Get the current user's ID and role from the token
                var userId = int.Parse(User.FindFirst("Id")?.Value);
                var userRole = User.FindFirst("Role")?.Value;

                // Ensure the user is authorized to update the course
                if (userRole == "teacher" && course.Instructor_Id != userId)
                {
                    return Unauthorized(new { Message = "You can only update your own courses" });
                }

                // Update course properties
                course.Name = courseUpdateDto.Name;
                course.CourseCategory = courseUpdateDto.CourseCategory.ToLower();
                course.Describtion = courseUpdateDto.Describtion;
                course.LevelOfCourse = courseUpdateDto.LevelOfCourse.ToLower();
                course.Price = courseUpdateDto.Price;
                course.Discount = courseUpdateDto.Discount ?? 0;

                // Handle image upload if provided
                if (courseUpdateDto.Image != null)
                {
                    //// Delete the old image
                    //if (!string.IsNullOrEmpty(course.ImgUrl))
                    //{
                    //    var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", course.ImgUrl.TrimStart('/'));
                    //    if (System.IO.File.Exists(oldImagePath))
                    //    {
                    //        System.IO.File.Delete(oldImagePath);
                    //    }
                    //}

                    // Save the new image
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(courseUpdateDto.Image.FileName)}";
                    var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "courseImages");
                    if (!Directory.Exists(uploadPath))
                    {
                        Directory.CreateDirectory(uploadPath);
                    }
                    var filePath = Path.Combine(uploadPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await courseUpdateDto.Image.CopyToAsync(stream);
                    }
                    course.ImgUrl = $"/courseImages/{fileName}";
                }


                // Save changes to the database
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Course updated successfully", CourseId = course.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while updating the course", Error = ex.Message });
            }
        }
        [HttpGet]
        [Route("courseCount")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> Getallcountofcourses()
        {
            var count = await _unitOfWork.Courses.Count();

            return Ok(new { count });
        }

        [HttpGet]
        [Route("GetCourseById/{id}")]
        //[Authorize("InstructorAndAdminPolicy")]
        public async Task<IActionResult> GetCourseById(int id)
        {
            // Retrieve the course by its ID with related data
            var course = await _context.courses
                .Include(c => c.Instructor)
                .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                
                .Include(c => c.Rating)
                .Include(c => c.CourseTags)
                .ThenInclude(ct => ct.Tag)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
                return NotFound(new { Message = "Course not found" });

            // Map to a detailed DTO for the response
            var courseDto = new
            {
                course.Id,
                course.Name,
                course.Describtion,
                course.CourseCategory,
                course.No_of_hours,
                course.Instructor_Id,
                InstructorName = course.Instructor?.Name,
                course.no_of_students,
                course.CreationDate,
                course.LevelOfCourse,
                course.ImgUrl,
                course.AverageRating,
                course.Price,
                course.Discount,
                course.DiscountedPrice,
                Tags = course.CourseTags?.Select(ct => new { ct.Tag.Name, ct.Tag.Id }).ToList(),
                Sections = course.Sections?.Select(s => new
                {
                    s.Id,
                    s.Name,
                    Lessons = s.Lessons?.Select(l => new
                    {
                        l.Id,
                        l.Name,
                        l.Description,
                        l.FileBath, // Note: "FileBath" might be a typo; should it be "FilePath"?
                        l.DurationInHours,
                        l.IsPreview
                    }).ToList()
                }).ToList()
            };

            return Ok(courseDto);
        }

        [HttpGet]
        [Route("GetCourseByIdForStudent/{id}")]

        public async Task<IActionResult> GetCourseByIdForStudent(int id)
        {

            var studentIdClaim = User.FindFirst("id")?.Value;
            int? studentId = null;
            if (!string.IsNullOrEmpty(studentIdClaim))
            {
                studentId = int.Parse(studentIdClaim);
            }

            var course = await _context.courses
                .Include(c => c.Instructor)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                .Include(c => c.Rating)
                .Include(c => c.CourseTags)
                    .ThenInclude(ct => ct.Tag)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
                return NotFound(new { Message = "Course not found" });

            // Check if user is subscribed to this course
            bool isSubscribed = false;
            if (studentId.HasValue)
            {
                isSubscribed = await _context.Subscriptions
                    .AnyAsync(s => s.StudentId == studentId && s.CourseId == id && s.Isactive);
            }

            var courseDto = new
            {
                course.Id,
                course.Name,
                course.Describtion,
                course.CourseCategory,
                course.No_of_hours,
                course.Instructor_Id,
                InstructorName = course.Instructor?.Name,
                course.no_of_students,
                course.CreationDate,
                course.LevelOfCourse,
                course.ImgUrl,
                course.AverageRating,
                course.Price,
                course.Discount,
                course.DiscountedPrice,
                IsSubscribed = isSubscribed,
                Tags = course.CourseTags?.Select(ct => new { ct.Tag.Name, ct.Tag.Id }).ToList(),
                Sections = course.Sections?.Select(s => new
                {
                    s.Id,
                    s.Name,
                    Lessons = s.Lessons?.Select(l => new
                    {
                        l.Id,
                        l.Name,
                        l.Description,
                        l.FileBath,
                        l.DurationInHours,
                        l.IsPreview,
                        IsAccessible = isSubscribed || l.IsPreview // Only accessible if subscribed or preview
                    }).ToList()
                }).ToList()
            };

            return Ok(courseDto);
        }

        [HttpPost]
        [Route("IncreaseCourseRating/{id}")]
        [Authorize("StudentPolicy")]
        public async Task<IActionResult> IncreaseCourseRating(int id)
        {
            try
            {
                // Get the current user's ID from the token
                var userIdClaim = User.FindFirst("Id");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "Invalid user ID in token" });
                }

                // Verify the course exists
                var course = await _context.courses.FirstOrDefaultAsync(c => c.Id == id);
                if (course == null)
                {
                    return NotFound(new { Message = "Course not found" });
                }

                // Find or create rating record for this user and course
                var rating = await _context.Rating
                    .FirstOrDefaultAsync(r => r.StudentId == userId && r.CourseId == course.Id);

                if (rating == null)
                {
                    // Create new rating record if it doesn't exist
                    rating = new Rating
                    {
                        StudentId = userId,
                        CourseId = course.Id,
                        ClickCount = 1,
                        TimeSpentHours = 0,
                        RatingDate = DateTime.UtcNow
                    };
                    _context.Rating.Add(rating);
                }
                else
                {
                    // Increment click count for existing rating
                    rating.ClickCount++;
                }

                await _context.SaveChangesAsync();

                return Ok(new { Message = "Rating updated successfully", ClickCount = rating.ClickCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while updating the rating", Error = ex.Message });
            }
        }
        [HttpGet("getTotalEarningsOfStudent")]
        [Authorize(Policy = "TeacherPolicy")]
        public async Task<IActionResult> getEarning()
        {
            try
            { var UserIdCaim = User.FindFirst("Id");
                if(UserIdCaim == null)
                {
                    return Unauthorized("User Id Is not found in the claim");
                }
                int userclaim = int.Parse(UserIdCaim.Value);


                var earning =await _unitOfWork.Subscribtion.FindAllAsync(s => s.Course.Instructor_Id == userclaim, new[] { "Course" });
                decimal totalEarnings = earning.Sum(s =>s.InstructorProfit);
                return Ok(new {ToTalEarning = totalEarnings });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while calculating earnings.");
            }

        }


    }
}
