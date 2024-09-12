import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image'; // Import next/image
import { useRouter } from 'next/router'; // Import useRouter
import styles from './BottomSheet.module.css';

const BottomSheet = ({ location, onClose, isPreview }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter(); // Initialize router for URL manipulation

  useEffect(() => {
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
    router.push('/', undefined, { shallow: true }); // Remove query parameter from URL
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
          opacity: isHovered ? 1 : 0.95, // Increase opacity on hover
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
                ? location.preview // Show preview description if in preview mode
                : location.description, // Full description if expanded or not in preview mode
            }}
          />

          {location.image && (
            <div className={styles.imageWrapper}>
              <Image
                src={location.image}
                alt={location.title}
                layout="responsive"
                width={600} // Adjust as needed
                height={400} // Adjust as needed
                quality={85} // Adjust quality if needed
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
