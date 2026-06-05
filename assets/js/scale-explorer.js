// Scale & chord explorer — computes scale notes, renders a piano keyboard, plays the scale. No mic.
(function () {
    let audioCtx = null;

    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Interval patterns in semitones from the root.
    const SCALES = {
        'Major (Ionian)':        [0, 2, 4, 5, 7, 9, 11],
        'Natural Minor (Aeolian)': [0, 2, 3, 5, 7, 8, 10],
        'Harmonic Minor':        [0, 2, 3, 5, 7, 8, 11],
        'Melodic Minor':         [0, 2, 3, 5, 7, 9, 11],
        'Dorian':                [0, 2, 3, 5, 7, 9, 10],
        'Phrygian':              [0, 1, 3, 5, 7, 8, 10],
        'Lydian':                [0, 2, 4, 6, 7, 9, 11],
        'Mixolydian':            [0, 2, 4, 5, 7, 9, 10],
        'Locrian':               [0, 1, 3, 5, 6, 8, 10],
        'Major Pentatonic':      [0, 2, 4, 7, 9],
        'Minor Pentatonic':      [0, 3, 5, 7, 10],
        'Blues':                 [0, 3, 5, 6, 7, 10]
    };

    const $ = (id) => document.getElementById(id);
    const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function scaleNotes(rootIdx, pattern) {
        return pattern.map(semi => NOTES[(rootIdx + semi) % 12]);
    }

    function render() {
        const rootIdx = parseInt($('rootSelect').value);
        const pattern = SCALES[$('scaleSelect').value];
        const notes = scaleNotes(rootIdx, pattern);
        const inScale = new Set(pattern.map(s => (rootIdx + s) % 12));

        // note list
        $('noteList').innerHTML = notes.map((n, i) =>
            `<span class="note-chip${i === 0 ? ' note-chip--root' : ''}">${n}</span>`).join('');

        // piano: two octaves starting at C
        const wrap = $('piano');
        wrap.innerHTML = '';
        const whiteOrder = [0, 2, 4, 5, 7, 9, 11];
        const blackAfter = { 0: 1, 2: 3, 5: 6, 7: 8, 9: 10 }; // pc -> black pc to its right
        for (let oct = 0; oct < 2; oct++) {
            whiteOrder.forEach(pc => {
                const key = document.createElement('div');
                key.className = 'pkey pkey--white';
                if (inScale.has(pc)) key.classList.add('in-scale');
                if (pc === rootIdx % 12) key.classList.add('is-root');
                key.dataset.midi = 60 + oct * 12 + pc;
                key.innerHTML = `<span class="pkey__label">${NOTES[pc]}</span>`;
                if (pc in blackAfter) {
                    const bpc = blackAfter[pc];
                    const bk = document.createElement('div');
                    bk.className = 'pkey pkey--black';
                    if (inScale.has(bpc)) bk.classList.add('in-scale');
                    bk.dataset.midi = 60 + oct * 12 + bpc;
                    key.appendChild(bk);
                }
                wrap.appendChild(key);
            });
        }

        wrap.querySelectorAll('.pkey').forEach(k =>
            k.addEventListener('click', (e) => { e.stopPropagation(); playNote(parseInt(k.dataset.midi)); }));
    }

    function ensureCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function tone(freq, start, dur) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.05);
    }

    function playNote(midi) {
        ensureCtx();
        tone(midiToFreq(midi), audioCtx.currentTime + 0.02, 0.5);
    }

    function playScale() {
        ensureCtx();
        const rootIdx = parseInt($('rootSelect').value);
        const pattern = SCALES[$('scaleSelect').value];
        const seq = [...pattern, 12]; // add octave on top
        const step = 0.32;
        seq.forEach((semi, i) => {
            tone(midiToFreq(60 + rootIdx + semi), audioCtx.currentTime + 0.05 + i * step, step * 0.95);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const rootSel = $('rootSelect');
        NOTES.forEach((n, i) => {
            const o = document.createElement('option');
            o.value = i; o.textContent = n;
            rootSel.appendChild(o);
        });
        rootSel.value = 0; // C

        const scaleSel = $('scaleSelect');
        Object.keys(SCALES).forEach(name => {
            const o = document.createElement('option');
            o.value = name; o.textContent = name;
            scaleSel.appendChild(o);
        });

        rootSel.addEventListener('change', render);
        scaleSel.addEventListener('change', render);
        $('playScaleBtn').addEventListener('click', playScale);
        render();
    });
})();
