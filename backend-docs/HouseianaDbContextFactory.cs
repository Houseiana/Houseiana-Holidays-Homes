using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Houseiana.Infrastructure.Data
{
    public class HouseianaDbContextFactory : IDesignTimeDbContextFactory<HouseianaDbContext>
    {
        public HouseianaDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<HouseianaDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? "Host=localhost;Database=houseiana_dev;Username=postgres;Password=postgres";

            optionsBuilder.UseNpgsql(connectionString, b =>
            {
                b.MigrationsAssembly("Houseiana.Infrastructure");
                b.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });

            // Enable sensitive data logging in development
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                optionsBuilder.EnableSensitiveDataLogging();
                optionsBuilder.EnableDetailedErrors();
            }

            return new HouseianaDbContext(optionsBuilder.Options);
        }
    }
}