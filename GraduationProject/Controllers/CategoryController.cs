using GraduationProject.Dto;
using GraduationProject.models;
using GraduationProject.Services;
using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        [HttpGet]
        public async Task<IActionResult> GetCategories([FromQuery] string? name = null,
            [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {

            try
            {
                Expression<Func<Category, bool>>? criteria = null;
                if (!string.IsNullOrEmpty(name))
                {
                    criteria = x => x.Name.ToLower().Contains(name.ToLower());
                }

                var skip = (page - 1) * pageSize;
                var categories = _unitOfWork.category.FindAll(
                    criteria: criteria,
                    orderBy: x => x.CreatonDate,
                    orderByDirection: "DESC",
                    skip: skip,
                    take: pageSize
                );
                var totalCount = await _unitOfWork.category.Count(criteria);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var response = new
                {
                    Categories = categories,
                    Pagination = new
                    {
                        CurrentPage = page,
                        PageSize = pageSize,
                        TotalCount = totalCount,
                        TotalPages = totalPages
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { Message = "An error occurred while retrieving categories" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _unitOfWork.category.GetByIdAsync(id);

            if (category == null)
            {
                return NotFound(new {message= "course not found" ,statuscode = 200} );
            }

            return Ok(category);
        }
        [HttpPost]
        [Authorize(Policy = "AdminPolicy")] 
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDto dto)
        {
            try
            {
                var existingCategory = await _unitOfWork.category
                         .FindOneAsync(x => x.Name.ToLower() == dto.Name.ToLower());

                var useremail = User.FindFirst("Email")?.Value;
                if (existingCategory != null)
                {
                    return BadRequest(new { Message = "A category with this name already exists" });
                }
                var category = new Category() {Name =dto.Name ,
                CreatonDate=DateTime.Now, CreatedBy =useremail
                };
                var createdCategory = await _unitOfWork.category.AddAsync(category);
                 await _unitOfWork.CompleteAsync();

                return CreatedAtAction(
                    nameof(GetCategory),
                    new { id = createdCategory.Id },
                    createdCategory
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while creating the category" });
            }
        }


        [HttpPut("{id}")]
        [Authorize(Policy = "AdminPolicy")] 
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
        {
            try
            {
                var existingCategory = await _unitOfWork.category.GetByIdAsync(id);
                if (existingCategory == null)
                    return NotFound(new { Message = $"Category with ID {id} not found" });
                existingCategory.Name = dto.Name.ToLower();
                var updatedCategory = await _unitOfWork.category.UpdateAsync(id, existingCategory);
                await _unitOfWork.CompleteAsync();
                return Ok(updatedCategory);


            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { Message = "Invalid category data" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Log the exception here
                return StatusCode(500, new { Message = "An error occurred while updating the category" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminPolicy")] 
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category =await _unitOfWork.category.GetByIdAsync(id);

            if (category == null)
            {
                return NotFound(new { message = "category not found" });
            }
             _unitOfWork.category.Delete(category);
           await _unitOfWork.CompleteAsync();

            return NoContent();
        }
    }
}
