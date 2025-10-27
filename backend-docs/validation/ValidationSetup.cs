using FluentValidation;
using FluentValidation.AspNetCore;
using Houseiana.Api.Validation.Crm;
using Houseiana.Api.Validation.Messaging;
using Houseiana.Api.Validation.Finance;
using Houseiana.Api.Validation.Compliance;

namespace Houseiana.Api.Configuration
{
    public static class ValidationConfiguration
    {
        public static IServiceCollection AddValidation(this IServiceCollection services)
        {
            // Add FluentValidation
            services.AddFluentValidationAutoValidation();
            services.AddFluentValidationClientsideAdapters();

            // Register all validators
            services.AddValidatorsFromAssemblyContaining<GuestNoteCreateValidator>();
            services.AddValidatorsFromAssemblyContaining<ThreadCreateValidator>();
            services.AddValidatorsFromAssemblyContaining<PayoutAccountCreateValidator>();
            services.AddValidatorsFromAssemblyContaining<KycInitiateValidator>();

            // Configure validation behavior
            ValidatorOptions.Global.DefaultRuleLevelCascadeMode = CascadeMode.Stop;
            ValidatorOptions.Global.DefaultClassLevelCascadeMode = CascadeMode.Continue;

            return services;
        }
    }

    // Custom validation filter for better error responses
    public class ValidationExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            if (context.Exception is ValidationException validationException)
            {
                var errors = validationException.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );

                var problemDetails = new ValidationProblemDetails(errors)
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "One or more validation errors occurred.",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = "Please refer to the errors property for additional details.",
                    Instance = context.HttpContext.Request.Path
                };

                context.Result = new BadRequestObjectResult(problemDetails);
                context.ExceptionHandled = true;
            }
        }
    }
}

// Add to Program.cs:
/*
using Houseiana.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationExceptionFilter>();
});

// Add validation
builder.Services.AddValidation();

// Other services...
builder.Services.AddDbContext<HouseianaDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(typeof(ApiProfile));

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
*/