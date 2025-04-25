using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonQuestionsController : ControllerBase
    {
       private readonly AppDBContext _Context;

        public LessonQuestionsController(AppDBContext context)
        {
          _Context = context;
        }
        [HttpPost("add")]
        public async Task<IActionResult> AddQuestionToLesson([FromBody] LessonQuestionsCreateDTO dTO)
        {
            var lesson = await _Context.Lesson.FindAsync(dTO.LessonId);
            if (lesson == null) 
            {
               return NotFound($"lesson with id {dTO.LessonId} is not found");
            }
            if (dTO.Questions == null || !dTO.Questions.Any())
            {
                return BadRequest("At Least one question shouid be provided");

            }

            foreach (var questiondto in dTO.Questions) 
            {
             
                if (questiondto.Answers==null || !questiondto.Answers.Any())
                {
                    return BadRequest($"question {questiondto.QuestionText} must be have at least one answrs");
                }
                
                if (!questiondto.Answers.Any(x => x.IsCorrect ==true))
                {
                    return BadRequest($"question {questiondto.QuestionText} must be have have at least one correct answer");
                }

                var Question = new Question
                {
                    QuestionText = questiondto.QuestionText,
                    LessonId = dTO.LessonId,
                    Answers = questiondto.Answers.Select(a => new Answer
                    {
                        AnswerText = a.AnswerText,
                        IsCorrect = a.IsCorrect ?? false,

                    } ).ToList()

                };
                _Context.Questions.Add(Question);
            }
            await _Context.SaveChangesAsync();
            return Ok($"question add suceesfully");



        }

        [HttpGet("Lesson/{LessonId}")]
        public async Task<IActionResult> GetLessonQuestions(int LessonId)
        {
            var lesson = _Context.Lesson.FirstOrDefault(x =>x.Id == LessonId);
            if (lesson == null )
            {
                return NotFound($"Lesson with Id {LessonId} Not Found");
            }

            var questions =await _Context.Questions.
                Include(x =>x.Answers).
                Where(x =>x.LessonId == LessonId)
                .ToListAsync();
            if (questions == null)
            {
                return NotFound($"No Question Found for Lesson {LessonId} ");
            }
            var questionDtos = questions
                .Select(
                x => new
                {questionsId=x .Id,
                x.QuestionText,
                x.LessonId,
                Answers = x.Answers.
                Select(
                    y => new
                    {
                        y.Id ,
                        y.AnswerText,
                        y.IsCorrect,
                        y.QuestionId
                    }
                    )
                }
                );

            return Ok(questionDtos);


        }

        [HttpGet("question/{QuestionId}")]
        public async Task<IActionResult> Getquestion(int QuestionId)
        {
            var question = await _Context.Questions.Include(x =>x.Answers).FirstOrDefaultAsync(x =>x.Id == QuestionId);
            if (question == null)
            {
                return NotFound($"question with Id {QuestionId} is not found");
            }

            return Ok(question);


        }

        // UPDATE endpoints
        [HttpPut("question/{QuestionId}")]
        public async Task<IActionResult> UpdateQuestion(int QuestionId, [FromBody] QuestionUpdateDTO dto)
        {
            var question = await _Context.Questions
                .Include(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == QuestionId);

            if (question == null)
                return NotFound($"Question with ID {QuestionId} not found");

            // Update question text if provided
            if (!string.IsNullOrEmpty(dto.QuestionText))
                question.QuestionText = dto.QuestionText;

            // Update answers if provided
            if (dto.Answers != null && dto.Answers.Any())
            {
                // Remove existing answers
                _Context.Answers.RemoveRange(question.Answers);

                // Add new answers
                question.Answers = dto.Answers.Select(a => new Answer
                {
                    AnswerText = a.AnswerText,
                    IsCorrect = a.IsCorrect,
                    QuestionId = QuestionId
                }).ToList();

                // Validate at least one correct answer
                if (!question.Answers.Any(a => a.IsCorrect))
                    return BadRequest("Question must have at least one correct answer");
            }

            await _Context.SaveChangesAsync();
            return Ok("Question updated successfully");
        }

        [HttpPatch("answer/{AnswerId}")]
        public async Task<IActionResult> UpdateAnswer(int AnswerId, [FromBody] AnswerUpdateDTO dto)
        {

            var answer = await _Context.Answers.FirstOrDefaultAsync(x => x.Id == AnswerId);

            if (answer == null) return NotFound($"answer with Id : {AnswerId} is not found");
            if (!string.IsNullOrEmpty(dto.AnswerText))
                answer.AnswerText = dto.AnswerText;

            if (dto.IsCorrect != answer.IsCorrect)
            {
                if (dto.IsCorrect == true)
                {
                    var otheranswers =  _Context.Answers
                        .Where(a => a.QuestionId == answer.QuestionId && a.Id != AnswerId);
                    foreach (var otheranswer in otheranswers)
                    {
                        otheranswer.IsCorrect= false;
                    }

                }

                answer.IsCorrect = dto.IsCorrect;
              
            }
            await _Context.SaveChangesAsync();
            return Ok("answer updated suceessfully ");
        }


        [HttpPost("question/{questionId}/add-answer")]
        public async Task<IActionResult> AddAnswerToQuestion(int questionId, [FromBody] AnswerCreateDto dto )
        {
            var question = await _Context.Questions.Include(q =>q.Answers)
                .FirstOrDefaultAsync( x => x.Id == questionId);

            if (question == null) return NotFound($"question with Id {questionId} is not found");

            var newanswer = new Answer
            {
                AnswerText = dto.AnswerText,
                IsCorrect = dto.IsCorrect ?? false,
                QuestionId = questionId,
            };

            if (newanswer.IsCorrect)
            {
                foreach (var answer in question.Answers )
                {
                    if (answer.IsCorrect)
                    {
                        answer.IsCorrect = false;
                        _Context.Entry(answer).State = EntityState.Modified;
                    }
                }

            }
            // Add the new answer
            question.Answers.Add(newanswer);
            _Context.Entry(newanswer).State = EntityState.Added;

            if (!question.Answers.Any(x => x.IsCorrect))
            {
                return BadRequest("Question must have at least one correct answer");
            }

            // Save changes
            await _Context.SaveChangesAsync();
            return Ok("New answer added successfully");
        }

        [HttpDelete("question/{questionId}")]
        public async Task<IActionResult> deleteQuestion(int questionId)
        {
            var question = _Context.Questions.Include(x =>x.Answers).FirstOrDefault(x =>x.Id == questionId);

            if (question == null) return NotFound($"question with id {questionId} is not found");
            _Context.Answers.RemoveRange(question.Answers);
            _Context.Questions.Remove(question);
            await _Context.SaveChangesAsync();
            return Ok("Questions and its answers deleted successfully");
        }
        [HttpDelete("answer/{AnswerId}")]
        public async Task<IActionResult> DeleteAnswer(int AnswerId)
        {
            var answer = await _Context.Answers.FindAsync(AnswerId);
            if (answer == null) return NotFound($"Answer with Id {AnswerId} is Not found");
            if (answer.IsCorrect)
            {
                var othercorrectedanswerexist = await _Context.Answers
                    .AnyAsync(a => a.QuestionId == answer.QuestionId && a.Id != AnswerId && a.IsCorrect);
                if (!othercorrectedanswerexist)
                    return BadRequest("Can Not delete the only correct answer");
            }
              _Context.Answers.Remove(answer);
            await _Context.SaveChangesAsync();
            return Ok("Answer deleted successfully");
        }
    }
}
