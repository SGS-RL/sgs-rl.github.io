// Clip gallery: import from "../_gallery".
//
//   <ClipGallery skin="swiss">          one per page; renders the player
//     <ClipWall allHref="#clips" />     full-bleed band, no captions
//     <RobotGrid />                     every clip, one block per robot
//     <QuiltSeparator />                NOF quilt, raster <-> real on scroll
//   </ClipGallery>
//
// Any tile opens the player at that clip (URL hash #clip-007).
export { default as ClipGallery, useClipGallery } from "./ClipGallery";
export type { GalleryContext, OpenOptions } from "./ClipGallery";
export { default as ClipWall } from "./ClipWall";
export { default as QuiltSeparator } from "./QuiltSeparator";
export { default as RobotGrid } from "./RobotGrid";
export { default as TileVideo } from "./TileVideo";
export {
  describeGroup,
  groupByRobot,
  smallSrc,
  type RobotGroup,
  type Skin,
} from "./data";
