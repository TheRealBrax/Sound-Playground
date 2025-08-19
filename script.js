const timelineDiv = document.getElementById('timeline');
const addColBtn = document.getElementById('addColBtn');
const playBtn = document.getElementById('playBtn');

// Drag & drop for toolbar instruments
document.querySelectorAll('.instrument').forEach(inst => {
  inst.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text', inst.dataset.sound);
    e.dataTransfer.setData('img', inst.dataset.img);
  });
});

// Add drag & drop listeners to initial slots
document.querySelectorAll('.slot').forEach(slot => {
  slot.addEventListener('dragover', e => e.preventDefault());
  slot.addEventListener('drop', e => {
    const row = slot.dataset.row;
    const col = slot.dataset.col;
    const sound = e.dataTransfer.getData('text');
    const imgSrc = e.dataTransfer.getData('img');

    if (!timeline[row][col]) {
      timeline[row][col] = sound;

      const img = document.createElement('img');
      img.src = imgSrc;
      img.width = 40;
      img.alt = sound;
      img.style.cursor = 'pointer';

      // Add click handler to remove sound
      img.addEventListener('click', () => {
        timeline[row][col] = null;
        slot.removeChild(img);
      });

      slot.appendChild(img);
    }
  });
});

let extraColumns = 0;
const maxExtraColumns = 3;

// Timeline is a 2D array [row][col]
let timeline = [
  [null, null, null, null], // row 0
  [null, null, null, null], // row 1
  [null, null, null, null]  // row 2
];

// Add column function
addColBtn.addEventListener('click', () => {
  if(extraColumns >= maxExtraColumns) return; // max reached
  extraColumns++;

  // Add new slot to each row
  for(let row=0; row<timeline.length; row++){
    timeline[row].push(null); // update timeline array

    const rowDiv = timelineDiv.children[row]; // get the row
    const colIndex = timeline[row].length - 1; // new column index

    const slot = document.createElement('div');
    slot.classList.add('slot');
    slot.dataset.row = row;
    slot.dataset.col = colIndex;

    // Add playhead div
    const playheadDiv = document.createElement('div');
    playheadDiv.className = 'playhead';
    slot.appendChild(playheadDiv);

    // Drag & drop for the new slot
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
      const sound = e.dataTransfer.getData('text');
      const imgSrc = e.dataTransfer.getData('img');

      if(!timeline[row][colIndex]){
        timeline[row][colIndex] = sound;

        const img = document.createElement('img');
        img.src = imgSrc;
        img.width = 40;
        img.alt = sound;
        slot.appendChild(img);
      }
    });

    rowDiv.appendChild(slot);
  }
});

// Simple sound loader and player
function playSound(name) {
  const audio = new Audio(`sounds/${name}.mp3`);
  audio.play();
}

let isPlaying = false;
let playInterval = null;

function showPlayhead(col) {
  document.querySelectorAll('.slot').forEach(slot => {
    const playhead = slot.querySelector('.playhead');
    if (!playhead) return; // skip if missing
    if (parseInt(slot.dataset.col) === col) {
      playhead.style.opacity = 1;
    } else {
      playhead.style.opacity = 0;
    }
  });
}

function hidePlayhead() {
  document.querySelectorAll('.playhead').forEach(ph => ph.style.opacity = 0);
}

playBtn.addEventListener('click', () => {
  if (isPlaying) {
    isPlaying = false;
    clearInterval(playInterval);
    hidePlayhead();
    playBtn.textContent = '▶ Play';
    return;
  }
  isPlaying = true;
  playBtn.textContent = '⏹ Stop';

  let col = 0;
  playInterval = setInterval(() => {
    if (!isPlaying) return;
    showPlayhead(col);
    for (let row = 0; row < timeline.length; row++) {
      const sound = timeline[row][col];
      if (sound) playSound(sound);
    }
    col = (col + 1) % timeline[0].length;
  }, 400);
});
