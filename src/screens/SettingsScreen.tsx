import { useRef, useState } from "react";
import { usePhotos } from "../hooks/usePhotos";

interface Props {
  promiseName: string;
  onSaveName: (name: string) => void;
  onBack: () => void;
}

export default function SettingsScreen({
  promiseName,
  onSaveName,
  onBack,
}: Props) {
  const [name, setName] = useState(promiseName);
  const [savedFlash, setSavedFlash] = useState(false);
  const { photos, loading, addFiles, remove } = usePhotos();
  const fileInput = useRef<HTMLInputElement>(null);

  const saveName = () => {
    onSaveName(name);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  };

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addFiles(e.target.files);
    }
    e.target.value = "";
  };

  return (
    <section className="screen settings">
      <header className="settings-header">
        <button
          className="icon-button"
          onClick={onBack}
          aria-label="Back to home"
        >
          <BackIcon />
        </button>
        <h1>Settings</h1>
      </header>

      <div className="field">
        <label htmlFor="promise-name">Promise made to</label>
        <div className="field-row">
          <input
            id="promise-name"
            type="text"
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="button button-primary" onClick={saveName}>
            {savedFlash ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="field">
        <div className="field-row field-row--spread">
          <label>Photos</label>
          <button
            className="button button-ghost"
            onClick={() => fileInput.current?.click()}
          >
            Add photos
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onPickFiles}
        />

        {loading ? (
          <p className="muted">Loading…</p>
        ) : photos.length === 0 ? (
          <p className="muted">
            No photos yet. Add a few of the people you're doing this for.
          </p>
        ) : (
          <div className="photo-grid">
            {photos.map((p) => (
              <div className="photo-tile" key={p.id}>
                <img src={p.url} alt={p.name} />
                <button
                  className="photo-remove"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove ${p.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
