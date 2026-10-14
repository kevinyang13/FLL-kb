/* Three.js does not free GPU memory when an object leaves the scene graph,
   so anything removed has to be walked and disposed by hand. Materials are
   shared through materials.js and are freed there, not here. */
export function disposeObject3D(root){
  root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  root.parent?.remove(root);
}
export function clearGroup(group){
  while (group.children.length){
    const c = group.children[0];
    group.remove(c);
    c.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  }
}
