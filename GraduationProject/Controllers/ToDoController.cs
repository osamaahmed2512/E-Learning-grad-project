using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using GraduationProject.Services;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [ServiceFilter(typeof(CustomModelStateFilter))]
    public class ToDoController : ControllerBase
    {  private readonly IUnitOfWork _UnitOfWork;
 
        public ToDoController(IUnitOfWork unitOfWork )
        {
            _UnitOfWork = unitOfWork;
        }

        [HttpPost]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> CreateTask(ToDoDto task)
        {

            var userId = User.FindFirst("Id").Value;
            if (userId == null)
            {
                return Unauthorized("User Not found");
            }

            var Todo = new ToDo
            {
               Title = task.Title,
               Status = task.Status,
               CreatedAt = DateTime.Now,
               UpdatedAt = DateTime.Now,
               UserId = int.Parse(userId)
            };
            var user = await _UnitOfWork.Users.FindOneAsync(u => u.Id == int.Parse(userId));
            if (user != null && task.Status.ToLower() == "completed")
            {
                user.TotalCompletedTasks += 1;

                if (!user.HasCompleted10Tasks && user.TotalCompletedTasks >= 10)
                {
                    user.HasCompleted10Tasks = true;
                }
            }
            await  _UnitOfWork.ToDo.AddAsync(Todo);
            await _UnitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(Get), new {Todo.Id ,Todo});
        }

        [HttpGet]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> Get()
        { 

            var userId = User.FindFirst("Id").Value;

            if (userId == null)
            {
                return Unauthorized("User Not found");
            }
            var Todo = await _UnitOfWork.ToDo.FindAllAsync(x => x.UserId ==int.Parse( userId));
            
            return Ok(Todo);
        }

        [HttpPut]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> Update(updateTodoDto dto)
        {

            var userId = User.FindFirst("Id").Value;

            if (userId == null)
            {
                return Unauthorized("User Not found");
            }
            var exiatiingtodo =await _UnitOfWork.ToDo.FindOneAsync(x => x.UserId ==int.Parse(userId) && x.Id == dto.Id);

            if (exiatiingtodo == null)
            {
                return NotFound("Todo Not Found");
            }
            exiatiingtodo.Title = dto.Title;
            exiatiingtodo.Status = dto.Status;
            exiatiingtodo.UpdatedAt= DateTime.Now;
            var user = await _UnitOfWork.Users.FindOneAsync(u => u.Id == int.Parse(userId));
            if (user != null && dto.Status.ToLower() == "completed" && exiatiingtodo.Status.ToLower() == "completed")
            {
                user.TotalCompletedTasks += 1;

                if (!user.HasCompleted10Tasks && user.TotalCompletedTasks >= 10)
                {
                    user.HasCompleted10Tasks = true;
                }
            }
            await _UnitOfWork.CompleteAsync();


            return NoContent();
        }
        [HttpGet("status/{status}")]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> GetTasksByStatus(string status)
        {

            if (!IsValidStatus(status))
            {
                return BadRequest(new { error = "Status must be todo or doing or done" });
            }


            var userId = User.FindFirst("Id").Value;
            if (userId == null)
            {
                return BadRequest(new { error = "User Not found" });
            }
            return Ok( await _UnitOfWork.ToDo.GEtAllasync(x => x.UpdatedAt));
        }
        
        [HttpDelete("{id}")]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = User.FindFirst("Id").Value;;

            var task = await _UnitOfWork.ToDo.FindOneAsync(x=>x.Id == id && x.UserId==int.Parse(userId));
            
            if (task == null)
                return NotFound("TOdo NotFound");

            _UnitOfWork.ToDo.Delete(task);
            await _UnitOfWork.CompleteAsync();

            return Ok("Deleted Successfully");
        }


        [HttpGet("count")]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> GetTaskCount()
        {
            var userId = User.FindFirst("Id")?.Value;
            if (userId == null)
            {
                return Unauthorized("User Not found");
            }

            var count = await _UnitOfWork.ToDo.Count(x => x.UserId == int.Parse(userId)&&x.Status== "completed");
            return Ok(new { TaskCount = count });
        }
        [HttpGet("Finshed_10_Task")]
        [Authorize("InstructorAndUserPolicy")]
        public async Task<IActionResult> HasReachedGoal()
        {
            var userId = int.Parse(User.FindFirst("Id").Value);
            var user = await _UnitOfWork.Users.FindOneAsync(u => u.Id == userId);
            return Ok(new
            {
                hasCompleted10Tasks = user?.HasCompleted10Tasks ?? false,
                totalCompletedTasks = user?.TotalCompletedTasks ?? 0
            });
        }

        private bool IsValidStatus(string status)
        {
            return new[] { "todo", "doing", "done" }.Contains(status.ToLower());
        }
    }
}
