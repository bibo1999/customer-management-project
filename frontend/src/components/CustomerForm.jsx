import { useEffect, useState } from 'react'
import { LoaderCircle, Save, UserRoundPlus, X } from 'lucide-react'

// Default values used when creating a new customer or resetting the form.
const emptyForm = { fullName: '', phone: '', email: '' }

export default function CustomerForm({ customer, onSave, onCancel, saving }) {
  // Holds the current values of the controlled form inputs.
  const [form, setForm] = useState(emptyForm)

  // Stores the first validation error found during submission.
  const [validationError, setValidationError] = useState('')

  /**
   * Initializes the form whenever the selected customer changes.
   * Existing customer data is loaded in edit mode; otherwise, the form is
   * initialized with empty values for creating a new customer.
   */
  useEffect(() => {
    setForm(
      customer
        ? {
            fullName: customer.fullName ?? '',
            phone: customer.phone ?? '',
            email: customer.email ?? '',
          }
        : emptyForm
    )

    // Clear validation messages when switching between customers or modes.
    setValidationError('')
  }, [customer])

  /**
   * Updates the input that changed while preserving the other field values.
   * Also clears the previous validation message so the user can try again.
   */
  function handleChange(event) {
    const { name, value } = event.target

    setForm(current => ({ ...current, [name]: value }))

    if (validationError) {
      setValidationError('')
    }
  }

  /**
   * Validates the form and sends the cleaned customer data to the parent.
   * The parent component handles the API request and reports save failures.
   */
  async function handleSubmit(event) {
    // Prevent the browser from performing a full page form submission.
    event.preventDefault()

    // Validate the name after trimming leading and trailing whitespace.
    if (form.fullName.trim().length < 2) {
      setValidationError('Name must contain at least 2 characters.')
      return
    }

    // Require a phone number with at least six non-whitespace characters.
    if (form.phone.trim().length < 6) {
      setValidationError('Enter a valid phone number (at least 6 characters).')
      return
    }

    // Email is optional, but if supplied, it must match the expected format.
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setValidationError('Enter a valid email address.')
      return
    }

    // Pass cleaned values to the parent component for creating or updating.
    // Convert an empty optional email to null for the API.
    // Keep the current form values so they remain available if saving fails.
    await onSave({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
    })
  }

  return (
    <form className="customer-form" onSubmit={handleSubmit} noValidate>
      {/* Form heading changes according to whether a customer is being edited. */}
      <div className="form-heading">
        <div className="form-icon">
          <UserRoundPlus size={19} />
        </div>

        <div>
          <h2>{customer ? 'Edit customer' : 'Add a customer'}</h2>
          <p>
            {customer
              ? 'Update the customer details below.'
              : 'Enter the details to create a customer record.'}
          </p>
        </div>

        {/* The close button is shown only when editing an existing customer. */}
        {customer && (
          <button
            className="icon-button close-form"
            type="button"
            onClick={onCancel}
            aria-label="Cancel editing"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Full name field */}
      <label htmlFor="fullName">
        Full name <span>*</span>
      </label>
      <input
        id="fullName"
        name="fullName"
        value={form.fullName}
        onChange={handleChange}
        placeholder="e.g. Ahmed Mohamed"
        maxLength={100}
        required
        disabled={saving}
      />

      {/* Phone number field */}
      <label htmlFor="phone">
        Phone number <span>*</span>
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        placeholder="e.g. 01012345678"
        maxLength={30}
        required
        disabled={saving}
      />

      {/* Email is optional; the API receives null when the field is empty. */}
      <label htmlFor="email">
        Email address <small>Optional</small>
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="name@example.com"
        maxLength={150}
        disabled={saving}
      />

      {/* role="alert" helps assistive technologies announce validation errors. */}
      {validationError && (
        <p className="form-error" role="alert">
          {validationError}
        </p>
      )}

      <div className="form-actions">
        {/* Cancel exits edit mode without submitting the form. */}
        {customer && (
          <button
            className="button button-secondary"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        )}

        {/* Disable submission while saving to prevent duplicate requests. */}
        <button
          className="button button-primary save-button"
          type="submit"
          disabled={saving}
        >
          {saving ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Save size={17} />
          )}

          {saving
            ? 'Saving…'
            : customer
              ? 'Save changes'
              : 'Add customer'}
        </button>
      </div>
    </form>
  )
}