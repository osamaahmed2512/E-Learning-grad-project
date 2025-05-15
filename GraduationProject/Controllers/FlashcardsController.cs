using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.exception;
using GraduationProject.models;
using GraduationProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System;
using System.Globalization;
using System.Security.Claims;

namespace GraduationProject.Controllers
{
    [Authorize("StudentPolicy")]
    [Route("api/[controller]")]
    [ApiController]
    public class FlashcardsController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IGenaricRepository<FlashCard> _flashcardRepository;
       
        private  DateTime CurrentDateTime = DateTime.UtcNow; // Updated current time

        public FlashcardsController(AppDBContext context , IGenaricRepository<FlashCard> flashcardRepository)
        {
            _context = context;
            _flashcardRepository = flashcardRepository;
        }
        [Authorize("StudentPolicy")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFlashCard(int id)
        {
            var flashcard = await _flashcardRepository.GetByIdAsync(id);

            if (flashcard == null)
            {
                return NotFound("flash card is not found");
            }

           return Ok(flashcard);
        }

        [HttpGet("GetUserFlashCards")]
        public async Task<IActionResult> GetUserFlashCards()
        {
            var userId = GetCurrentUserId();
            var flashcards = await _flashcardRepository.FindAllAsync(f =>f.UserId == userId);
            if (flashcards == null)
            {
                return NotFound("user has no flashcards");
            }
            return Ok(flashcards);
        }

        [HttpGet("category/{difficulty}")]
        public async Task<IActionResult> GetFlashCardsByDifficulty(string difficulty)
        {
            var userId = GetCurrentUserId();

            var flashcards = await _flashcardRepository.FindAllAsync(f => f.UserId == userId && f.Difficulty == difficulty);
            
            if (flashcards == null)
            {
                return NotFound("flashcards not fund");
            }

            return Ok(flashcards);
        }
        [Authorize("StudentPolicy")]
        [HttpPost]
        public async Task<IActionResult> CreateFlashCard(CreateFlashCardDTO createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var userId = GetCurrentUserId();

                var useremail =GetCurrentEmail();
                if (string.IsNullOrEmpty(useremail))
                {
                    return Unauthorized("Could not extract user email from token.");
                }
                var currentTime = CurrentDateTime;

                var flashcard = new FlashCard
                {
                    Question = createDto.Question,
                    Answer = createDto.Answer,
                    Difficulty = createDto.Difficulty,
                    CreatedAt = currentTime,
                    CreatedBy = useremail,
                    LastModifiedBy = useremail,
                    LastModified = currentTime,
                    UserId = userId
                };
                _flashcardRepository.Add(flashcard);



                return CreatedAtAction(nameof(GetFlashCard), new { id = flashcard.Id }, flashcard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the flashcard.");
            }
        }

        [Authorize("StudentPolicy")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFlashCard(int id, UpdateFlashCardDTO updateDto)
        {
            var userId = GetCurrentUserId();
            var currentTime = CurrentDateTime;
            var username =  GetCurrentEmail();

            var flashcard =await  _flashcardRepository.FindOneAsync(x => x.Id == id && x.UserId == userId);
            

            if (flashcard == null)
            {
                return NotFound("Flash Card Not Found");
            }

            flashcard.Question = updateDto.Question;
            flashcard.Answer = updateDto.Answer;
            flashcard.LastModified = currentTime;
            flashcard.LastModifiedBy = username;

            await _context.SaveChangesAsync();
            return Ok("Updated Successfully");
        }

        [HttpPut("{id}/difficulty")]
        public async Task<IActionResult> UpdateDifficulty(int id, string difficulty)
        {
            if (!difficulties.Contains(difficulty))
            {
                return BadRequest("Invalid difficulty level");
            }

            var userId = GetCurrentUserId();
            var currentTime = CurrentDateTime;
            var useremail =  GetCurrentEmail();

            var flashcard = await _flashcardRepository.FindOneAsync(x => x.Id == id && x.UserId == userId);

            if (flashcard == null)
            {
                return NotFound("Flashcard Not Found");
            }

            flashcard.Difficulty = difficulty;
            flashcard.LastModified = currentTime;
            flashcard.LastModifiedBy = useremail;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFlashCard(int id)
        {
            var userId = GetCurrentUserId();
            var flashcard = await _flashcardRepository.FindOneAsync(x =>x.Id == id && x.UserId==userId) ;

            if (flashcard == null)
            {
                return NotFound("flashcard Not Found");
            }

            _flashcardRepository.Delete(flashcard);
            _context.SaveChanges();
            return Ok("Deleted Successfully");
        }

        [HttpGet("count")]
        [Authorize("StudentPolicy")]
        public async Task<IActionResult> GetFlashCardCount()
        {
            var userId =int.Parse(User.FindFirst("Id")?.Value);
            if (userId == null)
            {
                return Unauthorized("User Not found");
            }

            var count = await _context.Flashcards.Where(x => x.UserId == userId).CountAsync();
            return Ok(new { TaskCount = count });
        }


        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("Id")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedException("User not authenticated");
            }
            return userId;
        }
       
        
        
        private string? GetCurrentEmail()
        {

            return  User.FindFirst("Email")?.Value
        ?? User.FindFirst(ClaimTypes.Email)?.Value;
        }



        private static readonly string[] difficulties = new[]
        {
            "mastered",
            "easy",
            "medium",
            "hard",
            "new"
        };
    }
}
