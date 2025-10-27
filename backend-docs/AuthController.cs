using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Houseiana.Core.Entities.Identity;
using Houseiana.Api.Contracts.Auth;

namespace Houseiana.Api.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(dto.Email);
                if (user == null)
                {
                    return BadRequest(new { error = "Invalid credentials" });
                }

                // Check if user type matches
                var userRoles = await _userManager.GetRolesAsync(user);
                if (!userRoles.Contains(dto.UserType))
                {
                    return BadRequest(new { error = "Invalid user type" });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
                if (!result.Succeeded)
                {
                    return BadRequest(new { error = "Invalid credentials" });
                }

                // Generate JWT token
                var token = await GenerateJwtToken(user);

                // Get role-specific ID
                string? hostId = null;
                string? guestId = null;

                if (dto.UserType == "host")
                {
                    hostId = user.HostId?.ToString();
                }
                else if (dto.UserType == "guest")
                {
                    guestId = user.GuestId?.ToString();
                }

                return Ok(new
                {
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        name = user.FullName
                    },
                    role = dto.UserType,
                    hostId,
                    guestId,
                    accessToken = token,
                    expiresAt = DateTime.UtcNow.AddHours(24)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for email: {Email}", dto.Email);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { error = "Email already registered" });
                }

                var user = new ApplicationUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    FullName = dto.Name,
                    EmailConfirmed = true // Set to false if you want email verification
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
                }

                // Add role
                await _userManager.AddToRoleAsync(user, dto.UserType);

                // Create role-specific profile
                if (dto.UserType == "host")
                {
                    // Create Host profile
                    var hostId = Guid.NewGuid();
                    user.HostId = hostId;
                    // TODO: Create Host entity in your context
                }
                else if (dto.UserType == "guest")
                {
                    // Create Guest profile
                    var guestId = Guid.NewGuid();
                    user.GuestId = guestId;
                    // TODO: Create Guest entity in your context
                }

                await _userManager.UpdateAsync(user);

                // Generate token
                var token = await GenerateJwtToken(user);

                return Ok(new
                {
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        name = user.FullName
                    },
                    role = dto.UserType,
                    hostId = user.HostId?.ToString(),
                    guestId = user.GuestId?.ToString(),
                    accessToken = token
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration error for email: {Email}", dto.Email);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            try
            {
                var principal = GetPrincipalFromExpiredToken(dto.Token);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (userId == null)
                {
                    return BadRequest(new { error = "Invalid token" });
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return BadRequest(new { error = "User not found" });
                }

                var newToken = await GenerateJwtToken(user);

                return Ok(new
                {
                    accessToken = newToken,
                    expiresAt = DateTime.UtcNow.AddHours(24)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token refresh error");
                return BadRequest(new { error = "Invalid token" });
            }
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var userRoles = await _userManager.GetRolesAsync(user);
            var role = userRoles.FirstOrDefault() ?? "guest";

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email!),
                new(ClaimTypes.Name, user.FullName ?? ""),
                new(ClaimTypes.Role, role),
                new("user_id", user.Id),
                new("role", role)
            };

            // Add role-specific claims
            if (role == "host" && user.HostId.HasValue)
            {
                claims.Add(new("host_id", user.HostId.Value.ToString()));
            }
            else if (role == "guest" && user.GuestId.HasValue)
            {
                claims.Add(new("guest_id", user.GuestId.Value.ToString()));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret not configured")));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!)),
                ValidateLifetime = false // We're refreshing, so ignore expiration
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }
    }
}

// DTOs
namespace Houseiana.Api.Contracts.Auth
{
    public class LoginDto
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string UserType { get; set; } = default!; // "host" or "guest"
    }

    public class RegisterDto
    {
        public string Name { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string UserType { get; set; } = default!; // "host" or "guest"
    }

    public class RefreshTokenDto
    {
        public string Token { get; set; } = default!;
    }
}

// Identity Entities
namespace Houseiana.Core.Entities.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }
        public Guid? HostId { get; set; }
        public Guid? GuestId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
}