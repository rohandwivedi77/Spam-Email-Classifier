import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://spam-email-classifier-fekr.onrender.com";
const SESSION_STORAGE_KEY = "verishield_session_id";

// The backend returns the session ID in the URL fragment after OAuth.
// Fragments are not sent to the server in HTTP requests. Keep the ID in
// sessionStorage (this browser tab only) and send it in X-Session-ID headers.
const readSessionId = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const authRequestConfig = () => {
  const sessionId = readSessionId();
  return sessionId ? { headers: { "X-Session-ID": sessionId } } : { headers: {} };
};

const GmailScanner = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Gmail connection state
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [connectionError, setConnectionError] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  // Capture the session ID returned after Google OAuth, remove it from the
  // visible URL, then ask the backend whether Gmail is connected.
  useEffect(() => {
    const checkGmailConnection = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const returnedSessionId = hashParams.get("session_id");

        if (returnedSessionId) {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, returnedSessionId);
          // Remove the sensitive fragment from the address bar/history entry.
          window.history.replaceState(
            null,
            document.title,
            `${window.location.pathname}${window.location.search}`
          );
        }

        const response = await axios.get(
          `${API_BASE}/auth/status`,
          authRequestConfig()
        );

        setGmailConnected(Boolean(response.data.connected));
        setGmailEmail(response.data.email || "");

        if (!response.data.connected && readSessionId()) {
          // Do not keep a stale session ID if the backend no longer recognizes it.
          window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (err) {
        console.error("Gmail status error:", err);
        setGmailConnected(false);
        setGmailEmail("");
      } finally {
        setCheckingConnection(false);
      }
    };

    checkGmailConnection();
  }, []);

  const connectGmail = () => {
    // Use browser navigation so the Google OAuth redirect can complete.
    window.location.href = `${API_BASE}/auth/google`;
  };

  const disconnectGmail = async () => {
    setDisconnecting(true);
    setConnectionError("");

    try {
      await axios.post(
        `${API_BASE}/auth/disconnect`,
        {},
        authRequestConfig()
      );

      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setGmailConnected(false);
      setGmailEmail("");
      setEmails([]);
      setNextPageToken(null);
      setSelectedEmail(null);
      setFilter("All");
    } catch (err) {
      console.error("Gmail disconnect error:", err);
      setConnectionError("Unable to disconnect Gmail. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  };

  // =========================
  // SCAN GMAIL
  // =========================
  const scanEmails = async () => {
    console.log("Scan Gmail clicked");

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE}/gmail/emails`,
        {
          params: {
            max_results: 5,
            query: searchQuery.trim() || undefined,
          },
          ...authRequestConfig(),
        }
      );

      console.log("Gmail response:", response.data);

      setEmails(response.data.emails || []);
      setNextPageToken(response.data.next_page_token || null);
      setFilter("All");
    } catch (err) {
      console.error("Gmail error:", err);

      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Could not fetch Gmail emails. Reconnect Gmail and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD MORE EMAILS
  // =========================

  const loadMoreEmails = async () => {
  if (!nextPageToken || loadingMore) {
    return;
  }

  setLoadingMore(true);
  setError("");

  try {
    const response = await axios.get(
      `${API_BASE}/gmail/emails`,
      {
        params: {
          max_results: 5,
          page_token: nextPageToken,
        },
        ...authRequestConfig(),
      }
    );

    setEmails((previousEmails) => [
      ...previousEmails,
      ...(response.data.emails || []),
    ]);

    setNextPageToken(
      response.data.next_page_token || null
    );

  } catch (err) {
    console.error("Load more error:", err);
    const detail = err.response?.data?.detail;
    setError(typeof detail === "string" ? detail : "Failed to load more emails.");
  } finally {
    setLoadingMore(false);
  }
};

  // =========================
  // FILTER EMAILS
  // =========================
  const filteredEmails =
    filter === "All"
      ? emails
      : emails.filter((email) => email.prediction === filter);

  // =========================
  // TRUST SCORE
  // =========================
  const getTrustScore = (email) => {
    if (email.prediction === "Spam") {
      return Math.round((1 - email.confidence) * 100);
    }

    return Math.round(email.confidence * 100);
  };

  // =========================
  // TRUST SCORE LABEL
  // =========================
  const getTrustLabel = (score) => {
    if (score >= 80) {
      return "Highly Trustworthy";
    }

    if (score >= 60) {
      return "Mostly Trustworthy";
    }

    if (score >= 40) {
      return "Suspicious";
    }

    return "High Risk";
  };

  return (
    <>
      {/* =====================================================
          GMAIL SCANNER
      ====================================================== */}

      <section className="gmail-scanner relative z-50 mx-auto my-10 w-full max-w-5xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">

          {/* ================= HEADER ================= */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                  📧
                </div>

                <h2 className="text-2xl font-bold text-white">
                  Gmail Spam Scanner
                </h2>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                Scan your recent Gmail messages using the VeriShield AI
                spam detection model.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {checkingConnection ? (
                <span className="text-sm text-gray-400">
                  Checking Gmail connection...
                </span>
              ) : gmailConnected ? (
                <>
                  <div className="text-sm text-green-400">
                    ✓ Connected{gmailEmail ? `: ${gmailEmail}` : ""}
                  </div>

                  <button
                    type="button"
                    onClick={disconnectGmail}
                    disabled={disconnecting}
                    className="cursor-pointer rounded-lg border border-red-500/30 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {disconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>

                  <button
                    type="button"
                    onClick={scanEmails}
                    disabled={loading}
                    className="gmail-action-button relative z-50 cursor-pointer rounded-lg px-6 py-3 font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Scanning..." : "Scan Gmail"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={connectGmail}
                  className="gmail-action-button cursor-pointer rounded-lg px-6 py-3 font-semibold text-white transition duration-200"
                >
                  Connect Gmail
                </button>
              )}
            </div>

          </div>

          {/* ================= CONNECTION ERROR ================= */}
          {connectionError && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{connectionError}</p>
            </div>
          )}

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}
          {/* ================= SEARCH ================= */}
                  
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  scanEmails();
                }
              }}
              placeholder="Search emails by sender, subject, or keyword..."
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500/50"
            />
          
            <button
              type="button"
              onClick={scanEmails}
              disabled={loading}
              className="gmail-action-button cursor-pointer rounded-lg px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            
          </div>          
          {/* ================= FILTERS ================= */}

          {emails.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">

              {["All", "Spam", "Ham"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === type
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {type}
                </button>
              ))}

            </div>
          )}

          {/* ================= EMAIL COUNT ================= */}

          {emails.length > 0 && (
            <p className="mt-6 text-sm text-gray-400">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredEmails.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {emails.length}
              </span>{" "}
              emails
            </p>
          )}

          {/* ================= EMAIL LIST ================= */}

          <div className="mt-4 space-y-4">

            {filteredEmails.map((email) => (

              <div
                key={email.id}
                className="rounded-xl border border-white/10 bg-black/20 p-5 transition duration-200 hover:border-purple-500/30 hover:bg-black/30"
              >

                {/* TOP SECTION */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0">

                    <h3 className="truncate text-lg font-semibold text-white">
                      {email.subject || "(No Subject)"}
                    </h3>

                    <p className="mt-1 truncate text-sm text-gray-400">
                      From: {email.sender || "Unknown sender"}
                    </p>

                  </div>

                  {/* CLASSIFICATION */}

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                      email.prediction === "Spam"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-green-500/10 text-green-400"
                    }`}
                  >
                    {email.prediction}
                  </span>

                </div>

                {/* EMAIL PREVIEW */}

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-400">
                  {email.body || "No message body available."}
                </p>

                {/* BOTTOM */}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  {/* CONFIDENCE */}

                  <div className="flex items-center gap-2 text-sm">

                    <span className="text-gray-500">
                      AI Confidence
                    </span>

                    <span className="font-semibold text-white">
                      {(email.confidence * 100).toFixed(2)}%
                    </span>

                  </div>

                  {/* VIEW ANALYSIS */}

                  <button
                    type="button"
                    onClick={() => setSelectedEmail(email)}
                    className="cursor-pointer rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition duration-200 hover:bg-purple-500/20"
                  >
                    View Analysis
                  </button>

                </div>

              </div>

            ))}

          </div>
          
          {emails.length > 0 && nextPageToken && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={loadMoreEmails}
                disabled={loadingMore}
                className="cursor-pointer rounded-lg border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
              {loadingMore ? "Loading..." : "Load More Emails"}
              </button>
            </div>
      )}
          {/* ================= EMPTY STATE ================= */}

          {!loading &&
            emails.length === 0 &&
            !error && (
              <div className="mt-8 rounded-xl border border-dashed border-white/10 p-10 text-center">

                <div className="text-4xl">
                  📬
                </div>

                <p className="mt-4 text-gray-400">
                  No emails scanned yet.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Click "Scan Gmail" to analyze your recent emails.
                </p>

              </div>
            )}

          {/* ================= NO FILTER RESULTS ================= */}

          {!loading &&
            emails.length > 0 &&
            filteredEmails.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed border-white/10 p-10 text-center">

                <p className="text-gray-400">
                  No {filter.toLowerCase()} emails found.
                </p>

              </div>
            )}

        </div>
      </section>

      {/* =====================================================
          EMAIL ANALYSIS MODAL
      ====================================================== */}

      {selectedEmail && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedEmail(null)}
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* ================= MODAL HEADER ================= */}

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-sm font-medium text-purple-400">
                  VeriShield AI
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Email Analysis
                </h2>

              </div>

              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="cursor-pointer rounded-lg bg-white/10 px-3 py-2 text-gray-300 transition hover:bg-white/20"
              >
                ✕
              </button>

            </div>

            {/* ================= SUBJECT ================= */}

            <div className="mt-6">

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Subject
              </p>

              <h3 className="mt-2 text-xl font-semibold text-white">
                {selectedEmail.subject || "(No Subject)"}
              </h3>

            </div>

            {/* ================= SENDER ================= */}

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Sender
              </p>

              <p className="mt-2 break-all text-sm text-gray-200">
                {selectedEmail.sender || "Unknown sender"}
              </p>

            </div>

            {/* =================================================
                CLASSIFICATION + CONFIDENCE
            ================================================== */}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              {/* CLASSIFICATION */}

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">

                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Classification
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${
                    selectedEmail.prediction === "Spam"
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {selectedEmail.prediction}
                </p>

              </div>

              {/* CONFIDENCE */}

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">

                <p className="text-xs uppercase tracking-wider text-gray-500">
                  AI Confidence
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {(selectedEmail.confidence * 100).toFixed(2)}%
                </p>

              </div>

            </div>

            {/* =================================================
                CONFIDENCE BAR
            ================================================== */}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">

              <div className="flex items-center justify-between">

                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Model Confidence
                </p>

                <p className="font-bold text-white">
                  {(selectedEmail.confidence * 100).toFixed(2)}%
                </p>

              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">

                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    selectedEmail.prediction === "Spam"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${selectedEmail.confidence * 100}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                This represents how strongly the machine learning
                model supports its classification.
              </p>

            </div>

            {/* =================================================
                TRUST SCORE
            ================================================== */}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    VeriShield Trust Score
                  </p>

                  <div className="mt-2 flex items-end gap-2">

                    <span className="text-4xl font-bold text-white">
                      {getTrustScore(selectedEmail)}
                    </span>

                    <span className="mb-1 text-gray-500">
                      / 100
                    </span>

                  </div>

                </div>

                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    getTrustScore(selectedEmail) >= 80
                      ? "bg-green-500/10 text-green-400"
                      : getTrustScore(selectedEmail) >= 60
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {getTrustLabel(getTrustScore(selectedEmail))}
                </div>

              </div>

              {/* TRUST BAR */}

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">

                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    getTrustScore(selectedEmail) >= 80
                      ? "bg-green-500"
                      : getTrustScore(selectedEmail) >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${getTrustScore(selectedEmail)}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-sm leading-6 text-gray-400">

                {selectedEmail.prediction === "Spam"
                  ? "The message has been classified as spam. The trust score decreases as the model becomes more confident that the message is spam."
                  : "The message has been classified as legitimate. The trust score reflects the model's confidence in the Ham classification."}

              </p>

            </div>

            {/* =================================================
                EMAIL CONTENT
            ================================================== */}

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-5">

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Email Content
              </p>

              <div className="mt-4 max-h-80 overflow-y-auto rounded-lg bg-black/20 p-4">

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-300">
                  {selectedEmail.body ||
                    "No message body available."}
                </p>

              </div>

            </div>

            {/* =================================================
                MODEL INFORMATION
            ================================================== */}

            <div className="mt-4 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Model Information
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                This result was generated using the VeriShield AI
                spam classification pipeline with TF-IDF text
                features and an Extra Trees machine learning model.
              </p>

            </div>

            {/* ================= CLOSE BUTTON ================= */}

            <button
              type="button"
              onClick={() => setSelectedEmail(null)}
              className="mt-6 w-full cursor-pointer rounded-lg bg-purple-600 py-3 font-semibold text-white transition duration-200 hover:bg-purple-700"
            >
              Close Analysis
            </button>

          </div>

        </div>

      )}

    </>
  );
};

export default GmailScanner;