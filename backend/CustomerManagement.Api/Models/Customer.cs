using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Api.Models;

public class Customer
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(150)]
    [EmailAddress]
    public string? Email { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
