import { Pencil, Phone, Mail, Trash2, Users } from 'lucide-react'

/**
 * Generates avatar initials from a customer's full name.
 * Uses the first letter of up to two words, e.g. "Ahmed Hassan" → "AH".
 * Returns "?" if the name is empty.
 */
function initials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || '?'
  )
}

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  deletingId,
}) {
  // Show a helpful empty state when there are no customers to display.
  // This also covers cases where a search returns no matching records.
  if (!customers.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Users size={26} />
        </div>
        <h3>No customers found</h3>
        <p>Try another search, or add a new customer to get started.</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop layout: display customers in a structured data table. */}
      <div className="desktop-table-wrap">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone number</th>
              <th>Email address</th>
              <th>Added</th>
              <th className="actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Use the database ID as the stable React key for each row. */}
            {customers.map(customer => (
              <tr key={customer.id}>
                {/* Customer identity: initials avatar, name, and database ID. */}
                <td>
                  <div className="customer-cell">
                    <div className="avatar">
                      {initials(customer.fullName)}
                    </div>

                    <div>
                      <strong>{customer.fullName}</strong>
                      <span className="customer-id">
                        ID #{customer.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Display the phone number with a contact icon. */}
                <td>
                  <span className="contact-value">
                    <Phone size={14} />
                    {customer.phone}
                  </span>
                </td>

                {/* Show a dash when the optional email address is unavailable. */}
                <td>
                  <span className="contact-value email-value">
                    <Mail size={14} />
                    {customer.email || '—'}
                  </span>
                </td>

                {/* Format the creation timestamp using the browser's locale. */}
                <td>
                  {customer.createdAtUtc
                    ? new Date(customer.createdAtUtc).toLocaleDateString()
                    : '—'}
                </td>

                {/* Delegate edit and delete operations to the parent component. */}
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button edit-action"
                      onClick={() => onEdit(customer)}
                      aria-label={`Edit ${customer.fullName}`}
                      title="Edit customer"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-button delete-action"
                      onClick={() => onDelete(customer)}
                      // Prevent repeated deletion requests for this customer.
                      disabled={deletingId === customer.id}
                      aria-label={`Delete ${customer.fullName}`}
                      title="Delete customer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile layout: render each customer as a compact card instead of a table. */}
      <div className="mobile-customer-list">
        {customers.map(customer => (
          <article className="mobile-customer-card" key={customer.id}>
            <div className="mobile-card-top">
              {/* Keep the same customer identity and actions on smaller screens. */}
              <div className="customer-cell">
                <div className="avatar">
                  {initials(customer.fullName)}
                </div>

                <div>
                  <strong>{customer.fullName}</strong>
                  <span className="customer-id">
                    ID #{customer.id}
                  </span>
                </div>
              </div>

              <div className="row-actions">
                <button
                  className="icon-button edit-action"
                  onClick={() => onEdit(customer)}
                  aria-label={`Edit ${customer.fullName}`}
                >
                  <Pencil size={16} />
                </button>

                <button
                  className="icon-button delete-action"
                  onClick={() => onDelete(customer)}
                  disabled={deletingId === customer.id}
                  aria-label={`Delete ${customer.fullName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Contact details are stacked vertically for mobile readability. */}
            <div className="mobile-contact">
              <Phone size={15} />
              {customer.phone}
            </div>

            {/* Avoid displaying an empty email row when no email is provided. */}
            {customer.email && (
              <div className="mobile-contact">
                <Mail size={15} />
                {customer.email}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  )
}