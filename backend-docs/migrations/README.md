# EF Core Migrations Guide

## Prerequisites

1. Install EF Core Tools:
```bash
dotnet tool install --global dotnet-ef
```

2. Add required packages to your project:
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
```

## Setup Connection String

In `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=houseiana_dev;Username=postgres;Password=your_password"
  }
}
```

## Design-Time Factory

Create `Infrastructure/Data/HouseianaDbContextFactory.cs`:

```csharp
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
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<HouseianaDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseNpgsql(connectionString, b =>
            {
                b.MigrationsAssembly("Houseiana.Infrastructure");
                b.EnableRetryOnFailure();
            });

            return new HouseianaDbContext(optionsBuilder.Options);
        }
    }
}
```

## Migration Commands

### Create Migration
```bash
dotnet ef migrations add InitialHouseianaSchema --project Infrastructure --startup-project Api
```

### Update Database
```bash
dotnet ef database update --project Infrastructure --startup-project Api
```

### Remove Last Migration
```bash
dotnet ef migrations remove --project Infrastructure --startup-project Api
```

### Generate SQL Script
```bash
dotnet ef migrations script --project Infrastructure --startup-project Api
```

### Reset Database (Development only)
```bash
dotnet ef database drop --project Infrastructure --startup-project Api
dotnet ef database update --project Infrastructure --startup-project Api
```

## Production Deployment

For production, generate SQL script and run manually:
```bash
dotnet ef migrations script --idempotent --output migration.sql --project Infrastructure --startup-project Api
```

Then execute the SQL script on your production database.

## PostgreSQL Extensions Required

The migration will automatically enable:
- `uuid-ossp` - For UUID generation
- `pg_trgm` - For text search (optional but recommended)

## Seed Data

After running migrations, consider adding seed data for:
- Guest tags (VIP, Repeat, High-Value, etc.)
- Default templates for messages
- System configuration

Example seed in `DbContext.OnModelCreating()`:
```csharp
modelBuilder.Entity<GuestTag>().HasData(
    new GuestTag { Id = Guid.NewGuid(), Name = "VIP" },
    new GuestTag { Id = Guid.NewGuid(), Name = "Repeat Guest" },
    new GuestTag { Id = Guid.NewGuid(), Name = "High Value" }
);
```