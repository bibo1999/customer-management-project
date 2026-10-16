import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  CirclePlus,
  ContactRound,
  Search,
  Users,
  X,
} from 'lucide-react'

import { customerService } from './services/customerService'
import CustomerForm from './components/CustomerForm'
import CustomerTable from './components/CustomerTable'

export default function App() {
  // Stores the customer records currently displayed in the directory.
  const [customers, setCustomers] = useState([])

  // Search term entered by the user. Changes trigger a new API request.
  const [search, setSearch] = useState('')

  // Tracks whether the customer list is currently being fetched.
  const [loading, setLoading] = useState(true)

  // Stores errors related to loading or deleting customers.
  const [loadError, setLoadError] = useState('')

  // Stores errors that occur when creating or updating a customer.
  const [saveError, setSaveError] = useState('')

  // Displays feedback after a successful create, update, or delete operation.
  const [successMessage, setSuccessMessage] = useState('')

  // Holds the selected customer while editing. Null means create mode.
  const [editingCustomer, setEditingCustomer] = useState(null)

  // Prevents duplicate form submissions while a save request is in progress.
  const [saving, setSaving] = useState(false)

  // Tracks which customer is currently being deleted.
  const [deletingId, setDeletingId] = useState(null)

  // Controls whether the create/edit form is visible.
  const [showForm, setShowForm] = useState(false)

  // Incrementing this value triggers the customer list to reload.
  const [refreshKey, setRefreshKey] = useState(0)

  // Keeps track of the latest list request so outdated responses cannot
  // overwrite data returned by a more recent search or refresh.
  const requestId = useRef(0)

  /**
   * Retrieves customers from the API using the supplied search term.
   * AbortSignal allows the request to be cancelled when it is no longer needed.
   */
  const loadCustomers = useCallback(async (term, signal) => {
    // Assign each request a unique, increasing identifier.
    const id = ++requestId.current

    setLoading(true)
    setLoadError('')

    try {
      const data = await customerService.getAll(term, signal)

      // Only apply results from the latest request.
      // This prevents slower, outdated searches from replacing newer results.
      if (id === requestId.current) {
        setCustomers(data)
      }
    } catch (error) {
      // Aborted requests are expected during rapid searches or unmounting.
      // They should not be displayed as errors to the user.
      if (error.name !== 'AbortError' && id === requestId.current) {
        setLoadError(error.message || 'Could not load customers.')
      }
    } finally {
      // Only the latest request should control the loading indicator.
      if (id === requestId.current) {
        setLoading(false)
      }
    }
  }, [])

  /**
   * Loads customers when the search term or refresh key changes.
   * A short debounce reduces unnecessary API calls while the user types.
   */
  useEffect(() => {
    const controller = new AbortController()

    // Wait 300 ms after the latest change before requesting search results.
    const timer = setTimeout(() => {
      loadCustomers(search, controller.signal)
    }, 300)

    // Clear the pending timer and cancel the previous request when the
    // dependencies change or the component is unmounted.
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, refreshKey, loadCustomers])

  /**
   * Creates a customer or updates the selected customer.
   * The form is closed only after the API operation succeeds.
   */
  async function handleSave(payload) {
    setSaving(true)
    setSaveError('')
    setSuccessMessage('')

    try {
      if (editingCustomer) {
        // Update the existing record using its database ID.
        await customerService.update(editingCustomer.id, payload)
        setSuccessMessage('Customer details updated successfully.')
      } else {
        // Create a new customer record.
        await customerService.create(payload)
        setSuccessMessage('Customer added successfully.')
      }

      // Reset the form state only after a successful save.
      setShowForm(false)
      setEditingCustomer(null)
      setSaveError('')

      // Trigger a fresh API request so the directory reflects the changes.
      setRefreshKey(key => key + 1)
    } catch (error) {
      // Keep the form open and preserve its current input values so the
      // user can correct the issue or retry without re-entering everything.
      setSaveError(
        error.message || 'Could not save the customer. Please try again.'
      )
    } finally {
      // Re-enable the form's save action whether the request succeeds or fails.
      setSaving(false)
    }
  }

  /**
   * Opens the form with the selected customer's existing data.
   */
  function startEdit(customer) {
    setEditingCustomer(customer)
    setShowForm(true)

    // Clear messages from previous operations when starting a new edit.
    setSaveError('')
    setSuccessMessage('')

    // Bring the form into view, especially on smaller screens.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Opens a blank form for creating a new customer.
   */
  function startCreate() {
    setEditingCustomer(null)
    setShowForm(true)

    // Clear stale feedback before starting a new operation.
    setSaveError('')
    setSuccessMessage('')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Requests confirmation before deleting a customer.
   * On success, refreshes the list and closes the form if that customer
   * was being edited.
   */
  async function handleDelete(customer) {
    const confirmed = window.confirm(
      `Delete "${customer.fullName}"?\nThis action cannot be undone.`
    )

    // Do not send a delete request if the user cancels the confirmation.
    if (!confirmed) return

    setDeletingId(customer.id)
    setLoadError('')
    setSuccessMessage('')

    try {
      await customerService.remove(customer.id)

      setSuccessMessage(`${customer.fullName} was deleted.`)

      // If the deleted customer is open in the form, close it to avoid
      // editing a record that no longer exists.
      if (editingCustomer?.id === customer.id) {
        setEditingCustomer(null)
        setShowForm(false)
      }

      // Reload the directory to reflect the deletion.
      setRefreshKey(key => key + 1)
    } catch (error) {
      setLoadError(
        error.message || 'Could not delete this customer. Please try again.'
      )
    } finally {
      // Clear the deleting state so the row's action becomes available again.
      setDeletingId(null)
    }
  }

  // Clears the current search and returns the directory to its unfiltered view.
  const clearSearch = () => setSearch('')

  return (
    <div className="app-shell">
      {/* Sidebar navigation and workspace branding */}
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Customer Hub home">
          <span className="brand-mark">
            <ContactRound size={22} />
          </span>
          <span>
            customer<span className="brand-light">hub</span>
            <small>WORKSPACE</small>
          </span>
        </a>

        <div className="sidebar-section-label">WORKSPACE</div>

        <div className="sidebar-link active">
          <Users size={18} />
          <span>Customers</span>
          <span className="nav-count">{customers.length}</span>
        </div>

        <div className="sidebar-footer">
          <div className="status-dot" /> API workspace <span>•</span> v1.0
        </div>
      </aside>

      <main className="main-content">
        {/* Top navigation bar with breadcrumb and database status */}
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Customers</strong>
          </div>

          <div className="topbar-right">
            <span className="api-status">
              <span className="status-dot" /> Customer database
            </span>
            <div className="user-avatar">AM</div>
          </div>
        </header>

        <section className="page-content">
          {/* Page title, current customer count, and create action */}
          <div className="page-heading">
            <div>
              <div className="eyebrow">CUSTOMER RELATIONSHIP MANAGEMENT</div>
              <h1>
                Customers <span className="heading-count">{customers.length}</span>
              </h1>
              <p>Manage your customer records in one place.</p>
            </div>

            <button
              className="button button-primary add-button"
              onClick={startCreate}
            >
              <CirclePlus size={18} /> Add customer
            </button>
          </div>

          {/* Shared feedback area for success messages and API errors */}
          {(successMessage || saveError || loadError) && (
            <div
              className={`notice ${
                saveError || loadError ? 'notice-error' : 'notice-success'
              }`}
              role="status"
            >
              {saveError || loadError ? (
                <AlertCircle size={18} />
              ) : (
                <Check size={18} />
              )}

              <span>{saveError || loadError || successMessage}</span>

              {/* Retry reloads the customer list after a loading/deletion error. */}
              {loadError && (
                <button
                  className="notice-retry"
                  onClick={() => setRefreshKey(key => key + 1)}
                >
                  Retry
                </button>
              )}

              <button
                className="notice-close"
                onClick={() => {
                  setSaveError('')
                  setLoadError('')
                  setSuccessMessage('')
                }}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* The same form component supports both create and edit modes. */}
          {showForm && (
            <section
              className="form-panel"
              aria-label={
                editingCustomer ? 'Edit customer form' : 'Add customer form'
              }
            >
              <CustomerForm
                // Reset form initialization when switching between customers
                // or switching from editing a customer to creating a new one.
                key={editingCustomer?.id ?? 'new-customer'}
                customer={editingCustomer}
                saving={saving}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false)
                  setEditingCustomer(null)
                  setSaveError('')
                }}
              />
            </section>
          )}

          {/* Main customer directory: search, refresh, results, and status states */}
          <section className="data-panel">
            <div className="panel-toolbar">
              <div>
                <h2>All customers</h2>
                <p>View, search, and manage your customer directory.</p>
              </div>

              <div className="toolbar-controls">
                {/* Search is handled by the API, with a debounce in useEffect. */}
                <label className="search-box">
                  <Search size={18} />
                  <input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search name or phone…"
                    aria-label="Search customers by name or phone"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}

                  <kbd>⌘ K</kbd>
                </label>

                {/* Incrementing refreshKey triggers the list-loading effect. */}
                <button
                  className="filter-button"
                  onClick={() => setRefreshKey(key => key + 1)}
                  title="Refresh customers"
                >
                  <ChevronDown size={16} /> Refresh
                </button>
              </div>
            </div>

            {/* Display the appropriate state while retrieving customer records. */}
            {loading ? (
              <div className="loading-state">
                <span className="spinner" />
                <strong>Loading customers…</strong>
                <p>Fetching the latest customer records.</p>
              </div>
            ) : loadError ? (
              <div className="empty-state error-state">
                <div className="empty-icon">
                  <AlertCircle size={25} />
                </div>
                <h3>Couldn’t load customers</h3>
                <p>{loadError}</p>
                <button
                  className="button button-secondary"
                  onClick={() => setRefreshKey(key => key + 1)}
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                {/* Summary of the currently returned search results */}
                <div className="table-summary">
                  <span>
                    <strong>{customers.length}</strong>{' '}
                    {customers.length === 1 ? 'customer' : 'customers'} found
                  </span>
                  <span>
                    Sorted by name <span className="sort-indicator">↑</span>
                  </span>
                </div>

                {/* Table component handles the responsive directory and row actions. */}
                <CustomerTable
                  customers={customers}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              </>
            )}

            {/* Footer identifies the backend and database used by the application. */}
            <footer className="panel-footer">
              <span>
                Customer Hub <span>·</span> Data is stored in SQL Server
              </span>
              <span>Powered by ASP.NET Core</span>
            </footer>
          </section>

          {/* Application footer */}
          <div className="page-footer">
            © 2026 Customer Hub{' '}
            <span>Built for efficient customer management.</span>
          </div>
        </section>
      </main>
    </div>
  )
}