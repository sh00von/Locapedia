// components/LoadingSpinner.js
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
    return (
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1000 }}>
     <div className={styles.loader}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
      </div>
    );
  };
  
  export default LoadingSpinner;
  