window.addEventListener('DOMContentLoaded', init);

class BlockClock {
  constructor(scene) {
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.offsetX = 2;
    this.offsetY = 13;
    this.blockSize = 1;
    this.scale = 1;
    this.padding = 0;
    this.maxCoordinate = 1000000;
    this.totalColorPattern = 16777216;
    this.time = '00:00:00';
    this.#createBlocks(scene);
  }
  
  #getBlockPatterns() {
    let numberPatterns = [
      '111101101101111',
      '010010010010010',
      '111001111100111',
      '111001111001111',
      '101101111001001',
      '111100111001111',
      '111100111101111',
      '111101001001001',
      '111101111101111',
      '111101111001111'
    ]

    let blockPatterns = new Array(5);
    for(let i = 0; i < 5; i++) {
      blockPatterns[i] = new Array(0);
    }

    for(let i = 0; i < this.time.length; i++) {
      if('0' <= this.time[i] && this.time[i] <= '9') {
        let numberPattern = numberPatterns[Number(this.time[i])];
        for(let j = 0; j < numberPattern.length; j++) {
          blockPatterns[Math.floor(j / 3)].push(numberPattern[j] == '1' ? true : false);
        }
      } else {
        for(let j = 0; j < 5; j++) {
          blockPatterns[j].push(j % 2 == 1 ? true : false);
        }
      }
      
      for(let j = 0; j < 5; j++) {
        blockPatterns[j].push(false);
      }
    }

    return blockPatterns;
  }

  #createBlock() {
    let geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
    let material = new THREE.MeshBasicMaterial({color: 0xcccccc});
    let block = new THREE.Mesh(geometry, material);
    return block;
  }
  
  #createBlocks(scene) {
    let blockPatterns = this.#getBlockPatterns();

    this.blocks = new Array(0);
    for(let i = 0; i < blockPatterns.length; i++) {
      for(let j = 0; j < blockPatterns[i].length; j++) {
        this.blocks.push(this.#createBlock());
      }
    }

    this.blocks.forEach(block => {
      scene.add(block);
    });
    this.#updateBlocksPosition();
  }
  
  setTime(hour, minute, second) {
    this.hour = hour % 24;
    this.minute = minute % 60;
    this.second = second % 60;

    let h = ('0' + this.hour).slice(-2);
    let m = ('0' + this.minute).slice(-2);
    let s = ('0' + this.second).slice(-2);
    this.time = `${h}:${m}:${s}`;
    this.#updateBlocksPosition();
  }

  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.#updateBlocksPosition();
  }

  #updateBlocksPosition() {
    let blockPatterns = this.#getBlockPatterns();

    for(let i = 0; i < blockPatterns.length; i++) {
      for(let j = 0; j < blockPatterns[i].length; j++) {
        let block = this.blocks[i * blockPatterns[i].length + j];
        let x = (i - this.offsetX) * (this.blockSize * this.scale + this.padding) + this.x;
        let y = (j - this.offsetY) * (this.blockSize * this.scale + this.padding) + this.y;
        let z = blockPatterns[i][j] ? 0 : this.maxCoordinate + this.z;
        block.position.set(x, y, z);
      }
    }
  }

  setColor(color) {
    this.color = color % this.totalColorPattern;
    this.#updateBlocksColor();
  }

  #updateBlocksColor() {
    this.blocks.forEach(block => {
      block.material.color.setHex(this.color);
    });
  }

  setScale(scale) {
    this.scale = scale;
    this.#updateBlocksScale();
  }

  #updateBlocksScale() {
    this.blocks.forEach(block => {
      block.scale.set(this.scale, this.scale, this.scale);
    });
    this.#updateBlocksPosition();
  }

  setPadding(padding) {
    this.padding = padding;
    this.#updateBlocksPosition();
  }
}

function init() {
  function changeRandomColor() {
    let rgb = new Array(0);
    for(let i = 0; i < 3; i++) {
      rgb.push(Math.floor(Math.random() * 150) + 50);
    }

    let color = rgb[0] * 256 * 256 + rgb[1] * 256 + rgb[2];
    clock.setColor(color);
  }

  document.getElementById('js-change-color').onclick = () => {
    changeRandomColor();
  }

  document.getElementById('js-reset-color').onclick = () => {
    clock.setColor(0xcccccc);
  }

  document.getElementById('js-left').onclick = () => {
    clock.setPosition(clock.x, clock.y - 1, clock.z);
  }

  document.getElementById('js-down').onclick = () => {
    clock.setPosition(clock.x + 1, clock.y, clock.z);
  }

  document.getElementById('js-up').onclick = () => {
    clock.setPosition(clock.x - 1, clock.y, clock.z);
  }

  document.getElementById('js-right').onclick = () => {
    clock.setPosition(clock.x, clock.y + 1, clock.z);
  }

  document.getElementById('js-zoom-in').onclick = () => {
    clock.setScale(clock.scale * 1.1);
  }

  document.getElementById('js-zoom-out').onclick = () => {
    clock.setScale(clock.scale * 0.9);
  }

  document.getElementById('js-padding-plus').onclick = () => {
    clock.setPadding(clock.padding + 0.2);
  }

  document.getElementById('js-padding-minus').onclick = () => {
    clock.setPadding(clock.padding - 0.2);
  }

  document.getElementById('js-return').onclick = () => {
    clock.setPosition(0, 0, 0);
    clock.setScale(1);
    clock.setPadding(0);
  }

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();

  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 50);
  camera.rotation.z = Math.PI / 2;

  window.addEventListener('resize', onResize);
  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  onResize();
  document.body.appendChild(renderer.domElement);

  const light = new THREE.AmbientLight(0xFFFFFF, 3);
  scene.add(light);

  let clock = new BlockClock(scene);
  renderer.render(scene, camera);

  let lastHMD = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
  function render() {
    let date = new Date();
    let currentHMD = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    
    if(lastHMD != currentHMD) {
      lastHMD = currentHMD;
      clock.setTime(date.getHours(), date.getMinutes(), date.getSeconds());

      if(document.getElementById("js-auto-change-color").checked) {
        changeRandomColor();
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}