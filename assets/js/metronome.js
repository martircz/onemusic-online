// Online metronome — Web Audio API with lookahead scheduling for sample-accurate timing.
// Pattern: schedule clicks slightly ahead of time on a 25ms setInterval (Chris Wilson's approach).
(function () {
    let audioCtx = null;
    let isPlaying = false;
    let bpm = 100;
    let beatsPerBar = 4;
    let currentBeat = 0;
    let nextNoteTime = 0.0;
    let timerId = null;

    const LOOKAHEAD = 25;        // ms — how often the scheduler runs
    const SCHEDULE_AHEAD = 0.1;  // s — how far ahead to schedule audio

    const $ = (id) => document.getElementById(id);

    function click(time, accent) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = accent ? 1500 : 900;
        gain.gain.setValueAtTime(accent ? 0.6 : 0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.05);
    }

    function flash(beat) {
        const dots = document.querySelectorAll('.beat-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === beat));
    }

    function scheduler() {
        while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD) {
            const accent = currentBeat === 0;
            click(nextNoteTime, accent);
            const beatToFlash = currentBeat;
            const delay = (nextNoteTime - audioCtx.currentTime) * 1000;
            setTimeout(() => flash(beatToFlash), Math.max(0, delay));

            nextNoteTime += 60.0 / bpm;
            currentBeat = (currentBeat + 1) % beatsPerBar;
        }
    }

    function start() {
        if (isPlaying) return;
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        isPlaying = true;
        currentBeat = 0;
        nextNoteTime = audioCtx.currentTime + 0.05;
        timerId = setInterval(scheduler, LOOKAHEAD);
        $('playBtn').textContent = '⏸ Stop';
        $('playBtn').classList.add('btn--accent');
    }

    function stop() {
        isPlaying = false;
        clearInterval(timerId);
        $('playBtn').textContent = '▶ Start';
        $('playBtn').classList.remove('btn--accent');
        document.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active'));
    }

    function renderDots() {
        const wrap = $('beatDots');
        wrap.innerHTML = '';
        for (let i = 0; i < beatsPerBar; i++) {
            const d = document.createElement('span');
            d.className = 'beat-dot' + (i === 0 ? ' beat-dot--accent' : '');
            wrap.appendChild(d);
        }
    }

    function setBpm(v) {
        bpm = Math.min(300, Math.max(30, parseInt(v) || 100));
        $('bpmValue').textContent = bpm;
        $('bpmSlider').value = bpm;
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderDots();
        setBpm(bpm);

        $('playBtn').addEventListener('click', () => isPlaying ? stop() : start());
        $('bpmSlider').addEventListener('input', (e) => setBpm(e.target.value));
        $('bpmMinus').addEventListener('click', () => setBpm(bpm - 1));
        $('bpmPlus').addEventListener('click', () => setBpm(bpm + 1));
        $('beatsSelect').addEventListener('change', (e) => {
            beatsPerBar = parseInt(e.target.value);
            currentBeat = 0;
            renderDots();
        });
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { e.preventDefault(); isPlaying ? stop() : start(); }
        });
    });
})();
