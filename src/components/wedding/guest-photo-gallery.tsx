"use client";

import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, ImagePlus, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GuestPhoto = {
  id: string;
  guest_name: string | null;
  content_type: string;
  created_at: string;
};

type PhotoListResponse = {
  error?: string;
  photos?: GuestPhoto[];
};

type UploadResponse = {
  error?: string;
  success?: boolean;
};

export function GuestPhotoGallery() {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const photoSlides = useMemo(() => {
    const slides: GuestPhoto[][] = [];

    for (let index = 0; index < photos.length; index += 6) {
      slides.push(photos.slice(index, index + 6));
    }

    return slides;
  }, [photos]);

  const loadPhotos = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/guest-photos", { cache: "no-store" });
      const result = (await response.json()) as PhotoListResponse;

      if (!response.ok || !result.photos) {
        throw new Error(result.error ?? "Guest photos could not be loaded.");
      }

      setPhotos(result.photos);
      setSlideIndex(0);
      setGalleryError("");
    } catch (error) {
      setGalleryError(
        error instanceof Error ? error.message : "Guest photos could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (photoSlides.length < 2 || isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSlideIndex((currentIndex) => (currentIndex + 1) % photoSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isPaused, photoSlides.length]);

  useEffect(() => {
    let active = true;

    void fetch("/api/guest-photos", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as PhotoListResponse;

        if (!response.ok || !result.photos) {
          throw new Error(result.error ?? "Guest photos could not be loaded.");
        }

        if (active) {
          setPhotos(result.photos);
          setSlideIndex(0);
          setGalleryError("");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setGalleryError(
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

  async function uploadPhoto(file: File) {
    const form = formRef.current;

    if (!form) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.set("photo", file);
      formData.set("guestName", String(new FormData(form).get("guestName") ?? ""));
      formData.set("consent", "on");
      const response = await fetch("/api/guest-photos", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "The photo could not be uploaded. Please try again.");
      }

      form.reset();
      setNotice("Thank you! Your photo will appear after it has been reviewed and approved.");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The photo could not be uploaded. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="guest-photo-section" aria-labelledby="guest-photo-title">
      <div className="guest-photo-heading">
        <span className="section-kicker">The day through your eyes</span>
        <h3 id="guest-photo-title">Memories from our guests.</h3>
        <p>Share a favorite moment from the wedding and help us add to our album.</p>
      </div>

      {isLoading ? (
        <p className="guest-photo-status" role="status">
          Loading guest photos…
        </p>
      ) : photos.length > 0 ? (
        <div className="guest-photo-carousel" aria-label="Guest photo slideshow" role="region">
          <div className="guest-photo-carousel-window">
            <div
              className="guest-photo-carousel-track"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {photoSlides.map((slide, index) => (
                <div
                  aria-hidden={index !== slideIndex}
                  className="guest-photo-grid guest-photo-slide"
                  key={slide[0]?.id ?? index}
                >
                  {slide.map((photo) => (
                    <figure className="guest-photo-card" key={photo.id}>
                      <Image
                        alt={`Photo shared by ${photo.guest_name || "a guest"}`}
                        className="guest-photo-image"
                        height={360}
                        src={`/api/guest-photos/${encodeURIComponent(photo.id)}/image`}
                        unoptimized
                        width={480}
                      />
                      {photo.guest_name && <figcaption>{photo.guest_name}</figcaption>}
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {photoSlides.length > 1 && (
            <div className="guest-photo-carousel-controls">
              <button
                aria-label="Show previous photos"
                className="guest-photo-carousel-button"
                onClick={() =>
                  setSlideIndex(
                    (currentIndex) => (currentIndex - 1 + photoSlides.length) % photoSlides.length,
                  )
                }
                type="button"
              >
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <span aria-live="polite">
                {slideIndex + 1} / {photoSlides.length}
              </span>
              <button
                aria-label="Show next photos"
                className="guest-photo-carousel-button"
                onClick={() =>
                  setSlideIndex((currentIndex) => (currentIndex + 1) % photoSlides.length)
                }
                type="button"
              >
                <ChevronRight size={17} aria-hidden="true" />
              </button>
              <button
                aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
                className="guest-photo-carousel-button"
                onClick={() => setIsPaused((paused) => !paused)}
                type="button"
              >
                {isPaused ? (
                  <Play size={15} aria-hidden="true" />
                ) : (
                  <Pause size={15} aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      ) : galleryError ? null : (
        <p className="guest-photo-status">No approved photos yet. Be the first to share one!</p>
      )}
      {!isLoading && (
        <button
          className="guest-photo-refresh"
          onClick={() => void loadPhotos()}
          type="button"
        >
          Refresh gallery
        </button>
      )}

      {galleryError && (
        <p className="guest-photo-error" role="alert">
          {galleryError}
        </p>
      )}
      {uploadError && (
        <p className="guest-photo-error" role="alert">
          {uploadError}
        </p>
      )}
      {notice && (
        <p className="guest-photo-success" role="status">
          {notice}
        </p>
      )}

      <form
        className="guest-photo-form"
        onSubmit={(event) => event.preventDefault()}
        ref={formRef}
      >
        <label className="guest-photo-field">
          <span>
            Your name <span>(optional; displayed with your photo)</span>
          </span>
          <input autoComplete="name" maxLength={80} name="guestName" />
        </label>

        <div className="guest-photo-field">
          <span>Choose how to add your photo</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="guest-photo-file-input"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void uploadPhoto(file);
            }}
            ref={uploadInputRef}
            type="file"
          />
          <input
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="guest-photo-file-input"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void uploadPhoto(file);
            }}
            ref={cameraInputRef}
            type="file"
          />
          <div className="guest-photo-choice-row">
            <button
              className="guest-photo-submit"
              disabled={isUploading}
              onClick={() => uploadInputRef.current?.click()}
              type="button"
            >
              <ImagePlus size={16} aria-hidden="true" />
              Upload a photo
            </button>
            <button
              className="guest-photo-submit guest-photo-camera-button"
              disabled={isUploading}
              onClick={() => cameraInputRef.current?.click()}
              type="button"
            >
              <Camera size={16} aria-hidden="true" />
              Take a photo
            </button>
          </div>
          <small>JPG, PNG, or WebP · up to 5 MB</small>
        </div>

        <label className="guest-photo-consent">
          <input name="consent" required type="checkbox" />
          <span>
            I agree that my photo may be reviewed and displayed in the public wedding gallery if
            approved.
          </span>
        </label>
        {isUploading && (
          <p className="guest-photo-status" role="status">
            Uploading your photo…
          </p>
        )}
      </form>
    </section>
  );
}
