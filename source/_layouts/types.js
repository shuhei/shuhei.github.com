import { PropTypes } from 'react';

export const SiteProps = PropTypes.shape({
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
});

export const PostTypes = PropTypes.shape({
  url: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  comments: PropTypes.bool.isRequired,
});

export const ArchivePostTypes = PropTypes.shape({
  url: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
});

export const PageTypes = PropTypes.shape({
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
});

export const RouteProps = PropTypes.shape({
  pattern: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
  props: PropTypes.func.isRequired,
});