import { useEffect } from 'react';
import Head from 'next/head';
import styles from './BottomSheet.module.css';

const BottomSheet = ({ location, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (location && location.title) {
      document.title = location.title;
    }
  }, [location]);

  return (
    <>
      <Head>
        <title>{location ? location.title : 'Location Details'}</title>
      </Head>
      <div className={styles.bottomSheet}>
        <div className={styles.sheetHeader}>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
          <h2>{location.title}</h2>
        </div>
        <div className={styles.sheetContent}>
          <div dangerouslySetInnerHTML={{ __html: location.description }} />
          {location.image && (
            <img src={location.image} alt={location.title} className={styles.image} />
          )}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
