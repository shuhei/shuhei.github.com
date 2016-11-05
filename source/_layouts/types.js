import { PropTypes } from 'react';

export const SiteProps = PropTypes.shape({
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
});

export const PostTypes = PropTypes.shape({
  url: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  comments: PropTypes.bool.isRequired,
});
