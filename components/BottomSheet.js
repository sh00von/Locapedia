import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './BottomSheet.module.css';

const BottomSheet = ({ location, onClose, isPreview }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWebShareSupported, setIsWebShareSupported] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // State to manage copy link feedback
  const router = useRouter();
  

  useEffect(() => {
    // Check if Web Share API is supported
    setIsWebShareSupported(navigator.share !== undefined);

    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    if (location && location.title) {
      document.title = location.title;
      router.push(`/?location=${encodeURIComponent(location.title)}`, undefined, { shallow: true });
    }
  }, [location]);

  // Function to close the bottom sheet and update the URL
  const handleClose = () => {
    onClose();
    router.push('/', undefined, { shallow: true });
  };

  // Toggle between preview and full detail modes
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle hover state for opacity and preview description
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Function to share location using Web Share API or fallback options
  const handleShare = () => {
    const shareData = {
      title: location.title,
      text: location.preview || location.description,
      url: window.location.href,
    };

    if (isWebShareSupported) {
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing', error));
    }
  };

  // Function to copy the URL to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
      })
      .catch((error) => console.error('Error copying text', error));
  };

  return (
    <>
      <Head>
        <title>{location ? location.title : 'Location Details'}</title>
      </Head>
      <div
        className={`${styles.bottomSheet} ${isExpanded ? styles.expanded : styles.collapsed}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isPreview && !isExpanded ? 'translateY(80%)' : 'translateY(0)',
          opacity: isHovered ? 1 : 0.95,
        }}
      >
        <div className={styles.sheetHeader}>
          <button onClick={handleClose} className={styles.closeButton}>✕</button>
          <h2>{location.title}</h2>
        </div>

        <div className={styles.sheetContent}>
          <div
            dangerouslySetInnerHTML={{
              __html: isPreview && !isExpanded
                ? location.preview
                : location.description,
            }}
          />

          {location.image && (
            <div className={styles.imageWrapper}>
              <Image
                src={location.image}
                alt={location.title}
                layout="responsive"
                width={600}
                height={400}
                loading="lazy"
                quality={85}
              />
            </div>
          )}

          {/* Share and Copy Buttons */}
          <div className={`${styles.actionButtons} ${isHovered ? styles.showButtons : ''}`}>
            <button onClick={handleShare} className={styles.shareButton}>
              {isWebShareSupported ? '📤 Share' : 'Share'}
            </button>
            <button onClick={handleCopy} className={styles.copyButton}>
              {isCopied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
