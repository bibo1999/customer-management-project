using CustomerManagement.Api.Contracts;
using CustomerManagement.Api.Data;
using CustomerManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Api.Controllers;

/// <summary>
/// Provides HTTP endpoints for creating, retrieving, searching,
/// updating, and deleting customer records.
/// </summary>
/// <remarks>
/// The controller uses AppDbContext to access SQL Server through EF Core.
/// ASP.NET Core automatically maps this controller to the route
/// /api/customers because of the controller name and route attribute.
/// </remarks>
[ApiController]
[Route("api/[controller]")]
public class CustomersController(AppDbContext dbContext) : ControllerBase
{
    /// <summary>
    /// Retrieves all customers or filters them by name or phone number.
    /// </summary>
    /// <param name="search">
    /// Optional search term used to match customer names or phone numbers.
    /// </param>
    /// <param name="cancellationToken">
    /// Allows the request to cancel the database operation if necessary.
    /// </param>
    /// <returns>A list of matching customers ordered by full name.</returns>
    // GET /api/customers?search=ahmed
    // AsNoTracking improves read performance because these entities
    // are not intended to be modified and saved in this request.
    // Filtering is performed by SQL Server through EF Core, not in React.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        // Start with a query that EF Core will execute when the results are requested.
        IQueryable<Customer> query = dbContext.Customers.AsNoTracking();

        // Apply filtering only when a non-empty search term is provided.
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            // Match the search term against either the customer's name or phone.
            query = query.Where(customer =>
                customer.FullName.Contains(term) ||
                customer.Phone.Contains(term));
        }

        // Execute the query, sort the results alphabetically, and return the list.
        var customers = await query
            .OrderBy(customer => customer.FullName)
            .ToListAsync(cancellationToken);

        return Ok(customers);
    }

    /// <summary>
    /// Retrieves a single customer using its database ID.
    /// </summary>
    /// <param name="id">The ID of the customer to retrieve.</param>
    /// <param name="cancellationToken">Cancels the database operation if needed.</param>
    /// <returns>The customer if found; otherwise, HTTP 404 Not Found.</returns>
    // GET /api/customers/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Customer>> GetCustomer(
        int id,
        CancellationToken cancellationToken)
    {
        // Use a read-only query because this endpoint only returns customer data.
        var customer = await dbContext.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                customer => customer.Id == id,
                cancellationToken);

        // Return 404 when no customer has the requested ID.
        // Otherwise, return the customer with HTTP 200 OK.
        return customer is null ? NotFound() : Ok(customer);
    }

    /// <summary>
    /// Creates a new customer record.
    /// </summary>
    /// <param name="request">The validated customer details from the request body.</param>
    /// <param name="cancellationToken">Cancels the database operation if needed.</param>
    /// <returns>
    /// HTTP 201 Created, including the new customer and its resource location.
    /// </returns>
    // POST /api/customers
    // [ApiController] automatically applies model validation to the request DTO.
    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(
        [FromBody] CustomerRequest request,
        CancellationToken cancellationToken)
    {
        // Map the request DTO to a database entity.
        // Trim text fields to avoid storing unnecessary surrounding whitespace.
        // Store an empty optional email as null.
        // Record the creation time in UTC for consistent timestamp storage.
        var customer = new Customer
        {
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email)
                ? null
                : request.Email.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        // Mark the entity for insertion and persist it to SQL Server.
        dbContext.Customers.Add(customer);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Return HTTP 201 Created and a Location header pointing to GetCustomer.
        return CreatedAtAction(
            nameof(GetCustomer),
            new { id = customer.Id },
            customer);
    }

    /// <summary>
    /// Updates an existing customer's name, phone number, and email.
    /// </summary>
    /// <param name="id">The ID of the customer to update.</param>
    /// <param name="request">The updated customer details.</param>
    /// <param name="cancellationToken">Cancels the database operation if needed.</param>
    /// <returns>
    /// HTTP 204 No Content when updated, or HTTP 404 Not Found if absent.
    /// </returns>
    // PUT /api/customers/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCustomer(
        int id,
        [FromBody] CustomerRequest request,
        CancellationToken cancellationToken)
    {
        // Load the tracked entity so EF Core can detect property changes.
        var customer = await dbContext.Customers
            .FirstOrDefaultAsync(
                customer => customer.Id == id,
                cancellationToken);

        // Do not attempt to update a record that does not exist.
        if (customer is null)
        {
            return NotFound();
        }

        // Update the editable fields while preserving the original creation time.
        customer.FullName = request.FullName.Trim();
        customer.Phone = request.Phone.Trim();
        customer.Email = string.IsNullOrWhiteSpace(request.Email)
            ? null
            : request.Email.Trim();

        // Persist the tracked entity's changes to the database.
        await dbContext.SaveChangesAsync(cancellationToken);

        // A 204 response confirms success without returning a response body.
        return NoContent();
    }

    /// <summary>
    /// Deletes an existing customer record.
    /// </summary>
    /// <param name="id">The ID of the customer to delete.</param>
    /// <param name="cancellationToken">Cancels the database operation if needed.</param>
    /// <returns>
    /// HTTP 204 No Content when deleted, or HTTP 404 Not Found if absent.
    /// </returns>
    // DELETE /api/customers/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCustomer(
        int id,
        CancellationToken cancellationToken)
    {
        // Retrieve the entity so EF Core can track it for deletion.
        var customer = await dbContext.Customers
            .FirstOrDefaultAsync(
                customer => customer.Id == id,
                cancellationToken);

        // Return 404 if the requested customer does not exist.
        if (customer is null)
        {
            return NotFound();
        }

        // Mark the entity for deletion and persist the change.
        dbContext.Customers.Remove(customer);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Confirm successful deletion without returning a response body.
        return NoContent();
    }
}