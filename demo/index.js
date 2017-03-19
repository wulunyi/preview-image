import './index.scss';
import ImagePreview from '../src/image-preview';

let imagePreview = new ImagePreview(document.getElementsByClassName('app')[0], {
  maxZoom: 5
});