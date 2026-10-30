"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type AdminGuestPhoto = {
  id: string;
  guest_name: string | null;
  content_type: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
};

type PhotoListResponse = {
  error?: string;
  photos?: AdminGuestPhoto[];
  hasMore?: boolean;
};

export function AdminGuestPhotoQueue() {
  const [photos, setPhotos] = useState<AdminGuestPhoto[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkReviewing, setIsBulkReviewing] = useState(false);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);

  const allPhotosSelected =
    !hasMore && photos.length > 0 && photos.every((photo) => selectedIds.includes(photo.id));

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/photos?page=1", { cache: "no-store" });
      const result = (await response.json()) as PhotoListResponse;

      if (!response.ok || !result.photos || typeof result.hasMore !== "boolean") {
        throw new Error(result.error ?? "Guest photos could not be loaded.");
      }

      setPhotos(result.photos);
      setSelectedIds([]);
      setHasMore(result.hasMore);
      setPage(1);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Guest photos could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMorePhotos = useCallback(async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const response = await fetch(`/api/admin/photos?page=${nextPage}`, { cache: "no-store" });
      const result = (await response.json()) as PhotoListResponse;

      if (!response.ok || !result.photos || typeof result.hasMore !== "boolean") {
        throw new Error(result.error ?? "More guest photos could not be loaded.");
      }

      const newPhotos = result.photos;
      setPhotos((currentPhotos) => [...currentPhotos, ...newPhotos]);
      setHasMore(result.hasMore);
      setPage(nextPage);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "More guest photos could not be loaded.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    let active = true;

    void fetch("/api/admin/photos?page=1", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as PhotoListResponse;

        if (!response.ok || !result.photos || typeof result.hasMore !== "boolean") {
          throw new Error(result.error ?? "Guest photos could not be loaded.");
        }

        if (active) {
          setPhotos(result.photos);
          setSelectedIds([]);
          setHasMore(result.hasMore);
          setErrorMessage("");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Guest photos could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function reviewPhoto(id: string, status: "approved" | "rejected") {
    setReviewingId(id);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/photos/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "The photo review could not be updated.");
      }

      setPhotos((currentPhotos) =>
        currentPhotos.map((photo) => (photo.id === id ? { ...photo, status } : photo)),
      );
      setSelectedIds((currentIds) => currentIds.filter((currentId) => currentId !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The photo review could not be updated.",
      );
      await loadPhotos();
    } finally {
      setReviewingId(null);
    }
  }

  async function reviewSelectedPhotos(status: "approved" | "rejected") {
    if (selectedIds.length === 0) {
      return;
    }

    setIsBulkReviewing(true);
    setErrorMessage("");

    const updatedIds: string[] = [];

    try {
      for (let start = 0; start < selectedIds.length; start += 500) {
        const batch = selectedIds.slice(start, start + 500);
        const response = await fetch("/api/admin/photos/bulk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: batch, status }),
        });
        const result = (await response.json()) as { error?: string; ids?: string[] };

        if (!response.ok || !result.ids) {
          throw new Error(result.error ?? "The selected photo reviews could not be updated.");
        }

        updatedIds.push(...result.ids);
      }

      const updatedIdsSet = new Set(updatedIds);
      setPhotos((currentPhotos) =>
        currentPhotos.map((photo) => (updatedIdsSet.has(photo.id) ? { ...photo, status } : photo)),
      );
      setSelectedIds((currentIds) =>
        currentIds.filter((selectedId) => !updatedIdsSet.has(selectedId)),
      );
      if (updatedIdsSet.size < selectedIds.length) {
        setErrorMessage(
          "Some selected photos could not be found and were not changed.",
        );
      }
    } catch (error) {
      const updatedIdsSet = new Set(updatedIds);
      setPhotos((currentPhotos) =>
        currentPhotos.map((photo) => (updatedIdsSet.has(photo.id) ? { ...photo, status } : photo)),
      );
      setSelectedIds((currentIds) =>
        currentIds.filter((selectedId) => !updatedIdsSet.has(selectedId)),
      );
      setErrorMessage(
        error instanceof Error ? error.message : "The selected photo reviews could not be updated.",
      );
    } finally {
      setIsBulkReviewing(false);
    }
  }

  function togglePhotoSelection(id: string, checked: boolean) {
    setSelectedIds((currentIds) =>
      checked
        ? currentIds.includes(id)
          ? currentIds
          : [...currentIds, id]
        : currentIds.filter((currentId) => currentId !== id),
    );
  }

  async function selectAllPhotos(checked: boolean) {
    if (!checked) {
      setSelectedIds((currentIds) =>
        currentIds.filter((id) => !photos.some((photo) => photo.id === id)),
      );
      return;
    }

    setIsSelectingAll(true);
    setErrorMessage("");
    let allLoadedPhotos = photos;
    let nextPage = page;
    let morePages = hasMore;

    try {
      while (morePages) {
        nextPage += 1;
        const response = await fetch(`/api/admin/photos?page=${nextPage}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as PhotoListResponse;

        if (!response.ok || !result.photos || typeof result.hasMore !== "boolean") {
          throw new Error(result.error ?? "All guest photos could not be loaded.");
        }

        const loadedIds = new Set(allLoadedPhotos.map((photo) => photo.id));
        const newPhotos = result.photos.filter((photo) => !loadedIds.has(photo.id));
        allLoadedPhotos = [...allLoadedPhotos, ...newPhotos];
        setPhotos(allLoadedPhotos);
        morePages = result.hasMore;
        setHasMore(morePages);
        setPage(nextPage);
      }

      setSelectedIds((currentIds) =>
        Array.from(new Set([...currentIds, ...allLoadedPhotos.map((photo) => photo.id)])),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "All guest photos could not be loaded.",
      );
    } finally {
      setIsSelectingAll(false);
    }
  }

  return (
    <section className="admin-photos" aria-labelledby="admin-photos-title">
      <div className="admin-photos-heading">
        <div>
          <p className="admin-eyebrow">Guest contributions</p>
          <h2 id="admin-photos-title">Guest photo gallery</h2>
        </div>
        <button
          className="admin-outline-button"
          disabled={isLoading || isBulkReviewing || isSelectingAll}
          onClick={() => void loadPhotos()}
          type="button"
        >
          Refresh
        </button>
      </div>

      {errorMessage && (
        <p className="admin-error" role="alert">
          {errorMessage}
        </p>
      )}
      {!isLoading && photos.length > 0 && (
        <div className="admin-photo-bulk-toolbar">
          <label className="admin-photo-select-all">
            <input
              checked={allPhotosSelected}
              disabled={isBulkReviewing || isSelectingAll || reviewingId !== null}
              onChange={(event) => void selectAllPhotos(event.currentTarget.checked)}
              type="checkbox"
            />
            <span>{isSelectingAll ? "Loading all photos…" : "Select all photos"}</span>
          </label>
          {selectedIds.length > 0 && (
            <div className="admin-photo-bulk-actions">
              <span>{selectedIds.length} selected</span>
              <button
                className="admin-primary-button"
                disabled={isBulkReviewing || isSelectingAll || reviewingId !== null}
                onClick={() => void reviewSelectedPhotos("approved")}
                type="button"
              >
                {isBulkReviewing ? "Saving…" : "Approve selected"}
              </button>
              <button
                className="admin-outline-button"
                disabled={isBulkReviewing || isSelectingAll || reviewingId !== null}
                onClick={() => void reviewSelectedPhotos("rejected")}
                type="button"
              >
                Reject selected
              </button>
            </div>
          )}
        </div>
      )}
      {isLoading ? (
        <p className="admin-message" role="status">
          Loading photos…
        </p>
      ) : photos.length === 0 ? (
        <div className="admin-empty">No guest photos have been uploaded yet.</div>
      ) : (
        <div className="admin-photo-grid">
          {photos.map((photo) => (
            <article className="admin-photo-card" key={photo.id}>
              <Image
                alt={`Photo submitted by ${photo.guest_name || "a guest"}`}
                className="admin-photo-preview"
                height={360}
                src={`/api/admin/photos/${encodeURIComponent(photo.id)}/image`}
                unoptimized
                width={480}
              />
              <div className="admin-photo-info">
                <label className="admin-photo-select">
                  <input
                    checked={selectedIds.includes(photo.id)}
                    disabled={isBulkReviewing || isSelectingAll || reviewingId !== null}
                    onChange={(event) =>
                      togglePhotoSelection(photo.id, event.currentTarget.checked)
                    }
                    type="checkbox"
                  />
                  <span>Select photo</span>
                </label>
                <strong>{photo.guest_name || "Guest"}</strong>
                <span className={`admin-photo-status admin-photo-status-${photo.status}`}>
                  {photo.status}
                </span>
                <time dateTime={photo.created_at}>
                  {new Date(photo.created_at).toLocaleString()}
                </time>
              </div>
              <div className="admin-photo-actions">
                {photo.status === "pending" && (
                  <>
                    <button
                      className="admin-primary-button"
                      disabled={isBulkReviewing || isSelectingAll || reviewingId !== null}
                      onClick={() => void reviewPhoto(photo.id, "approved")}
                      type="button"
                    >
                      {reviewingId === photo.id ? "Saving…" : "Approve"}
                    </button>
                    <button
                      className="admin-outline-button"
                      disabled={isBulkReviewing || isSelectingAll || reviewingId !== null}
                      onClick={() => void reviewPhoto(photo.id, "rejected")}
                      type="button"
                    >
                      Reject
                    </button>
                  </>
                )}
                <a
                  className="admin-outline-button admin-photo-download"
                  href={`/api/admin/photos/${encodeURIComponent(photo.id)}/download`}
                >
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
      {!isLoading && hasMore && (
        <button
          className="admin-outline-button admin-photo-load-more"
          disabled={isLoadingMore || isSelectingAll || isBulkReviewing}
          onClick={() => void loadMorePhotos()}
          type="button"
        >
          {isLoadingMore ? "Loading…" : "Load more photos"}
        </button>
      )}
    </section>
  );
}
