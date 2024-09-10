// components/SEO.js
import Head from 'next/head';
import PropTypes from 'prop-types';

const SEO = ({ title, description, keywords, author, ogImage, ogUrl }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="canonical" href={ogUrl} />
    </Head>
  );
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string,
  author: PropTypes.string,
  ogImage: PropTypes.string,
  ogUrl: PropTypes.string.isRequired,
};

SEO.defaultProps = {
  keywords: '',
  author: '',
  ogImage: '',
};

export default SEO;
