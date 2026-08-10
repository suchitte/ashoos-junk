"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type EntryFormValues = {
  id?: string;
  title: string;
  caption: string;
  takenAt: string;
  location: string;
  locationUrl: string;
  mood: string;
  song: string;
  tags: string;
  isPrivate: boolean;
  password: string;
  camera: string;
  lens: string;
  film: string;
  existingPhotos?: { id: string; url: string; filename: string }[];
};

const empty: EntryFormValues = {
  title: "",
  caption: "",
  takenAt: new Date().toISOString().slice(0, 10),
  location: "",
  locationUrl: "",
  mood: "",
  song: "",
  tags: "",
  isPrivate: false,
  password: "",
  camera: "",
  lens: "",
  film: "",
};

export function EntryForm({ initial }: { initial?: EntryFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<EntryFormValues>(initial ?? empty);
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function update<K extends keyof EntryFormValues>(key: K, value: EntryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    const body = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "existingPhotos") return;
      if (typeof value === "boolean") body.set(key, value ? "true" : "false");
      else body.set(key, String(value ?? ""));
    });
    if (files) {
      Array.from(files).forEach((file) => body.append("photos", file));
    }

    const url = values.id ? `/api/entries/${values.id}` : "/api/entries";
    const method = values.id ? "PUT" : "POST";
    const res = await fetch(url, { method, body });
    setPending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save entry");
      return;
    }

    const data = await res.json();
    router.push(`/entry/${data.slug}`);
    router.refresh();
  }

  async function onDelete() {
    if (!values.id) return;
    if (!confirm("Delete this entry and its photos?")) return;
    setPending(true);
    const res = await fetch(`/api/entries/${values.id}`, { method: "DELETE" });
    setPending(false);
    if (!res.ok) {
      setError("Could not delete");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const field =
    "mt-2 w-full rounded-sm border border-[var(--line)] bg-white/50 px-3 py-2 text-ink outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-ink-soft sm:col-span-2">
          Title
          <input
            className={field}
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Date
          <input
            type="date"
            className={field}
            value={values.takenAt}
            onChange={(e) => update("takenAt", e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Tags <span className="text-muted">(comma separated)</span>
          <input
            className={field}
            value={values.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="home, rain, film"
          />
        </label>
        <label className="block text-sm text-ink-soft sm:col-span-2">
          Caption
          <textarea
            className={`${field} min-h-28`}
            value={values.caption}
            onChange={(e) => update("caption", e.target.value)}
            placeholder="A short write-up for this moment…"
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Location
          <input
            className={field}
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Kyoto, Japan"
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Map link <span className="text-muted">(optional)</span>
          <input
            className={field}
            value={values.locationUrl}
            onChange={(e) => update("locationUrl", e.target.value)}
            placeholder="https://maps.google.com/…"
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Mood of the month
          <input
            className={field}
            value={values.mood}
            onChange={(e) => update("mood", e.target.value)}
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Song of the month
          <input
            className={field}
            value={values.song}
            onChange={(e) => update("song", e.target.value)}
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Camera
          <input
            className={field}
            value={values.camera}
            onChange={(e) => update("camera", e.target.value)}
          />
        </label>
        <label className="block text-sm text-ink-soft">
          Lens / film
          <div className="grid grid-cols-2 gap-2">
            <input
              className={field}
              value={values.lens}
              onChange={(e) => update("lens", e.target.value)}
              placeholder="Lens"
            />
            <input
              className={field}
              value={values.film}
              onChange={(e) => update("film", e.target.value)}
              placeholder="Film stock"
            />
          </div>
        </label>
      </div>

      <div className="rounded-sm border border-[var(--line)] bg-white/30 p-4">
        <label className="flex items-center gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={values.isPrivate}
            onChange={(e) => update("isPrivate", e.target.checked)}
          />
          Password-protect this entry
        </label>
        {values.isPrivate && (
          <label className="mt-3 block text-sm text-ink-soft">
            Entry password {values.id ? "(leave blank to keep current)" : ""}
            <input
              type="password"
              className={field}
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              required={!values.id}
            />
          </label>
        )}
      </div>

      <label className="block text-sm text-ink-soft">
        Photos <span className="text-muted">(full resolution kept)</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className={`${field} file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:text-paper`}
          onChange={(e) => setFiles(e.target.files)}
        />
      </label>

      {values.existingPhotos && values.existingPhotos.length > 0 && (
        <div>
          <p className="text-sm text-ink-soft">Current photos</p>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {values.existingPhotos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.filename}
                className="aspect-square rounded-sm object-cover"
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            New uploads are appended. To replace the set, delete and recreate the entry.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm text-paper disabled:opacity-60"
        >
          {pending ? "Saving…" : values.id ? "Save changes" : "Publish entry"}
        </button>
        {values.id && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-red-800"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
