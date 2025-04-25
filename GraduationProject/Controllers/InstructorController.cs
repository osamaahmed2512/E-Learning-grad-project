using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.Migrations;
using GraduationProject.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorController : ControllerBase
    {

        private readonly AppDBContext _context;

        public InstructorController(AppDBContext context)
        {
            _context = context;
        }
      
      
    }



}
