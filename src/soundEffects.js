export const soundEffects = {
    audioOn: false,
    audioCtx: null,

    setAudio() {
        if (!this.audioOn) {
            document.getElementById("soundCell").innerHTML = "<img id='audioImg' src='assets/images/audioOn.png' title='Audio' width='64' height='64'>";
            this.audioOn = true;
            this.init();
        }
        else {
            this.audioOn = false;
            this.audioCtx = null;
            document.getElementById("soundCell").innerHTML = "<img id='audioImg' src='assets/images/audioOff.png' title='Audio' width='64' height='64'>";
        }
    },

    init() {
        this.audioCtx = new ( window.AudioContext || webkitAudioContext );
        this.ctx = this.audioCtx;
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(this.ctx.destination);
    
        this.bomberMaster = this.ctx.createGain();
        this.bomberMaster.gain.value = 0.9;
        this.bomberMaster.connect(this.ctx.destination);

        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 0;

        this.nodes = {};
    
    },

    play(sound) {
        if (!this.audioOn) return;

        let soundOpts = {};
        if (sound === "gun") {
            soundOpts.noiseDur = 0.4;
        }
        else if (sound === "aircraftExplode") {
            soundOpts.noiseDur = 1.0;
        }
        else if (sound === "bomb") {
            soundOpts.noiseDur = 1.2;
        }
        else {
            soundOpts.noiseDur = 0.8;
        }
        this.explode(this.audioCtx.currentTime, soundOpts);
    },

    // Create a 1-channel noise buffer (white noise).
    makeNoiseBuffer(durationSec) {
        const { ctx } = this;
        const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    },

    explode(t0, opt = {}) {
        if (!this.audioOn) return;

        const { ctx, master } = this;

        // ---- Parameters (tweak these) ----
        const gain = opt.gain ?? 1.0;                 // overall loudness multiplier
        const noiseDur = opt.noiseDur ?? 0.8;         // seconds
        const thumpDur = opt.thumpDur ?? 0.6;         // seconds
        const thumpStartHz = opt.thumpStartHz ?? 90;  // starting bass pitch
        const thumpEndHz = opt.thumpEndHz ?? 35;      // ending bass pitch
        const lpStart = opt.lpStart ?? 1400;          // lowpass start cutoff
        const lpEnd = opt.lpEnd ?? 180;              // lowpass end cutoff
        const crackAmt = opt.crackAmt ?? 0.25;        // transient intensity
        const stereo = opt.stereo ?? 0.15;            // subtle pan range 0..1

        // Utility
        const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
        const rand = (a, b) => a + Math.random() * (b - a);

        // ---- Bus for this explosion instance ----
        const bus = ctx.createGain();
        bus.gain.value = clamp(gain, 0, 3);
        bus.connect(master);

        // Optional pan
        let panNode = null;
        if (ctx.createStereoPanner) {
            panNode = ctx.createStereoPanner();
            panNode.pan.value = rand(-stereo, stereo);
            bus.disconnect();
            bus.connect(panNode);
            panNode.connect(master);
        }

        // ---- (1) Noise blast ----
        const noise = ctx.createBufferSource();
        noise.buffer = this.makeNoiseBuffer(noiseDur);

        const noiseGain = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";

        // Envelope: fast attack, medium decay
        noiseGain.gain.setValueAtTime(0.0001, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.9, t0 + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.15, t0 + 0.10);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + noiseDur);

        // Filter sweep down
        lp.frequency.setValueAtTime(lpStart, t0);
        lp.frequency.exponentialRampToValueAtTime(lpEnd, t0 + noiseDur);

        // Add a touch of saturation via waveshaper (optional but nice)
        const shaper = ctx.createWaveShaper();
        shaper.curve = (() => {
        const n = 2048;
        const curve = new Float32Array(n);
        // gentle soft clip
        const k = 6;
        for (let i = 0; i < n; i++) {
            const x = (i * 2) / (n - 1) - 1;
            curve[i] = Math.tanh(k * x) / Math.tanh(k);
        }
        return curve;
        })();
        shaper.oversample = "2x";

        noise.connect(lp);
        lp.connect(shaper);
        shaper.connect(noiseGain);
        noiseGain.connect(bus);

        noise.start(t0);
        noise.stop(t0 + noiseDur);

        // ---- (2) Low thump (pitch drop sine) ----
        const osc = ctx.createOscillator();
        osc.type = "sine";

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.0001, t0);
        oscGain.gain.exponentialRampToValueAtTime(0.8, t0 + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + thumpDur);

        osc.frequency.setValueAtTime(thumpStartHz, t0);
        osc.frequency.exponentialRampToValueAtTime(thumpEndHz, t0 + thumpDur);

        // Slight lowpass on thump to keep it round
        const thumpLP = ctx.createBiquadFilter();
        thumpLP.type = "lowpass";
        thumpLP.frequency.setValueAtTime(220, t0);

        osc.connect(thumpLP);
        thumpLP.connect(oscGain);
        oscGain.connect(bus);

        osc.start(t0);
        osc.stop(t0 + thumpDur);

        // ---- (3) Crack transient (tiny click) ----
        // Quick, bright blip using a short noise + highpass.
        if (crackAmt > 0) {
            const crack = ctx.createBufferSource();
            crack.buffer = this.makeNoiseBuffer(0.05);

            const hp = ctx.createBiquadFilter();
            hp.type = "highpass";
            hp.frequency.setValueAtTime(1200, t0);

            const crackGain = ctx.createGain();
            crackGain.gain.setValueAtTime(0.0001, t0);
            crackGain.gain.exponentialRampToValueAtTime(0.7 * crackAmt, t0 + 0.002);
            crackGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);

            crack.connect(hp);
            hp.connect(crackGain);
            crackGain.connect(bus);

            crack.start(t0);
            crack.stop(t0 + 0.05);
        }

        // Cleanup: disconnect later
        const endT = t0 + Math.max(noiseDur, thumpDur) + 0.2;
        setTimeout(() => {
            try {
                noise.disconnect(); lp.disconnect(); shaper.disconnect(); noiseGain.disconnect();
                osc.disconnect(); thumpLP.disconnect(); oscGain.disconnect();
                if (panNode) { bus.disconnect(); panNode.disconnect(); }
                else { bus.disconnect(); }
            } catch {}
        }, Math.ceil((endT - ctx.currentTime) * 1000));
    },

    // Bomber Approach
    createBomberNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    },

    bomberStart(duration = 8) {
        if (!this.audioOn) return;
        if (this.isPlaying) return;

        this.duration = duration;
        this.startTime = this.ctx.currentTime;
        this.isPlaying = true;

        // --- Engine tone oscillators ---
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();

        osc1.type = "sawtooth";
        osc2.type = "triangle";
        osc3.type = "sine";

        osc1.frequency.value = 48;
        osc2.frequency.value = 96;
        osc3.frequency.value = 24;

        // --- Engine mix ---
        const engineGain1 = this.ctx.createGain();
        const engineGain2 = this.ctx.createGain();
        const engineGain3 = this.ctx.createGain();

        engineGain1.gain.value = 0.22;
        engineGain2.gain.value = 0.12;
        engineGain3.gain.value = 0.10;

        // --- Propeller chop: amplitude modulation ---
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const engineMaster = this.ctx.createGain();

        lfo.type = "sine";
        lfo.frequency.value = 18; // prop chop rate
        lfoGain.gain.value = 0.18;

        engineMaster.gain.value = 0.45;

        // Base gain + modulation
        const engineBias = this.ctx.createConstantSource();
        engineBias.offset.value = 0.65;

        // --- Noise for air / roughness ---
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = this.createBomberNoiseBuffer();
        noiseSource.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 700;
        noiseFilter.Q.value = 0.8;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0.04;

        // --- Tone shaping ---
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 1200;

        // --- Panning ---
        const panner = this.ctx.createStereoPanner();
        panner.pan.value = -0.8;

        // Wiring
        osc1.connect(engineGain1);
        osc2.connect(engineGain2);
        osc3.connect(engineGain3);

        engineGain1.connect(engineMaster);
        engineGain2.connect(engineMaster);
        engineGain3.connect(engineMaster);

        lfo.connect(lfoGain);
        lfoGain.connect(engineMaster.gain);
        engineBias.connect(engineMaster.gain);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        engineMaster.connect(lowpass);
        noiseGain.connect(lowpass);

        lowpass.connect(panner);
        panner.connect(this.master);

        // Store
        this.nodes = {
        osc1, osc2, osc3,
        engineGain1, engineGain2, engineGain3,
        lfo, lfoGain, engineMaster, engineBias,
        noiseSource, noiseFilter, noiseGain,
        lowpass, panner
        };

        // Start nodes
        osc1.start();
        osc2.start();
        osc3.start();
        lfo.start();
        engineBias.start();
        noiseSource.start();

        this.animate();
    },

    animate() {
        const now = this.ctx.currentTime;
        const t = now - this.startTime;
        const d = this.duration;

        if (t >= d) {
        this.bomberStop();
        return;
        }

        // 0 -> 1 progress
        const p = t / d;

        // Simulated approach profile:
        // quiet at distance, loudest near end
        const volume = Math.pow(p, 1.8);

        // Pitch rises as bomber approaches
        const base1 = 42 + p * 18;
        const base2 = 84 + p * 36;
        const base3 = 21 + p * 9;

        // Propeller chop speeds up slightly
        const chopRate = 16 + p * 6;

        // More treble as it nears
        const cutoff = 700 + p * 1800;

        // Pan across screen left to right
        const pan = -0.9 + p * 1.8;

        this.nodes.osc1.frequency.setTargetAtTime(base1, now, 0.05);
        this.nodes.osc2.frequency.setTargetAtTime(base2, now, 0.05);
        this.nodes.osc3.frequency.setTargetAtTime(base3, now, 0.05);
        this.nodes.lfo.frequency.setTargetAtTime(chopRate, now, 0.05);
        this.nodes.lowpass.frequency.setTargetAtTime(cutoff, now, 0.05);
        this.nodes.panner.pan.setTargetAtTime(pan, now, 0.05);
        this.master.gain.setTargetAtTime(volume * 0.9, now, 0.05);

        requestAnimationFrame(() => this.animate());
    },

    bomberStop() {
        if (!this.isPlaying) return;
        this.isPlaying = false;

        const now = this.ctx.currentTime;
        this.bomberMaster.gain.cancelScheduledValues(now);
        this.bomberMaster.gain.setTargetAtTime(0, now, 0.08);

        setTimeout(() => {
        try { this.nodes.osc1.stop(); } catch {}
        try { this.nodes.osc2.stop(); } catch {}
        try { this.nodes.osc3.stop(); } catch {}
        try { this.nodes.lfo.stop(); } catch {}
        try { this.nodes.engineBias.stop(); } catch {}
        try { this.nodes.noiseSource.stop(); } catch {}
        }, 200);
    }
   
}