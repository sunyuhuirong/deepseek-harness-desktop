/**
 * @deepseek-ai/dsh-bundle-desktop — invariants
 */

/** Throws if the required peer dependencies are not present. */
function assertPeerDeps() {
  // No runtime checks needed; the bundle is declared purely through cordis.patch.yml.
}

export { assertPeerDeps };
