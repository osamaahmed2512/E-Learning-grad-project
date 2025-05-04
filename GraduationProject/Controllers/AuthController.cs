using Azure.Core;
using GraduationProject.consts;
using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.Helpers;
using GraduationProject.models;
using GraduationProject.Services;
using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol.Plugins;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Text;


namespace GraduationProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {

        private readonly AppDBContext _context;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;
        private readonly IMemoryCache _memoryCache;
        private readonly IUnitOfWork _unitofwork;
        public AuthController(AppDBContext context, IConfiguration configuration, EmailService emailService,
            IMemoryCache memoryCache , IUnitOfWork unitofwork)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _memoryCache = memoryCache;
            _unitofwork = unitofwork;
        }

        [HttpPost]
        [Route("Login")]

        public IActionResult Login(LoginDto loginDto)
        {
            if (loginDto == null)
                return BadRequest(new {statuscode= StatusCodes.Status400BadRequest, Message = "Invalid request data" });

            var user = _context.users.FirstOrDefault(x => x.Email == loginDto.Email && x.Password == loginDto.Password);
            
            if (user != null) {
                
                if ( !user.IsApproved)
                {
                    return Unauthorized(new { statuscode = StatusCodes.Status401Unauthorized, Message = "Your account is pending approval by the admin." });
                }
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub,_configuration["Jwt:Subject"]),
                    new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
                    new Claim("Id",user.Id.ToString()),
                    new Claim("Email",user.Email.ToString()),
                    new Claim("Role", user.Role)
                };
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var SignIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var Token = new JwtSecurityToken(
                    _configuration["Jwt:Issuer"],
                    _configuration["Jwt:Audience"],
                    claims,
                    expires: DateTime.UtcNow.AddDays(7),
                    signingCredentials: SignIn
                    );
                string TokenValue = new JwtSecurityTokenHandler().WriteToken(Token);


                return Ok(new { statuscode = StatusCodes.Status200OK, token = TokenValue, user = user });


            }
            return Unauthorized(new { statuscode = StatusCodes.Status400BadRequest, Message = "Invalid email or password" });
        }


        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

            if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }




        [HttpGet]
        [Route("GetUserById/{id}")]
        public IActionResult GetUserById(int id)
        {
            if (id == 0) return BadRequest("invalid input data");
            var user = _context.users.AsNoTracking().FirstOrDefault(x => x.Id == id);
            if (user == null) return BadRequest("user not found");
            return Ok(user);
        }
        [HttpGet]
        [Route("GetUserdetails")]
        [Authorize("InstuctandandadminandstudentPolicy")]
        public IActionResult GetUserdetails()
        {
            var id = int.Parse(User.FindFirst("Id")?.Value);
            if (id == 0) return BadRequest("invalid input data");
            var user = _context.users.AsNoTracking().FirstOrDefault(x => x.Id == id);
            if (user == null) return BadRequest("user not found");
            return Ok(user);
        }

        [HttpDelete("DeleteUser/{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public IActionResult DeleteUser(int id)
        {
            var user = _context.users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            _context.users.Remove(user);
            _context.SaveChanges();

            return Ok(new { Message = "User deleted successfully" });
        }
        [HttpGet]
        [Route("Getallusers")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> Getallusers(
            [FromQuery] string? role,
            [FromQuery] string? search,
            [FromQuery] int page=1,
            [FromQuery] int pageSize=10,
            [FromQuery] string? orderBy = "Id",
            [FromQuery] string? orderDir = "ASC",
            [FromQuery] bool? isApproved = null
            )
        {
            
            var validOrderByFields = new[] { "Id", "Name","Role" , "IsApproved" , "RegistrationDate" };
            if (!validOrderByFields.Contains(orderBy))
            {
                return BadRequest(new { message = "Invalid orderBy field." });
            }
           
            orderDir = orderDir?.ToUpper() == "DESC" ? Sorting.Descending : Sorting.Ascending;


            Expression<Func<User, bool>> criteria = u =>
       (string.IsNullOrEmpty(search) || u.Name.Contains(search) || u.Email.Contains(search)) &&
       (string.IsNullOrEmpty(role) || u.Role == role)&&
       (!isApproved.HasValue || u.IsApproved == isApproved.Value);

            var users =  _unitofwork.Users.FindAll(
                criteria: criteria,
                orderBy: u => EF.Property<object>(u, orderBy),
                orderByDirection: orderDir,
                skip: (page - 1) * pageSize,
                take: pageSize
            );

            
            var totalCount = _unitofwork.Users.FindAll(criteria).Count();

            return Ok(new
            {
                data = users,
                page,
                pageSize,
                totalCount
            });

        }

        [HttpGet]
        [Route("GetallCountofusers")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> Getallusersonsytem(
               [FromQuery] bool? IsActive,
               [FromQuery] string? Role 
             )
        {
            var students =await _unitofwork.Users.Count(a =>
                (string.IsNullOrEmpty(Role) || a.Role == Role)&&
                (!IsActive.HasValue || a.IsApproved == IsActive)
                );

            return Ok(students);
        }


        [HttpPut("UpdateUser")]
        [Authorize("InstuctandandadminandstudentPolicy")]
        public async Task<IActionResult> UpdateUser([FromForm] UpdateUserDto UpdateDto)
        {
            
            var user = _context.users.FirstOrDefault(m => m.Id == UpdateDto.Id);
            if (user == null)
            {
                return NotFound(new { Message = "User Not Found" });

            }
            var loggedInUserId = int.Parse(User.FindFirst("Id")?.Value);
            var loggedInUserRole = User.FindFirst("Role")?.Value;
            
            if (!string.IsNullOrWhiteSpace(UpdateDto.Name))  user.Name = UpdateDto.Name;
            if (!string.IsNullOrWhiteSpace(UpdateDto.BIO)) user.BIO = UpdateDto.BIO;
            if (!string.IsNullOrWhiteSpace(UpdateDto.Username)) user.Username = UpdateDto.Username;

            if (!string.IsNullOrWhiteSpace(UpdateDto.Password)) 
            {if (user.Password != UpdateDto.CurrentPassword)
                {
                    return BadRequest(new { statuscode = StatusCodes.Status400BadRequest, message = "please enter avilid Current Password" });
                 }
                user.Password = UpdateDto.Password;
            }
            if (UpdateDto.Image != null && UpdateDto.Image.Length > 0)
            {
                
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(UpdateDto.Image.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { statuscode = StatusCodes.Status400BadRequest, Message = "Only image files are allowed (jpg, png, gif)" });
                }
                
                if (!string.IsNullOrWhiteSpace(user.ImageUrl))
                {
                    var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                string imageUrl = await SaveFile.SaveandUploadFile(UpdateDto.Image, "Images"); // Folder "Images" in wwwroot or storage
                user.ImageUrl = imageUrl;
            }
            if (!string.IsNullOrWhiteSpace(UpdateDto.Introduction)) user.Introduction = UpdateDto.Introduction;
            if (!string.IsNullOrWhiteSpace(UpdateDto.CVUrl)) user.CVUrl = UpdateDto.CVUrl;

            if (loggedInUserRole != "admin" && loggedInUserId !=UpdateDto.Id)
            {
                return Unauthorized( new { statuscode = StatusCodes.Status401Unauthorized, Message = "You are not authorized to perform this action." });
            }
            if (loggedInUserRole == "admin")
            {
                if (!string.IsNullOrWhiteSpace(UpdateDto.Role)) user.Role = UpdateDto.Role;
                if (UpdateDto.IsApproved.HasValue) user.IsApproved = UpdateDto.IsApproved.Value;
            }
            _context.SaveChanges();
            return Ok(new {Statuscode=StatusCodes.Status200OK , Message = " updated successfully" });

        }
            
        
        [HttpPost]
            [Route("Register")]
            public async Task<IActionResult> Register(RegisterDto registerDto)
            {


            // Validate SkillLevel for students
            if (registerDto.Role == "student")
            {
                var allowedSkillLevels = new[] { "Beginner", "Intermediate", "Advanced" };
                if (string.IsNullOrWhiteSpace(registerDto.SkillLevel) || !allowedSkillLevels.Contains(registerDto.SkillLevel, StringComparer.OrdinalIgnoreCase))
                {
                    return BadRequest(new { Message = "SkillLevel must be one of: Beginner, Intermediate, Advanced" });
                }
            }


            string cvUrl = null;

                if (registerDto.Role == "teacher")
                {
                    if (string.IsNullOrWhiteSpace(registerDto.Introducton))
                    {
                        return BadRequest(new { Message = "Introduction is required for teachers" });
                    }
                    if (registerDto.CV == null)
                    {
                        return BadRequest(new { Message = "CV is required for teachers" });
                    }

                    if (registerDto.CV.ContentType != "application/pdf")
                    {
                        return BadRequest(new { Message = "Only PDF files are allowed" });
                    }
                    if (registerDto.CV.Length > 5 * 1024 * 1024) // 5 MB limit
                    {
                        return BadRequest(new { Message = "File size must be less than 5 MB" });
                    }

                    cvUrl = await SaveFile.SaveandUploadFile(registerDto.CV, "CVs");
                }

                // Create a new User object
                var newUser = new User
                {
                    Name = registerDto.Name,
                    Email = registerDto.Email,
                    Password = registerDto.Password,
                    Role = registerDto.Role,
                    ImageUrl = null,
                    Introduction = registerDto.Role == "teacher" ? registerDto.Introducton : null,
                    CVUrl = registerDto.Role == "teacher" ? cvUrl : null,
                    IsApproved = registerDto.Role == "student" ? true : false,
                    PreferredCategory = registerDto.Role == "student" ? registerDto.PreferredCategory:null ,
                    SkillLevel = registerDto.Role== "student"?registerDto.SkillLevel:null,
                    RegistrationDate=DateTime.UtcNow,
                    BIO=registerDto.BIO
                    
                };


            // Save the user to the database
            _context.users.Add(newUser);
                _context.SaveChanges();
                if (registerDto.Role == "teacher")
                {
                    // Send email to teacher informing them to wait for approval
                    var teacherEmailBody = $"Dear {registerDto.Name},\n\n" +
                        "Thank you for registering as a teacher. Your account is currently pending approval by the admin. " +
                        "You will receive an email once your account is approved.\n\n" +
                        "Best regards,\nYour Team";
                    await _emailService.SendEmailAsync(registerDto.Email, "Account Pending Approval", teacherEmailBody);
                }
                // Return a success response
                return Ok(new { Message = "User registered successfully" });
            }

        [HttpPost]
        [Route("AdminRegister")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> AdminRegister(RegisterDto registerDto)
        {

            if (registerDto.Role == "student")
            {
                var allowedSkillLevels = new[] { "Beginner", "Intermediate", "Advanced" };
                if (string.IsNullOrWhiteSpace(registerDto.SkillLevel) || !allowedSkillLevels.Contains(registerDto.SkillLevel, StringComparer.OrdinalIgnoreCase))
                {
                    return BadRequest(new { Message = "SkillLevel must be one of: Beginner, Intermediate, Advanced" });
                }
            }

 
            var newUser = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email,
                Password = registerDto.Password,
                Role = registerDto.Role,
                ImageUrl = null,
                Introduction = null,
                CVUrl =null,
                IsApproved = true, 
                PreferredCategory = registerDto.Role == "student" ? registerDto.PreferredCategory : null,
                SkillLevel = registerDto.Role == "student" ? registerDto.SkillLevel : null,
                RegistrationDate = DateTime.Now,
                BIO = registerDto.BIO
            };

            _context.users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User created successfully", newUser.Id });
        }




        [HttpPost]
            [Route("ApproveTeacher/{id}")]
            [Authorize(Policy = "AdminPolicy")]

            public async Task<IActionResult> ApproveTeacher(int id)
            {
                var user = _context.users.FirstOrDefault(u => u.Id == id && u.Role == "teacher");
                if (user == null)
                {
                    return NotFound(new { Message = "Teacher not found" });
                }

                user.IsApproved = true;
                await _context.SaveChangesAsync();
                // Send email notification to the teacher
                var emailBody = "Your teacher account has been approved. You can now log in.";
                await _emailService.SendEmailAsync(user.Email, "Account Approved", emailBody);
                return Ok(new { Message = "Teacher approved successfully." });
            }

            [HttpPost("forgetpassword")]
            public async Task<IActionResult> ForgotPassword(string email)
            {
                // Check if the email exists in the database
                var user = _context.users.FirstOrDefault(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found" });
                }
                // Generate a secure token
                var resetToken = GenerateSecureToken();
                // Generate a 6-digit OTP
                var otp = GenerateOtp();

                // Store the OTP in memory cache with a 5-minute expiration
                _memoryCache.Set(email, otp, TimeSpan.FromMinutes(5));

                var emailBody = $"<p>Hello {email},</p>" +
                    "<p>Your OTP for password reset is: <b>" + otp + "</b>. It is valid for 5 minutes.</p>" +
                    "<p>If you did not request this, please ignore this email.</p>" +
                    "<p>Best regards,</p>" +
                    "<p><b>Your Company Name</b></p>";

                await _emailService.SendEmailAsync(email, "Password Reset OTP", emailBody);
                return Ok(new { Message = "OTP sent to your email" });
            }
            [HttpPost("VerifyOtp")]
            public IActionResult VerifyOtp(string email, string otp)
            {
                // Retrieve the OTP from the cache
                if (!_memoryCache.TryGetValue(email, out string cachedOtp))
                {
                    return BadRequest(new { Message = "OTP expired or invalid" });
                }

                // Compare the submitted OTP with the cached OTP
                if (cachedOtp != otp)
                {
                    return BadRequest(new { Message = "Invalid OTP" });
                }
                // Generate a secure token for password reset
                var resetToken = GenerateSecureToken();
                // Store the reset token in the cache with an expiration time
                _memoryCache.Set(resetToken, email, TimeSpan.FromMinutes(10));
                // Return the reset token to the user
                return Ok(new { Message = "OTP verified successfully", ResetToken = resetToken });
            }

            [HttpPost("ResetPassword")]
            public IActionResult ResetPassword(string resetToken, string newPassword)
            {
                // Retrieve the email associated with the reset token
                if (!_memoryCache.TryGetValue(resetToken, out string email))
                {
                    return BadRequest(new { Message = "Invalid or expired reset token" });
                }
                // Find the user by email
                var user = _context.users.FirstOrDefault(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found" });
                }

                // Update the user's password
                user.Password = newPassword; // Note: Hash the password before saving it in a real application
                _context.SaveChanges();

                // Remove the reset token from the cache
                _memoryCache.Remove(resetToken);

                return Ok(new { Message = "Password reset successfully" });
            }

            private string GenerateOtp()
            {
                var random = new Random();
                return random.Next(100000, 999999).ToString();
            }

            private string GenerateSecureToken()
            {
                return Guid.NewGuid().ToString("N");
            }
            private string GenerateRefreshToken()
            {
                var randomNumber = new byte[64];
                using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }

            private string GenerateAccessToken(IEnumerable<Claim> claims)
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var token = new JwtSecurityToken(
                    _configuration["Jwt:Issuer"],
                    _configuration["Jwt:Audience"],
                    claims,
                    expires: DateTime.UtcNow.AddMinutes(15),
                    signingCredentials: signIn
                );
                return new JwtSecurityTokenHandler().WriteToken(token);
            }

        }
    } 
