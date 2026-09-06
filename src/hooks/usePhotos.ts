import { useCallback, useEffect, useRef, useState } from "react";
import {
  addPhoto,
  listPhotos,
  removePhoto,
  type PhotoRecord,
} from "../lib/photos";

export interface Photo {
  id: string;
  name: string;
  url: string;
}

/**
 * Loads the stored photos and exposes add/remove helpers. Object URLs are
 * created once per record and revoked when the record goes away or the hook
 * unmounts, so there are no leaks even as the list churns.
 */
export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const urls = useRef(new Map<string, string>());

  const sync = useCallback((records: PhotoRecord[]) => {
    const seen = new Set<string>();
    const next: Photo[] = records.map((r) => {
      seen.add(r.id);
      let url = urls.current.get(r.id);
      if (!url) {
        url = URL.createObjectURL(r.blob);
        urls.current.set(r.id, url);
      }
      return { id: r.id, name: r.name, url };
    });
    for (const [id, url] of urls.current) {
      if (!seen.has(id)) {
        URL.revokeObjectURL(url);
        urls.current.delete(id);
      }
    }
    setPhotos(next);
  }, []);

  const reload = useCallback(async () => {
    const records = await listPhotos();
    sync(records);
  }, [sync]);

  useEffect(() => {
    const map = urls.current;
    reload().finally(() => setLoading(false));
    return () => {
      for (const url of map.values()) URL.revokeObjectURL(url);
      map.clear();
    };
  }, [reload]);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
      for (const file of images) await addPhoto(file);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await removePhoto(id);
      await reload();
    },
    [reload],
  );

  return { photos, loading, addFiles, remove };
}
