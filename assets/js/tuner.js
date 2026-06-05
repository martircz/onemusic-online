// Online chromatic tuner — mic input + autocorrelation pitch detection (ACF2+ / McLeod-style normalized).
// Range tuned for guitar/bass/voice (~40Hz–1400Hz).
(function () {
    let audioCtx = null, analyser = null, micStream = null, rafId = null;
    let buf = new Float32Array(2048);
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const $ = (id) => document.getElementById(id);

    // Autocorrelation-based fundamental frequency estimation.
    function detectPitch(buffer, sampleRate) {
        const SIZE = buffer.length;
        let rms = 0;
        for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1; // too quiet

        let r1 = 0, r2 = SIZE - 1, thres = 0.2;
        for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
        for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }

        const b = buffer.slice(r1, r2);
        const n = b.length;
        const c = new Array(n).fill(0);
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n - i; j++)
                c[i] += b[j] * b[j + i];

        let d = 0;
        while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < n; i++) {
            if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
        }
        let T0 = maxpos;
        // parabolic interpolation for sub-sample accuracy
        const x1 = c[T0 - 1] || 0, x2 = c[T0] || 0, x3 = c[T0 + 1] || 0;
        const a = (x1 + x3 - 2 * x2) / 2, bb = (x3 - x1) / 2;
        if (a) T0 = T0 - bb / (2 * a);

        return sampleRate / T0;
    }

    function freqToNote(freq) {
        const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
        const rounded = Math.round(noteNum) + 69; // MIDI
        const name = NOTES[rounded % 12];
        const octave = Math.floor(rounded / 12) - 1;
        const refFreq = 440 * Math.pow(2, (rounded - 69) / 12);
        const cents = Math.floor(1200 * Math.log(freq / refFreq) / Math.log(2));
        return { name, octave, cents };
    }

    function update() {
        analyser.getFloatTimeDomainData(buf);
        const freq = detectPitch(buf, audioCtx.sampleRate);
        if (freq > 40 && freq < 1400) {
            const { name, octave, cents } = freqToNote(freq);
            $('noteName').textContent = name;
            $('noteOctave').textContent = octave;
            $('freqValue').textContent = freq.toFixed(1) + ' Hz';
            $('centsValue').textContent = (cents > 0 ? '+' : '') + cents + '¢';
            // needle: -50..+50 cents → 0..100%
            const pct = Math.max(0, Math.min(100, 50 + cents));
            $('needle').style.left = pct + '%';
            const inTune = Math.abs(cents) <= 5;
            $('tuneStatus').textContent = inTune ? 'In tune' : (cents < 0 ? 'Flat — tune up' : 'Sharp — tune down');
            $('tuneStatus').style.color = inTune ? 'var(--accent-dark)' : 'var(--text-muted)';
            $('noteName').style.color = inTune ? 'var(--accent-dark)' : 'var(--primary)';
        } else {
            $('noteName').textContent = '–';
            $('tuneStatus').textContent = 'Play a note…';
        }
        rafId = requestAnimationFrame(update);
    }

    async function start() {
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            buf = new Float32Array(analyser.fftSize);
            audioCtx.createMediaStreamSource(micStream).connect(analyser);
            $('startBtn').style.display = 'none';
            $('tunerDisplay').style.display = 'block';
            update();
        } catch (err) {
            $('startBtn').textContent = 'Microphone blocked — check permissions';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        $('startBtn').addEventListener('click', start);
    });
    window.addEventListener('beforeunload', () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (micStream) micStream.getTracks().forEach(t => t.stop());
    });
})();
