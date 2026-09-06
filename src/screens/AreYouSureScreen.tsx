import { useEffect, useRef, useState } from "react";
import { usePhotos, type Photo } from "../hooks/usePhotos";

interface Props {
  promiseName: string;
  onGoAhead: () => void;
  onChangedMind: () => void;
}

export default function AreYouSureScreen({
  promiseName,
  onGoAhead,
  onChangedMind,
}: Props) {
  const { photos, loading } = usePhotos();
  const [pick, setPick] = useState<Photo | null>(null);
  const picked = useRef(false);

  // Choose one random photo, once, when the list first becomes available.
  useEffect(() => {
    if (loading || picked.current) return;
    picked.current = true;
    if (photos.length > 0) {
      setPick(photos[Math.floor(Math.random() * photos.length)]);
    }
  }, [loading, photos]);

  const who = promiseName.trim() || "someone you love";

  return (
    <section className="screen are-you-sure">
      {pick && (
        <div className="photo-frame">
          <img src={pick.url} alt="" />
        </div>
      )}

      <div className="prompt">
        <h1>Are you sure?</h1>
        <p>You made a promise to {who}.</p>
      </div>

      <div className="actions">
        <button className="button button-ghost" onClick={onGoAhead}>
          I'm doing it
        </button>
        <button className="button button-primary" onClick={onChangedMind}>
          I changed my mind
        </button>
      </div>
    </section>
  );
}
