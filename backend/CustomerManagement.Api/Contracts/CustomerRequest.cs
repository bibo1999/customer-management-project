using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Api.Contracts;

/// <summary>
/// Defines the data accepted when creating or updating a customer.
/// This request DTO separates incoming API data from the database entity.
/// </summary>
public class CustomerRequest
{
    /// <summary>
    /// The customer's full name.
    /// </summary>
    // The name must be provided and contain between 2 and 100 characters.
    // ASP.NET Core returns a validation error if these rules are violated.
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(
        100,
        MinimumLength = 2,
        ErrorMessage = "Full name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// The customer's phone number.
    /// </summary>
    // A phone number is required and must contain between 6 and 30 characters.
    // StringLength checks length; it does not enforce a specific phone format.
    [Required(ErrorMessage = "Phone number is required.")]
    [StringLength(
        30,
        MinimumLength = 6,
        ErrorMessage = "Phone number must be between 6 and 30 characters.")]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// The customer's email address, if provided.
    /// </summary>
    // The email is optional because the property is nullable and has no Required attribute.
    // When a non-empty value is supplied, EmailAddress checks its format.
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(150)]
    public string? Email { get; set; }
}