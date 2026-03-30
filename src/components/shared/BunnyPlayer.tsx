interface BunnyPlayerProps {
  videoId: string;
  libraryId?: string;
  streamUrl?: string;
  className?: string;
}

export default function BunnyPlayer({
  videoId,
  libraryId,
  streamUrl,
  className = '',
}: BunnyPlayerProps) {
  const LIBRARY_ID = libraryId || process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '';
  const src = streamUrl || `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;

  return (
    <div className={`relative w-full rounded-xl overflow-hidden bg-black ${className}`} style={{ paddingTop: '56.25%' }}>
      <iframe
        src={`${src}?autoplay=false&preload=true`}
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
