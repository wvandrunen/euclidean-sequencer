const EuclideanPatternGenerator = require('./src/Euclidean-pattern-generator').EuclideanPatternGenerator;
const MidiInputHandler = require('./src/midi-input-handler').MidiInputHandler;

const sequence = new EuclideanPatternGenerator({interval: 4, steps: 16, note: 36});
const midiInputHandler = new MidiInputHandler();

const disposable = midiInputHandler.subscribeOnStep((ts) => {
    const step = sequence.nextStep();

    switch(step.action) {
        case 'SKIP':
            console.log(`Skip; action required ${step.note}`);
            break;
        case 'ON':
            console.log(`trigger note ON: ${step.note}`);
            break;
        case 'OFF': 
            console.log(`trigger note OFF: ${step.note}`);
            break;
    }
});

midiInputHandler.open(0);