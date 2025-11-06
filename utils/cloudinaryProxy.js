const CLOUDINARY_FETCH_BASE =
  "https://res.cloudinary.com/db18mgo76/image/fetch/f_auto,q_auto,w_800/";

const encodeSource = (value) => {
  try {
    return encodeURIComponent(value);
  } catch {
    return value;
  }
};

const shouldBypassProxy = (src) => {
  if (!src) return true;
  return (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith(CLOUDINARY_FETCH_BASE)
  );
};

export const withCloudinaryProxy = (src = "") => {
  if (shouldBypassProxy(src)) {
    return src;
  }
  return `${CLOUDINARY_FETCH_BASE}${encodeSource(src)}`;
};

export default withCloudinaryProxy;

