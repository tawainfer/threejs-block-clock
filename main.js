window.addEventListener('DOMContentLoaded', init);

class BlockClock {
  constructor(scene) {
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.blockSize = 100;
    this.padding = 0;
    this.maxCoordinate = 1000000;
    this.totalColorPattern = 16777216;
    this.time = '00:00:00';
    this.lastCreateTime = '';
    this.#createBlocks(scene);
  }

  setTime(hour, minute, second) {
    this.hour = hour % 24;
    this.minute = minute % 60;
    this.second = second % 60;

    let h = ('0' + this.hour).slice(-2);
    let m = ('0' + this.minute).slice(-2);
    let s = ('0' + this.second).slice(-2);
    this.time = `${h}:${m}:${s}`;

    if(this.time != this.lastCreateTime) {
      // console.log(this.time);
      this.lastCreateTime = this.time;
      this.#updateBlocksPosition();
    }
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
    let material = new THREE.MeshStandardMaterial({color: 0xffffff});
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
        block.position.set(i * (this.blockSize + this.padding), j * (this.blockSize + this.padding), (blockPatterns[i][j] ? 0 : this.maxCoordinate));
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
}

function init() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas')
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.set(0, 1200, 5000);
  camera.rotation.z = Math.PI / 2;
  
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 2;
  light.position.set(1, 1, 1);
  scene.add(light);

  let clock = new BlockClock(scene);
  renderer.render(scene, camera);

  function render() {
    let date = new Date();
    clock.setTime(date.getHours(), date.getMinutes(), date.getSeconds());
    clock.setColor(0x4682b4);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}