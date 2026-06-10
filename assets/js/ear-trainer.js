// Ear trainer — interval recognition quiz. Synthesizes tones via Web Audio (no mic needed).
(function () {
    let audioCtx = null;
    let current = null;      // { semitones, rootMidi }
    let score = 0, streak = 0, best = 0, total = 0;
    let answered = false;

    const INTERVALS = [
        { semis: 1,  name: 'Minor 2nd' },
        { semis: 2,  name: 'Major 2nd' },
        { semis: 3,  name: 'Minor 3rd' },
        { semis: 4,  name: 'Major 3rd' },
        { semis: 5,  name: 'Perfect 4th' },
        { semis: 6,  name: 'Tritone' },
        { semis: 7,  name: 'Perfect 5th' },
        { semis: 8,  name: 'Minor 6th' },
        { semis: 9,  name: 'Major 6th' },
        { semis: 10, name: 'Minor 7th' },
        { semis: 11, name: 'Major 7th' },
        { semis: 12, name: 'Octave' }
    ];

    const $ = (id) => document.getElementById(id);
    const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function tone(freq, start, dur) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.4, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.05);
    }

    function playCurrent() {
        if (!current) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t = audioCtx.currentTime + 0.05;
        const rootF = midiToFreq(current.rootMidi);
        const targetF = midiToFreq(current.rootMidi + current.semitones);
        tone(rootF, t, 0.6);
        tone(targetF, t + 0.7, 0.6);
    }

    function newQuestion() {
        answered = false;
        const pick = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
        const rootMidi = 57 + Math.floor(Math.random() * 8); // A3..F4-ish
        current = { semitones: pick.semis, rootMidi };
        $('feedback').textContent = '';
        $('feedback').style.color = 'var(--text-muted)';
        document.querySelectorAll('.answer-btn').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
        $('nextBtn').style.display = 'none';
        playCurrent();
    }

    function answer(semis, btn) {
        if (answered) return;
        answered = true;
        total++;
        const correctName = INTERVALS.find(i => i.semis === current.semitones).name;
        document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

        if (semis === current.semitones) {
            score++; streak++; best = Math.max(best, streak);
            btn.classList.add('correct');
            $('feedback').textContent = 'Correct — ' + correctName;
              $('feedback').style.color = 'var(--primary)';
        } else {
            streak = 0;
            btn.classList.add('wrong');
            document.querySelectorAll('.answer-btn').forEach(b => {
                if (parseInt(b.dataset.semis) === current.semitones) b.classList.add('correct');
            });
            $('feedback').textContent = 'It was ' + correctName;
            $('feedback').style.color = '#dc2626';
        }
        $('score').textContent = score + '/' + total;
        $('streak').textContent = streak;
        $('best').textContent = best;
        $('nextBtn').style.display = 'inline-flex';
    }

    function buildAnswers() {
        const wrap = $('answers');
        wrap.innerHTML = '';
        INTERVALS.forEach(iv => {
            const b = document.createElement('button');
            b.className = 'answer-btn';
            b.textContent = iv.name;
            b.dataset.semis = iv.semis;
            b.addEventListener('click', () => answer(iv.semis, b));
            wrap.appendChild(b);
        });
    }

    function start() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        $('startBtn').style.display = 'none';
        $('quiz').style.display = 'block';
        buildAnswers();
        newQuestion();
    }

    document.addEventListener('DOMContentLoaded', () => {
        $('startBtn').addEventListener('click', start);
        $('replayBtn').addEventListener('click', playCurrent);
        $('nextBtn').addEventListener('click', newQuestion);
    });
})();
