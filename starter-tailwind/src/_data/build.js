// Cache-busting hash based on build time
export default function () {
  return {
    hash: Date.now().toString(36),
  };
}
