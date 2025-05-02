using GraduationProject.consts;
using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using GraduationProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubscriptionController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IUnitOfWork _unitofwork;
        public SubscriptionController(AppDBContext context,IUnitOfWork unitofwork)
        {
            _context = context; 
            _unitofwork = unitofwork;
        }

        
      
        [HttpGet("GetStudentSubscriptions/{studentId}")]
        public async Task<IActionResult> GetStudentSubscriptions(int studentId)
        {
            var subscriptions = await _context.Subscriptions
                .Where(s => s.StudentId == studentId)
                .Include(s => s.Course)
                .Select(s => new
                {
                    s.Course.Id,
                    s.Course.Name,
                    s.SubscriptionDate,
                    s.Isactive
                })
                .ToListAsync();

            return Ok(subscriptions);
        }

        //// 🔹 Unsubscribe a student from a course
        //[HttpDelete("Unsubscribe/{studentId}/{courseId}")]
        //public async Task<IActionResult> Unsubscribe( int courseId)
        //{
        //    // Extract student ID from token
        //    var studentIdClaim = User.FindFirst("Id")?.Value;
        //    if (string.IsNullOrEmpty(studentIdClaim))
        //    {
        //        return Unauthorized(new { Message = "Invalid token" });
        //    }
        //    int studentId = int.Parse(studentIdClaim);
        //    var subscription = await _context.Subscriptions
        //        .FirstOrDefaultAsync(s => s.StudentId == studentId && s.CourseId == courseId);

        //    if (subscription == null)
        //    {
        //        return NotFound(new { Message = "Subscription not found" });
        //    }

        //    _context.Subscriptions.Remove(subscription);

        //    var course = await _context.courses.FindAsync(courseId);
        //    if (course != null && course.no_of_students > 0)
        //    {
        //        course.no_of_students -= 1;
        //    }
        //    await _context.SaveChangesAsync();

        //    return Ok(new { Message = "Unsubscribed successfully" });
        //}
                // 🔹 Unsubscribe a student from a course
        [HttpDelete("Removesubscribe/{studentId}/{courseId}")]
        [Authorize("AdminPolicy")]
        public async Task<IActionResult> Removesubscribe( int courseId, int studentId)
        {   
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.StudentId == studentId && s.CourseId == courseId);

            if (subscription == null)
            {
                return NotFound(new { Message = "Subscription not found" });
            }

            _context.Subscriptions.Remove(subscription);

            var course = await _context.courses.FindAsync(courseId);
            if (course != null && course.no_of_students > 0)
            {
                course.no_of_students -= 1;
            }
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Unsubscribed successfully" });
        }
        [HttpGet("GetEnrollments")]
        [Authorize(Policy = "InstructorPolicy")]
        public async Task<IActionResult> GetEnrollments([FromQuery] int? latest)
        {
            var instructorId = int.Parse(User.FindFirst("Id")?.Value);

            var query = _context.Subscriptions
                .Include(s => s.Student)
                .Include(s => s.Course)
                .Where(s => s.Course.Instructor_Id == instructorId)
                .OrderByDescending(s => s.SubscriptionDate)
                .Select(s => new
                {
                    StudentName = s.Student.Name,
                    CourseTitle = s.Course.Name,
                    StudentEmail = s.Student.Email,
                    EnrolmentStatus = s.Isactive,
                    s.SubscriptionDate,
                    s.MoneyPaid

                });

            // If 'latest' is provided, take only the specified number of enrollments
            if (latest.HasValue && latest > 0)
            {
                query = query.Take(latest.Value);
            }

            var enrollments = await query.ToListAsync();
            return Ok(enrollments);
        }


        [HttpGet("GetALLEnrollments")]
        [Authorize("InstructorAndAdminPolicy")]
        public async Task<IActionResult> GetAllEnrollments(
                      [FromQuery] string? searchQuery = null,
                      [FromQuery] int page = 1,
                      [FromQuery] int pageSize = 10,
                      [FromQuery] int? latest = null)
        {
            // Define the base criteria (no instructor filter)
            Expression<Func<Subscription, bool>> criteria = s => true; // Fetch all subscriptions

            // Add search functionality if searchQuery is provided
            if (!string.IsNullOrEmpty(searchQuery))
            {
                searchQuery = searchQuery.ToLower();
                criteria = s => s.Student.Name.ToLower().Contains(searchQuery) ||
                                s.Course.Name.ToLower().Contains(searchQuery);
            }

            // Use the repository to query subscriptions
            var subscriptionRepo = new GenaricRepository<Subscription>(_context);

            // Define includes for related entities (Student and Course)
            string[] includes = new string[] { "Student", "Course" };

            // Define ordering by SubscriptionDate (descending)
            Expression<Func<Subscription, object>> orderBy = s => s.SubscriptionDate;

            // Calculate skip and take for pagination
            int skip = (page - 1) * pageSize;
            int take = pageSize;

            // If 'latest' is provided, override pagination and take only the specified number of records
            if (latest.HasValue && latest > 0)
            {
                take = latest.Value;
                skip = 0; // No need for pagination if we're fetching the latest records
            }

            // Fetch the enrollments using the repository's FindAll method
            var enrollments = subscriptionRepo.FindAll(
                criteria: criteria,
                includes: includes,
                orderBy: orderBy,
                orderByDirection: Sorting.Descending,
                skip: skip,
                take: take
            );

            // Get the total count of enrollments for pagination metadata
            int totalRecords = await subscriptionRepo.Count(criteria);
            int totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            // Map the results to the desired response format
            var enrollmentList = enrollments.Select(s => new
            {   s.StudentId,
                s.CourseId,
                StudentName = s.Student.Name,
                CourseTitle = s.Course.Name,
                StudentEmail = s.Student.Email,
                EnrolmentStatus = s.Isactive,
                SubscriptionDate = s.SubscriptionDate,
                MoneyPaid = s.MoneyPaid
            }).ToList();

            // Return the results with pagination metadata
            return Ok(new
            {
                Enrollments = enrollmentList,
                Pagination = new
                {
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalRecords = totalRecords,
                    TotalPages = totalPages
                }
            });
        }


        [HttpPost("countofallenrollement")]
        [Authorize("AdminPolicy")]
        public async Task<IActionResult> GetAllEnrollments()
        {
            return Ok(new {count = await _unitofwork.Subscribtion.Count()});
        }


    }



}
