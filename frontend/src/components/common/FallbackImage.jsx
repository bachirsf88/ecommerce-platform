import { useEffect, useState } from 'react';

function FallbackImage({ src, fallbackSrc = '', alt, onError, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc || '');

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc || '');
  }, [fallbackSrc, src]);

  return (
    <img
      {...props}
      src={currentSrc || fallbackSrc || ''}
      alt={alt}
      onError={(event) => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }

        onError?.(event);
      }}
    />
  );
}

export default FallbackImage;
