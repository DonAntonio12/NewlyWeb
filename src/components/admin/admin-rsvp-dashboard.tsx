"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, LogOut, RefreshCw, Sprout } from "lucide-react";
import Link from "next/link";
import { AdminGuestPhotoQueue } from "@/components/admin/admin-guest-photo-queue";
import type { AdminRsvp } from "@/lib/admin-rsvps";

type DashboardState = "loading" | "signed-out" | "signed-in" | "error";
type ApiResult = {
  error?: string;
  success?: boolean;
  rsvps?: AdminRsvp[];
  total?: number;
  attending?: number;
  declining?: number;
};

type RsvpPageResult =
  | { authenticated: false }
  | {
      authenticated: true;
      rsvps: AdminRsvp[];
      total: number;
      attending: number;
      declining: number;
    };

const PAGE_SIZE = 50;

async function fetchRsvpPage(requestedPage: number): Promise<RsvpPageResult> {
  const response = await fetch(`/api/admin/rsvps?page=${requestedPage}`, { cache: "no-store" });
  const result = (await response.json()) as ApiResult;

  if (response.status === 401) {
    return { authenticated: false };
  }

  if (
    !response.ok ||
    !result.rsvps ||
    typeof result.total !== "number" ||
    typeof result.attending !== "number" ||
    typeof result.declining !== "number"
  ) {
    throw new Error(result.error ?? "Hindi ma-load ang mga RSVP. Subukan ulit.");
  }

  return {
    authenticated: true,
    rsvps: result.rsvps,
    total: result.total,
    attending: result.attending,
    declining: result.declining,
  };
}

export function AdminRsvpDashboard() {
  const [state, setState] = useState<DashboardState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [rsvps, setRsvps] = useState<AdminRsvp[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [attendingCount, setAttendingCount] = useState(0);
  const [decliningCount, setDecliningCount] = useState(0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadRsvps = useCallback(async (requestedPage: number) => {
    try {
      const result = await fetchRsvpPage(requestedPage);
      setErrorMessage("");

      if (!result.authenticated) {
        setState("signed-out");
        return;
      }

      setRsvps(result.rsvps);
      setTotal(result.total);
      setAttendingCount(result.attending);
      setDecliningCount(result.declining);
      setPage(requestedPage);
      setState("signed-in");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error to load RSVPs. Try again.",
      );
      setState("error");
    }
  }, []);

  useEffect(() => {
    let active = true;

    void fetchRsvpPage(1)
      .then((result) => {
        if (!active) {
          return;
        }

        if (!result.authenticated) {
          setState("signed-out");
          return;
        }

        setRsvps(result.rsvps);
        setTotal(result.total);
        setAttendingCount(result.attending);
        setDecliningCount(result.declining);
        setPage(1);
        setState("signed-in");
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Error to load RSVPs. Try again.",
        );
        setState("error");
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        throw new Error(result.error ?? "Hindi makapag-sign in. Subukan ulit.");
      }

      setPassword("");
      await loadRsvps(1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error to sign in. Try again.",
      );
      setState("signed-out");
    }
  }

  async function handleSignOut() {
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });

      if (!response.ok) {
        const result = (await response.json()) as ApiResult;
        throw new Error(result.error ?? "Error to sign out. Try again.");
      }

      setRsvps([]);
      setTotal(0);
      setAttendingCount(0);
      setDecliningCount(0);
      setState("signed-out");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error to sign out. Try again.");
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <Link className="admin-back-link" href="/">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Wedding website</span>
        </Link>
        <span className="admin-brand">
          <Sprout size={16} aria-hidden="true" />
          K &amp; D
        </span>
      </div>

      <section className="admin-content" aria-labelledby="admin-title">
        <p className="admin-eyebrow">Wedding dashboard</p>
        <h1 id="admin-title">Guest RSVPs</h1>
        <p className="admin-intro">A private overview of the guests who have replied.</p>

        {state === "loading" && (
          <p className="admin-message" role="status">
            Loading RSVPs…
          </p>
        )}

        {state === "signed-out" && (
          <form className="admin-login" onSubmit={handleSignIn}>
            <label htmlFor="admin-password">Admin password</label>
            <input
              autoComplete="current-password"
              id="admin-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            {errorMessage && (
              <p className="admin-error" role="alert">
                {errorMessage}
              </p>
            )}
            <button className="admin-primary-button" type="submit">
              Sign in
            </button>
          </form>
        )}

        {state === "error" && (
          <div className="admin-error-panel">
            <p className="admin-error" role="alert">
              {errorMessage}
            </p>
            <button className="admin-outline-button" onClick={() => void loadRsvps(page)} type="button">
              Try again
            </button>
          </div>
        )}

        {state === "signed-in" && (
          <>
            <div className="admin-toolbar">
              <span>{total} responses</span>
              <div>
                <button
                  aria-label="Refresh RSVPs"
                  className="admin-icon-button"
                  onClick={() => void loadRsvps(page)}
                  type="button"
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Refresh
                </button>
                <button className="admin-icon-button" onClick={handleSignOut} type="button">
                  <LogOut size={15} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="admin-error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="admin-summary" aria-label="RSVP summary">
              <article className="admin-stat">
                <span>Total replies</span>
                <strong>{total}</strong>
              </article>
              <article className="admin-stat">
                <span>Joyfully accepts</span>
                <strong>{attendingCount}</strong>
              </article>
              <article className="admin-stat">
                <span>Regretfully declines</span>
                <strong>{decliningCount}</strong>
              </article>
            </div>

            {rsvps.length === 0 ? (
              <div className="admin-empty">No RSVPs found.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Guest</th>
                      <th scope="col">Attendance</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Questions/Message</th>
                      <th scope="col">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((rsvp) => (
                      <tr key={rsvp.id}>
                        <th scope="row">{rsvp.guest_name}</th>
                        <td>
                          <span
                            className={`admin-response ${rsvp.attending ? "is-attending" : "is-declining"}`}
                          >
                            {rsvp.attending ? "Attending" : "Declined"}
                          </span>
                        </td>
                        <td>{rsvp.contact || "—"}</td>
                        <td className="admin-question">{rsvp.questions || "—"}</td>
                        <td>
                          <time dateTime={rsvp.submitted_at}>
                            {new Date(rsvp.submitted_at).toLocaleString()}
                          </time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pageCount > 1 && (
              <nav className="admin-pagination" aria-label="RSVP pages">
                <button
                  className="admin-outline-button"
                  disabled={page === 1}
                  onClick={() => void loadRsvps(page - 1)}
                  type="button"
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                  Previous
                </button>
                <span>
                  Page {page} of {pageCount}
                </span>
                <button
                  className="admin-outline-button"
                  disabled={page === pageCount}
                  onClick={() => void loadRsvps(page + 1)}
                  type="button"
                >
                  Next
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </nav>
            )}

            <AdminGuestPhotoQueue />
          </>
        )}
      </section>
    </main>
  );
}
