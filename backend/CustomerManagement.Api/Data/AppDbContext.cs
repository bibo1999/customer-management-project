using CustomerManagement.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Api.Data;

/// <summary>
/// Represents the application's database session and provides access to customer records.
/// Entity Framework Core uses this context to query and save data.
/// </summary>
/// <param name="options">
/// Configuration supplied through dependency injection, including the database provider and connection settings.
/// </param>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    /// <summary>
    /// Represents the Customers table and provides methods for querying and managing customer records.
    /// </summary>
    public DbSet<Customer> Customers => Set<Customer>();

    /// <summary>
    /// Configures the database schema and constraints for the Customer entity.
    /// These settings are used by Entity Framework Core when building the model and generating migrations.
    /// </summary>
    /// <param name="modelBuilder">Provides an API for configuring entity mappings.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply any model configuration defined by the base DbContext class.
        base.OnModelCreating(modelBuilder);

        // Configure how the Customer entity maps to the database.
        modelBuilder.Entity<Customer>(entity =>
        {
            // Use Id as the primary key for each customer record.
            entity.HasKey(customer => customer.Id);

            // FullName is mandatory and can contain up to 100 characters.
            entity.Property(customer => customer.FullName)
                .IsRequired()
                .HasMaxLength(100);

            // Phone is mandatory and can contain up to 30 characters.
            entity.Property(customer => customer.Phone)
                .IsRequired()
                .HasMaxLength(30);

            // Email is optional and can contain up to 150 characters.
            entity.Property(customer => customer.Email)
                .HasMaxLength(150);

            // Create an index on Phone to help the database locate phone-number values efficiently.
            entity.HasIndex(customer => customer.Phone);
        });
    }
}