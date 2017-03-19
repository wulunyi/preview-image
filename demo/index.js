import './index.scss';
import PreviewImage from '../src/preview-image';

let previewImage = new PreviewImage(document.getElementsByClassName('app')[0], {
  maxZoom: 5
});