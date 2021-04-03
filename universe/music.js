
var socket = io();

var pitch = 3
soundStarted = false;

$('button.start').on('click', function() {
    
    var pitchShift = new Tone.PitchShift(pitch)
    var chorus = new Tone.Chorus(1, 1, 1)
    var compressor = new Tone.MidSideCompressor()
    var reverb = new Tone.Reverb(2)
    var limiter = new Tone.Limiter(-20)
    var limiter2 = new Tone.Limiter(-40)
    
    var chimeObject = new Tone.PolySynth(4,Tone.Synth, {
        oscillator : {
            type : "sine"
        },
        "envelope" : {
            "attack" : 1,
            "decay" : 1,
            "sustain" : 0.1
        }
    })
    var sineObject = new Tone.PolySynth(8,Tone.Synth, {
        oscillator : {
            type : "sine"
        },
        "envelope" : {
            "attack" : 0.5,
            "decay" : 1,
            "sustain" : 0.2
        }
    })
    var triangleObject = new Tone.PolySynth(8,Tone.Synth, {
        oscillator : {
            type : "triangle"
        },
        "envelope" : {
            "attack" : 0.5,
            "decay" : 1,
            "sustain" : 0.2
        }
    })
    var bassObject = new Tone.Synth(Tone.Synth, {
        oscillator : {
            type : "sine"
        },
        "envelope" : {
            "attack" : 0.5,
            "decay" : 1,
            "sustain" : 0.2
        }
    })
    
    reverb.generate()
    chimeObject.chain(chorus, reverb, pitchShift, compressor, limiter2, Tone.Master);
    sineObject.chain(chorus, reverb, pitchShift, compressor, limiter, Tone.Master);
    triangleObject.chain(chorus, reverb, pitchShift, compressor, limiter, Tone.Master);
    bassObject.chain(pitchShift, compressor, limiter, Tone.Master);
    
    notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    notes = notes.reverse()
    
    if ( !soundStarted ) {
        
        soundStarted = true;
        
        $(document).on('sound', function(event, planetIndex, bpm, isComet) {
            
            var indexNotes
            var octave
            
            switch (planetIndex) {
                case 1:
                    indexNotes = [0, 2]
                    octave = 4
                    break;
                case 2:
                    indexNotes = [2, 4]
                    octave = 4
                    break;
                case 3:
                    indexNotes = [5, 6]
                    octave = 4
                    break;
                case 4:
                    indexNotes = [0, 2]
                    octave = 3
                    break;
                case 5:
                    indexNotes = [2, 4]
                    octave = 3
                    break;
                case 6:
                    indexNotes = [5, 6]
                    octave = 3
                    break;
                case 7:
                    indexNotes = [0, 2, 3]
                    octave = 2
                    break;
                case 8:
                    indexNotes = [3, 4, 6]
                    octave = 2
                    break;
            }
            
            var randomNoteIndex
            if (planetIndex < 7) {
                randomNoteIndex = round( random(indexNotes[0],indexNotes[1]) )
            }
            else {
                randomNoteIndex = random(indexNotes)
            }
            
            var duration = round( (bpm/60) * planetIndex );
            
            if (isComet) {
                octave = 4
                duration = 1
            }
            
            var randomNote = notes[randomNoteIndex] + octave
            
            if (isComet) {
                console.log('comet')
                chimeObject.triggerAttackRelease(randomNote, duration)
            }
            else {
                
                if (planetIndex < 4) {
                    if (round(random(0,2)) > 0) {
                        sineObject.triggerAttackRelease(randomNote, duration)
                    }
                    else {
                        triangleObject.triggerAttackRelease(randomNote, duration)
                    }
                }
                else if (planetIndex >= 4 && planetIndex < 7) {
                    triangleObject.triggerAttackRelease(randomNote, duration)
                }
                else if (planetIndex >= 7) {
                    bassObject.triggerAttackRelease(randomNote, duration)
                }
                
            }
        })
        
    }
    
    socket.on('pitch', function(data) {
        pitch = data
        pitchShift.pitch = pitch
    });
    
    socket.on('scale', function(data) {
        
        if ( data === 'major' ) {
            notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        }
        else if ( data === 'minor' ) {
            notes = ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#']
        }
    });
    
})
