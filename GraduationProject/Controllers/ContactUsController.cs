using GraduationProject.Dto;
using GraduationProject.models;
using GraduationProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactUsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public ContactUsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        [HttpPost]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> AddContact(ContactUsDto dto)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);

            var contact = new Contactus
            {
                Message = dto.Message,
                UserId = userId,
                email = dto.Email,
                date = DateTime.Now,
            };

            await _unitOfWork.Contactus.AddAsync(contact);
            await _unitOfWork.CompleteAsync();

            return Ok(contact);

        }
        [HttpGet]
        [Authorize("AdminPolicy")]
        public async Task<IActionResult> GetContacts(string sortingorder = "Descending",
            [FromQuery] int? page = 1,
            [FromQuery] int? pageSize = 5)
        {
            string[] includes = { "user" };  

            // Set up the order by expression specifically for 'date'
            Expression<Func<Contactus, object>> orderByExpression = x => x.date;


            var contacts = await _unitOfWork.Contactus.GEtAllasync(orderByExpression, sortingorder,
                includes,skip: (page - 1) * pageSize, take: pageSize
                );

            if (contacts == null || !contacts.Any())
            {
                return NotFound("No contact records found.");
            }
            var result = contacts.Select(c =>
            new
            {c.Id,
            c.email,
            c.UserId,
            c.Message,
            c.date,
            c.user.Name

            });

            return Ok(contacts);
        }
        [HttpDelete]
        [Authorize("AdminPolicy")]
        public async Task<IActionResult> Deletecontact(int id )
        {
            try
            {
                var contact = await _unitOfWork.Contactus.GetByIdAsync(id);
                if (contact == null)
                {
                    return NotFound("contact not found ");
                }
                 _unitOfWork.Contactus.Delete(contact);
                await _unitOfWork.CompleteAsync();
                return Ok("deleted successfully");
            }
            catch (Exception ex)
            {

                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
        [HttpGet("count")]
        [Authorize("AdminPolicy")]
        public async Task<IActionResult> GetAllpayment()
        {
            var count = await _unitOfWork.Contactus.Count();
            if (count == null)
                return NotFound("no payment found");
            return Ok(new {count});
        }
    }
}
