import { useState, useEffect } from "react";
import "../page/UpiManagement.css";

export default function UpiManagement() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [upiList, setUpiList] = useState([]);
  const [upi, setUpi] = useState("");
  const [bank, setBank] = useState("");
  const [userName, setUserName] = useState("");
  const [mobile, setMobile] = useState("");
  const [reference, setReference] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const bankNames = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank",
    "Kotak Mahindra Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "IndusInd Bank",
  ];

  // ===== FETCH UPI LIST =====
  const fetchUpis = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/upi`);
      const data = await res.json();
      setUpiList(data.upis || []);
    } catch (err) {
      console.error("Error fetching UPIs:", err);
    }
  };

  useEffect(() => {
    fetchUpis();
  }, []);

  // ===== FIELD VALIDATION =====
  const validateField = (field, value) => {
    let error = "";

    if (field === "upi") {
      const upiRegex = /^[\w.-]+@[\w]+$/;
      if (!value.trim()) error = "UPI ID is required";
      else if (!upiRegex.test(value)) error = "Invalid UPI ID format";
    }

    if (field === "bank") {
      if (!value.trim()) error = "Bank name is required";
      else if (!bankNames.includes(value.trim()))
        error = "Enter a valid bank name";
    }

    if (field === "userName") {
      const nameRegex = /^[A-Za-z ]+$/;
      if (!value.trim()) error = "User name is required";
      else if (!nameRegex.test(value))
        error = "User name must contain only letters";
    }

    if (field === "mobile") {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!value.trim()) error = "Mobile number is required";
      else if (!mobileRegex.test(value))
        error = "Enter a valid 10-digit Indian mobile number";
    }

    return error;
  };

  const handleChange = (field, value) => {
    if (field === "upi") setUpi(value);
    if (field === "bank") setBank(value);
    if (field === "userName") setUserName(value);
    if (field === "mobile") setMobile(value);
    if (field === "reference") setReference(value);

    if (touched[field]) {
      setErrors({ ...errors, [field]: validateField(field, value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors({ ...errors, [field]: validateField(field, eval(field)) });
  };

  const isFormValid = () => {
    return (
      !validateField("upi", upi) &&
      !validateField("bank", bank) &&
      !validateField("userName", userName) &&
      !validateField("mobile", mobile)
    );
  };

  // ===== ADD NEW UPI =====
  const handleAdd = async () => {
    if (!isFormValid()) {
      setTouched({ upi: true, bank: true, userName: true, mobile: true });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/admin/upi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upi, bank, userName, mobile, reference }),
      });

      const data = await res.json();

      if (data.success) {
        setUpiList([data.upi, ...upiList]);
        setUpi("");
        setBank("");
        setUserName("");
        setMobile("");
        setReference("");
        setErrors({});
        setTouched({});
      } else {
        alert(data.error || "Failed to add UPI");
      }
    } catch (err) {
      console.error("Add UPI error:", err);
      alert("Something went wrong while adding UPI");
    }
  };

  // ===== DELETE UPI =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this UPI?")) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/upi-delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setUpiList(upiList.filter((upi) => upi._id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting UPI");
    }
  };

  // ===== JSX =====
  return (
    <div className="upi-container">
      <h2>💳 UPI Management</h2>

      {/* ===== Add UPI Form ===== */}
      <div className="upi-form">
        {[
          { field: "upi", placeholder: "Enter UPI ID", value: upi },
          { field: "bank", placeholder: "Enter Bank Name", value: bank, list: "bankList" },
          { field: "userName", placeholder: "Enter User Name", value: userName },
          { field: "mobile", placeholder: "Enter Mobile Number", value: mobile },
          { field: "reference", placeholder: "Reference (Optional)", value: reference },
        ].map((input, idx) => (
          <div key={idx} className="input-group">
            <input
              type="text"
              placeholder={input.placeholder}
              value={input.value}
              onChange={(e) => handleChange(input.field, e.target.value)}
              onBlur={() => handleBlur(input.field)}
              className={errors[input.field] ? "error-input" : ""}
              list={input.list || ""}
            />
            {input.list && (
              <datalist id="bankList">
                {bankNames.map((b, idx) => (
                  <option key={idx} value={b} />
                ))}
              </datalist>
            )}
            {errors[input.field] && touched[input.field] && (
              <span className="error-text">{errors[input.field]}</span>
            )}
          </div>
        ))}

        <div className="button-group">
          <button onClick={handleAdd} disabled={!isFormValid()}>
            Add UPI
          </button>
        </div>
      </div>

      {/* ===== UPI List ===== */}
      <div className="upi-list">
        <table>
          <thead>
            <tr>
              <th>UPI ID</th>
              <th>Bank</th>
              <th>User Name</th>
              <th>Mobile</th>
              <th>Reference</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {upiList.length > 0 ? (
              upiList.map((item) => (
                <tr key={item._id}>
                  <td>{item.upi}</td>
                  <td>{item.bank}</td>
                  <td>{item.userName}</td>
                  <td>{item.mobile}</td>
                  <td>{item.reference || "N/A"}</td>
                  <td className="action-buttons">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No UPI IDs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
