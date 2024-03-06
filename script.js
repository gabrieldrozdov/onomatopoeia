// Record plugin
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import RecordPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/record.esm.js'

// Create an instance of WaveSurfer
const wavesurfer = WaveSurfer.create({
	container: '#mic',
	waveColor: 'white',
	progressColor: 'white',
})

// Initialize the Record plugin
const record = wavesurfer.registerPlugin(RecordPlugin.create())

// Render recorded audio
let start, delta, duration;
let disclaimer = document.querySelector('.disclaimer');
let controlsBottom = document.querySelector('#controls-bottom');
let controlsTop = document.querySelector('#controls-top');
record.on('record-end', (blob) => {
	const mic = document.querySelector('#mic');
	const container = document.querySelector('#recordings');
	const recordedUrl = URL.createObjectURL(blob);

	// Create wavesurfer from the recorded audio
	const wavesurfer = WaveSurfer.create({
		container,
		waveColor: 'white',
		progressColor: 'white',
		url: recordedUrl,
	})

	setTimeout(set25, 1000);

	// // Play button (unused)
	// const button = container.appendChild(document.createElement('button'))
	// button.textContent = 'Play'
	// button.onclick = () => wavesurfer.playPause()
	// wavesurfer.on('pause', () => (button.textContent = 'Play'))
	// wavesurfer.on('play', () => (button.textContent = 'Pause'))
})

{
	// Record button
	const recButton = document.querySelector('#record')

	recButton.onclick = () => {
		if (record.isRecording()) {
			record.stopRecording();

			// Calculate recording duration
			delta = Date.now() - start;
			duration = (delta / 1000 + 1).toFixed(2); // too fast if just 1000

			// Style content
			disclaimer.dataset.hide = 1;
			controlsBottom.dataset.hide = 0;
			controlsTop.dataset.hide = 0;
			recButton.textContent = 'Click to start recording';
			recButton.dataset.active = 1;
			recButton.style.display = 'none';
			mic.style.display = 'none';
			return
		}

		recButton.disabled = true

		record.startRecording().then(() => {
			start = Date.now();
			recButton.textContent = 'Stop';
			recButton.dataset.active = 0;
			recButton.disabled = false;
		})
	}
}

let quantity = 25;
let poster = document.querySelector('.poster');
function populatePoster() {
	setTimeout(() => {
		let shadowDOM = document.querySelectorAll('#recordings div');
		let canvas = shadowDOM[shadowDOM.length-1].shadowRoot.querySelector('canvas');
		poster.innerHTML = '';

		let newImg;
		canvas.toBlob((blob) => {
			// copy canvas content over to blob for duplicating in img elements
			newImg = document.createElement("img");
			const url = URL.createObjectURL(blob);
			newImg.onload = () => {
				// no longer need to read the blob so it's revoked
				URL.revokeObjectURL(url);
			};
			newImg.src = url;

			// generate new img elements
			let widths = [5, 10, 20];
			let imageWidths = [];
			for (let row = 0; row < quantity; row++) {
				let col = 0;
				while (col < 100) {
					let randomWidth = widths[Math.floor(Math.random() * widths.length)];
					if (col + randomWidth <= 100) {
						imageWidths.push(randomWidth);
						col += randomWidth;
					}
				}
			}
	
			for (let imageWidth of imageWidths) {
				let waveformContainer = document.createElement('div');
				waveformContainer.style.width = imageWidth + '%';
				waveformContainer.dataset.invert = 0;
				waveformContainer.addEventListener('click', () => {invertWaveform(waveformContainer)});

				let waveform = newImg.cloneNode(true);
				waveformContainer.appendChild(waveform);

				poster.appendChild(waveformContainer);

				// Delay animation to avoid bugs
				if (mode == 'synchronized') {
					setTimeout(sameInterval, 50);
				} else {
					setTimeout(randomInterval, 50);
				}
			}
		});
	}, 50)
}

function invertWaveform(e) {
	if (parseInt(e.dataset.invert) == 0) {
		e.dataset.invert = 1;
	} else {
		e.dataset.invert = 0;
	}
}

// Redo the recording
function restart() {
	poster.innerHTML = '';
	// reset settings
	setFullsize();
	sameInterval();
	quantity = 25;
	poster.dataset.rows = 25;
	poster.dataset.rotate = 0;
	rotateBtn.dataset.active = 0;
	btn50.dataset.active = 0;
	btn25.dataset.active = 1;
	btn10.dataset.active = 0;
	poster.dataset.borders = 0;

	// restart recording
	const recButton = document.querySelector('#record');
	const mic = document.querySelector('#mic');
	controlsBottom.dataset.hide = 1;
	controlsTop.dataset.hide = 1;
	recButton.style.display = 'block';
	mic.style.display = 'flex';
	disclaimer.dataset.hide = 0;
}
let restartBtn = document.querySelector('#restart');
restartBtn.addEventListener('click', restart);

// Printing controls
let page = document.querySelector("#page");
let mode = 'synchronized';
function randomInterval() {
	mode = 'randomized';
	for (let waveform of poster.querySelectorAll('img')) {
		waveform.style.animationDuration = Math.random()*10+1 + 's';
	}
	randomizeBtn.dataset.active = 1;
	synchronizeBtn.dataset.active = 0;
}
function sameInterval() {
	mode = 'synchronized';
	for (let waveform of poster.querySelectorAll('img')) {
		waveform.style.animationDuration = duration + 's';
	}
	randomizeBtn.dataset.active = 0;
	synchronizeBtn.dataset.active = 1;
}
function setBorders() {
	if (parseInt(poster.dataset.borders) == 3) {
		poster.dataset.borders = 0;
	} else if (parseInt(poster.dataset.borders) == 2) {
		poster.dataset.borders = 3;
	} else if (parseInt(poster.dataset.borders) == 1) {
		poster.dataset.borders = 2;
	} else {
		poster.dataset.borders = 1;
	}
}
let size = 'fullsize';
let rotate = false;
function setLetter() {
	size = 'letter';
	poster.dataset.size = 'letter';
	calculatePageDimensions();
	letterBtn.dataset.active = 1;
	tabloidBtn.dataset.active = 0;
	fullsizeBtn.dataset.active = 0;
}
function setTabloid() {
	size = 'tabloid';
	poster.dataset.size = 'tabloid';
	calculatePageDimensions();
	letterBtn.dataset.active = 0;
	tabloidBtn.dataset.active = 1;
	fullsizeBtn.dataset.active = 0;
}
function setFullsize() {
	size = 'fullsize';
	poster.dataset.size = 'fullsize';
	calculatePageDimensions();
	letterBtn.dataset.active = 0;
	tabloidBtn.dataset.active = 0;
	fullsizeBtn.dataset.active = 1;
}
function setRotate() {
	if (parseInt(poster.dataset.rotate) == 1) {
		poster.dataset.rotate = 0;
		rotateBtn.dataset.active = 0;
		rotate = false;
	} else {
		poster.dataset.rotate = 1;
		rotateBtn.dataset.active = 1;
		rotate = true;
	}
	calculatePageDimensions();
}
function calculatePageDimensions() {
	if (size == 'letter') {
		if (rotate) {
			page.innerHTML = `
				@page {
					size: 11in 8.5in;
					margin: 0;
				}
			`;
		} else {
			page.innerHTML = `
				@page {
					size: 8.5in 11in;
					margin: 0;
				}
			`;
		}
	}
	if (size == 'tabloid') {
		if (rotate) {
			page.innerHTML = `
				@page {
					size: 17in 11in;
					margin: 0;
				}
			`;
		} else {
			page.innerHTML = `
				@page {
					size: 11in 17in;
					margin: 0;
				}
			`;
		}
	}
	if (size == 'fullsize') {
		if (rotate) {
			page.innerHTML = `
				@page {
					size: 36in 24in;
					margin: 0;
				}
			`;
		} else {
			page.innerHTML = `
				@page {
					size: 24in 36in;
					margin: 0;
				}
			`;
		}
	}
}
let randomizeBtn = document.querySelector('#randomize');
let synchronizeBtn = document.querySelector('#synchronize');
let bordersBtn = document.querySelector('#borders');
let letterBtn = document.querySelector('#letter');
let tabloidBtn = document.querySelector('#tabloid');
let fullsizeBtn = document.querySelector('#fullsize');
let rotateBtn = document.querySelector('#rotate');
randomizeBtn.addEventListener('click', randomInterval);
synchronizeBtn.addEventListener('click', sameInterval);
bordersBtn.addEventListener('click', setBorders);
letterBtn.addEventListener('click', setLetter);
tabloidBtn.addEventListener('click', setTabloid);
fullsizeBtn.addEventListener('click', setFullsize);
rotateBtn.addEventListener('click', setRotate);

// Repopulate
function set50() {
	quantity = 50;
	poster.dataset.rows = 50;
	populatePoster();
	btn50.dataset.active = 1;
	btn25.dataset.active = 0;
	btn10.dataset.active = 0;
}
function set25() {
	quantity = 25;
	poster.dataset.rows = 25;
	populatePoster();
	btn50.dataset.active = 0;
	btn25.dataset.active = 1;
	btn10.dataset.active = 0;
}
function set10() {
	quantity = 10;
	poster.dataset.rows = 10;
	populatePoster();
	btn50.dataset.active = 0;
	btn25.dataset.active = 0;
	btn10.dataset.active = 1;
}
let btn50 = document.querySelector('#rows-50');
let btn25 = document.querySelector('#rows-25');
let btn10 = document.querySelector('#rows-10');
btn50.addEventListener('click', set50);
btn25.addEventListener('click', set25);
btn10.addEventListener('click', set10);

// Toggle fullscreen
let body = document.querySelector('body');
let msg = document.querySelector('.msg');
function goFullscreen() {
	poster.dataset.fullscreen = 1;
	controlsTop.dataset.hide = 1;
	controlsBottom.dataset.hide = 1;
	msg.dataset.hide = 0;
	setTimeout(() => {
		msg.dataset.hide = 1;
		body.addEventListener('click', hideFullscreen);
	}, 2000)
}
function hideFullscreen() {
	poster.dataset.fullscreen = 0;
	controlsTop.dataset.hide = 0;
	controlsBottom.dataset.hide = 0;
	body.removeEventListener('click', hideFullscreen);
}
let fullscreenBtn = document.querySelector('#fullscreen');
fullscreenBtn.addEventListener('click', goFullscreen)