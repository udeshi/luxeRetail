import { useRef } from 'react';
import { X } from 'lucide-react';
import { useUploadProductImage } from '@org/api-client';
import { Spinner } from '@org/ui';

/** Presigns a URL, PUTs the file straight to object storage, then hands the
 *  resulting public URL back to the form — the API never sees file bytes. */
export function ImageUploader({ urls, onChange }: { urls: string[]; onChange: (urls: string[]) => void }) {
  const upload = useUploadProductImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-xl bg-brand-50">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 hidden rounded-full bg-white/90 p-1 group-hover:block"
              onClick={() => onChange(urls.filter((u) => u !== url))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={upload.isPending}
          className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-brand-200 text-brand-400 hover:border-brand-400"
        >
          {upload.isPending ? <Spinner /> : '+ Add'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          upload.mutate(file, { onSuccess: (publicUrl) => onChange([...urls, publicUrl]) });
          e.target.value = '';
        }}
      />
      {upload.isError && <p className="mt-2 text-xs text-red-600">{upload.error.message}</p>}
    </div>
  );
}
