import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function App() {
  const [activeTab, setActiveTab] = useState("send");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Convert the recipient textarea into an array
  const getRecipients = () => {
    return recipients
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter(Boolean);
  };

  // Send email
  const sendEmail = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const recipientList = getRecipients();

    // Frontend validation
    if (
      !subject.trim() ||
      !body.trim() ||
      recipientList.length === 0
    ) {
      setMessage(
        "Please enter subject, email body and at least one recipient."
      );
      setMessageType("error");
      return;
    }

    setSending(true);

    try {
      const response = await axios.post(
        `${API_URL}/emails/send`,
        {
          subject: subject,
          body: body,
          recipients: recipientList,
        }
      );

      setMessage(response.data.message);
      setMessageType("success");

      // Clear form after successful sending
      setSubject("");
      setBody("");
      setRecipients("");

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to send email. Make sure the backend is running."
      );

      setMessageType("error");

    } finally {
      setSending(false);
    }
  };

  // Load email history
  const loadHistory = async () => {
    setLoadingHistory(true);

    try {
      const response = await axios.get(
        `${API_URL}/emails/history`
      );

      setHistory(response.data.emails);

    } catch (error) {
      console.error(error);

      setMessage("Could not load email history.");
      setMessageType("error");

    } finally {
      setLoadingHistory(false);
    }
  };

  // Load history when History tab is opened
  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="header-content">

          <h1>📧 Bulk Mail</h1>

          <p>
            Send emails to multiple recipients from one dashboard.
          </p>

        </div>
      </header>


      {/* NAVIGATION */}
      <nav className="tabs">

        <button
          className={activeTab === "send" ? "active" : ""}
          onClick={() => {
            setActiveTab("send");
            setMessage("");
          }}
        >
          ✉ Send Mail
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => {
            setActiveTab("history");
            setMessage("");
          }}
        >
          📜 Email History
        </button>

      </nav>


      {/* MAIN CONTENT */}
      <main className="container">

        {/* SUCCESS / ERROR MESSAGE */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}


        {/* SEND MAIL PAGE */}
        {activeTab === "send" ? (

          <form
            className="card"
            onSubmit={sendEmail}
          >

            <h2>Compose Email</h2>

            <p className="subtitle">
              Create your message and send it to multiple recipients.
            </p>


            {/* SUBJECT */}
            <label>
              Subject
            </label>

            <input
              type="text"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
            />


            {/* RECIPIENTS */}
            <label>
              Recipient Emails
            </label>

            <textarea
              rows="5"
              placeholder={`Enter multiple email addresses

example@gmail.com
student@gmail.com
admin@gmail.com`}
              value={recipients}
              onChange={(e) =>
                setRecipients(e.target.value)
              }
            />

            <small>
              Separate multiple emails using commas,
              semicolons or new lines.
            </small>


            {/* EMAIL BODY */}
            <label>
              Email Body
            </label>

            <textarea
              rows="10"
              placeholder="Write your email message..."
              value={body}
              onChange={(e) =>
                setBody(e.target.value)
              }
            />


            {/* SEND BUTTON */}
            <button
              className="send-button"
              type="submit"
              disabled={sending}
            >

              {sending
                ? "Sending..."
                : "🚀 Send Bulk Mail"}

            </button>

          </form>

        ) : (

          /* EMAIL HISTORY PAGE */

          <section className="card">

            <div className="history-header">

              <div>
                <h2>Email History</h2>

                <p className="subtitle">
                  View your previously sent emails.
                </p>
              </div>

              <button
                className="refresh-button"
                onClick={loadHistory}
              >
                🔄 Refresh
              </button>

            </div>


            {/* LOADING */}
            {loadingHistory ? (

              <div className="loading">
                Loading email history...
              </div>

            ) : history.length === 0 ? (

              /* EMPTY */
              <div className="empty">

                <div className="empty-icon">
                  📭
                </div>

                <h3>No emails yet</h3>

                <p>
                  Emails you send will appear here.
                </p>

              </div>

            ) : (

              /* HISTORY LIST */

              <div className="history-list">

                {history.map((email) => (

                  <article
                    className="history-item"
                    key={email._id}
                  >

                    <div className="history-top">

                      <h3>
                        {email.subject}
                      </h3>

                      <span
                        className={`status ${email.status}`}
                      >
                        {email.status}
                      </span>

                    </div>


                    <p>
                      <strong>
                        Recipients:
                      </strong>{" "}

                      {email.recipients.join(", ")}

                    </p>


                    <div className="body-preview">
                      {email.body}
                    </div>


                    <small>
                      Sent on:{" "}
                      {new Date(
                        email.createdAt
                      ).toLocaleString()}
                    </small>


                    {/* ERROR DETAILS */}

                    {email.error && (

                      <p className="error-text">

                        Error: {email.error}

                      </p>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default App;