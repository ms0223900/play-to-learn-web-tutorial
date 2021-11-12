const canvas = document.getElementById('spriteCanvas');
const downloadLink = document.getElementById('downloadCanvasLink');

const configs = {
  singleSpriteImageSpec: {
    width: 600,
    height: 600,
  },
  imgAmountPerRow: 18,
}

const getCtx = () => (
  canvas.getContext('2d')
);

const getImgPosition = ({ x, y}) => {
  return ({
    x: x * configs.singleSpriteImageSpec.width,
    y: y * configs.singleSpriteImageSpec.height,
  })
}

const getImgSrcByIdx = (imgIdx = 0) => (
  `./slider/${imgIdx}.jpg`
)

const drawSingleImage = (imgSrc = '', imgPos = { x: 0, y: 0, }) => {
  const ctx = getCtx();
  const imgEl = new Image();

  if(ctx) {
    imgEl.onload = () => {
      const {
        x, y
      } = getImgPosition(imgPos);
      // console.log(x, y);

      const {
        width, height,
      } = configs.singleSpriteImageSpec;
      ctx.drawImage(imgEl, x, y, width, height);
    }

    imgEl.src = imgSrc;
  }
};

const drawAllImage = () => {
  const {
    imgAmountPerRow,
  } = configs;
  for (let i = 0; i < imgAmountPerRow; i++) {
    for (let j = 0; j < imgAmountPerRow; j++) {
      const imgIdx = (i) * imgAmountPerRow + (j);
      // console.log(imgIdx);
      const imgSrc = getImgSrcByIdx(imgIdx);
      drawSingleImage(imgSrc, { x: j, y: i });
    }
  }
}

function setCanvasImgToLink() {
  const imgBlob = canvas.toDataURL('image/jpeg');
  downloadLink.setAttribute('href', imgBlob);
}
function registerDownloadCanvas() {
  downloadLink.addEventListener('click', setCanvasImgToLink, false);
}

function main() {
  canvas.width = configs.imgAmountPerRow * configs.singleSpriteImageSpec.width;
  canvas.height = configs.imgAmountPerRow * configs.singleSpriteImageSpec.height;
  drawAllImage();
  registerDownloadCanvas();
}

main();