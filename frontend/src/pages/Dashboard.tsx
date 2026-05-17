import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

type Lead = {
  _id: string;
  name: string;
  email: string;
  status: "New" | "Contacted" | "Qualified" | "Lost";
  source: "Website" | "Instagram" | "Referral";
  createdAt: string;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const [darkMode, setDarkMode] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Lead["status"]>("New");
  const [source, setSource] = useState<Lead["source"]>("Website");
  const [saving, setSaving] = useState(false);

  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const res = await api.get("/leads", {
        params: {
          search,
          status: filterStatus,
          source: filterSource,
          page,
          limit: 5,
        },
      });

      setLeads(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setMessage("");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search, filterStatus, filterSource]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setStatus("New");
    setSource("Website");
    setEditingLead(null);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      setMessage("Sales users cannot perform this action.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, {
          name,
          email,
          status,
          source,
        });
        setMessage("Lead updated successfully");
      } else {
        await api.post("/leads", {
          name,
          email,
          status,
          source,
        });
        setMessage("Lead created successfully");
      }

      resetForm();
      await fetchLeads();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (lead: Lead) => {
    if (!isAdmin) return;

    setEditingLead(lead);
    setName(lead.name);
    setEmail(lead.email);
    setStatus(lead.status);
    setSource(lead.source);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      setMessage("Sales users cannot perform this action.");
      return;
    }

    const ok = window.confirm("Delete this lead?");
    if (!ok) return;

    try {
      await api.delete(`/leads/${id}`);
      setMessage("Lead deleted successfully");
      await fetchLeads();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleExportCSV = async () => {
    if (!isAdmin) {
      setMessage("Sales users cannot export CSV.");
      return;
    }

    try {
      const res = await api.get("/leads/export/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "leads.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to export CSV");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: darkMode ? "black" : "white",
        color: darkMode ? "white" : "black",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 34, margin: 0, color: darkMode ? "white" : "black" }}>
            Dashboard
          </h1>
          <p style={{ marginTop: 8 }}>
            Logged in as {user?.name} ({user?.role})
          </p>

          {!isAdmin && (
            <p style={{ marginTop: 6, color: darkMode ? "#cbd5e1" : "#334155" }}>
              Sales users can only view leads.
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "10px 18px",
              background: darkMode ? "#ffffff" : "#222222",
              color: darkMode ? "#000000" : "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "14px 24px",
              background: "white",
              color: "black",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {isAdmin && (
        <form
          onSubmit={handleCreateOrUpdate}
          style={{
            display: "grid",
            gap: 12,
            maxWidth: 420,
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
            background: "white",
            color: "black",
            boxShadow: "0 0 16px rgba(0,0,0,0.25)",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {editingLead ? "Edit Lead" : "Create Lead"}
          </h2>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: 10,
              background: "#d1d5db",
              border: "none",
              borderRadius: "6px",
            }}
          />

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 10,
              background: "#d1d5db",
              border: "none",
              borderRadius: "6px",
            }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Lead["status"])}
            style={{
              padding: 10,
              background: "#d1d5db",
              border: "none",
              borderRadius: "6px",
            }}
          >
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Lost</option>
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value as Lead["source"])}
            style={{
              padding: 10,
              background: "#d1d5db",
              border: "none",
              borderRadius: "6px",
            }}
          >
            <option>Website</option>
            <option>Instagram</option>
            <option>Referral</option>
          </select>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: 10,
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : editingLead ? "Update Lead" : "Create Lead"}
            </button>

            {editingLead && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: 10,
                  background: "#444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search by name/email"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          style={{
            padding: 10,
            background: "#d1d5db",
            border: "none",
            borderRadius: "6px",
          }}
        />

        <select
          value={filterStatus}
          onChange={(e) => {
            setPage(1);
            setFilterStatus(e.target.value);
          }}
          style={{
            padding: 10,
            background: "#d1d5db",
            border: "none",
            borderRadius: "6px",
          }}
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={filterSource}
          onChange={(e) => {
            setPage(1);
            setFilterSource(e.target.value);
          }}
          style={{
            padding: 10,
            background: "#d1d5db",
            border: "none",
            borderRadius: "6px",
          }}
        >
          <option value="">All Source</option>
          <option value="Website">Website</option>
          <option value="Instagram">Instagram</option>
          <option value="Referral">Referral</option>
        </select>

        {isAdmin && (
          <button
            onClick={handleExportCSV}
            style={{
              padding: 10,
              marginLeft: 10,
              background: "yellow",
              color: "black",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
        )}

        <button
          onClick={fetchLeads}
          style={{
            padding: 10,
            marginBottom: 0,
            background: "yellow",
            color: "black",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Reload Leads
        </button>
      </div>

      {loading && <p>Loading leads...</p>}
      {message && <p>{message}</p>}

      {!loading && leads.length === 0 && <p>No leads found.</p>}

      {!loading && leads.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 12px",
            background: "white",
            color: "black",
            borderRadius: "12px",
            overflow: "hidden",
            padding: "10px",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Source</th>
              <th style={{ padding: "14px 20px", textAlign: "left" }}>Created</th>
              {isAdmin && (
                <th style={{ padding: "14px 20px", textAlign: "left" }}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead._id}
                style={{
                  background: darkMode ? "#2f2f2f" : "#f5f5f5",
                  color: darkMode ? "white" : "black",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <td
                  style={{
                    padding: "14px 20px",
                    background: darkMode ? "#2f2f2f" : "#f5f5f5",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                  }}
                >
                  {lead.name}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    background: darkMode ? "#2f2f2f" : "#f5f5f5",
                  }}
                >
                  {lead.email}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    background: darkMode ? "#2f2f2f" : "#f5f5f5",
                  }}
                >
                  {lead.status}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    background: darkMode ? "#2f2f2f" : "#f5f5f5",
                  }}
                >
                  {lead.source}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    background: darkMode ? "#2f2f2f" : "#f5f5f5",
                  }}
                >
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>

                {isAdmin && (
                  <td
                    style={{
                      padding: "14px 20px",
                      background: darkMode ? "#2f2f2f" : "#f5f5f5",
                      display: "flex",
                      gap: "10px",
                      borderTopRightRadius: "10px",
                      borderBottomRightRadius: "10px",
                    }}
                  >
                    <button
                      onClick={() => startEdit(lead)}
                      style={{
                        background: "blue",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(lead._id)}
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          style={{
            padding: "10px 14px",
            background: "white",
            color: "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={{
            padding: "10px 14px",
            background: "white",
            color: "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}