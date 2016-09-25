const midi = require('midi');
const Rx = require('rx');

class MidiInputHandler {

    constructor() {
        this.input = new midi.input();
        this.ppqn_counter = 0;
        this.input.ignoreTypes(true, false, true);
        
        this.stepSubject = new Rx.Subject();
        this.broadcastStepObservable = this.stepSubject.asObservable().publish().refCount();

        const self = this;

        this.input.on('message', function (deltaTime, message) {

            const midiData = self._parseMessage(message);

            if (midiData.type === 'clock') {
                if (self.ppqn_counter % 24 == 0) {
                    self.ppqn_counter = 0;
                    self.stepSubject.onNext(Date.now());
                }
                self.ppqn_counter++;
            }

        });
    }

    subscribeOnStep(fn) {
        return this.broadcastStepObservable.subscribe(fn);
    }
    
    open(inputPort) {
        this.input.openPort(inputPort);
    }

    _parseMessage(bytes) {
        var types = {
            0x08: 'noteoff',
            0x09: 'noteon',
            0x0A: 'poly aftertouch',
            0x0B: 'cc',
            0x0C: 'program',
            0x0D: 'channel aftertouch',
            0x0E: 'pitch',
        };
        var extendedTypes = {
            0xF0: 'sysex',
            0xF1: 'mtc',
            0xF2: 'position',
            0xF3: 'select',
            0xF6: 'tune',
            0xF7: 'sysex end',
            0xF8: 'clock',
            0xFA: 'start',
            0xFB: 'continue',
            0xFC: 'stop',
            0xFF: 'reset'
        };
        var type = 'unknown';
        var msg = {};
        if (bytes[0] >= 0xF0) {
            type = extendedTypes[bytes[0]];
        } else {
            type = types[bytes[0] >> 4];
            msg.channel = bytes[0] & 0xF;
        }
        if (type == 'noteoff' || type == 'noteon') {
            msg.note = bytes[1];
            msg.velocity = bytes[2];
        }
        if (type == 'cc') {
            msg.controller = bytes[1];
            msg.value = bytes[2];
        }
        if (type == 'poly aftertouch') {
            msg.note = bytes[1];
            msg.pressure = bytes[2];
        }
        if (type == 'channel aftertouch') {
            msg.pressure = bytes[1];
        }
        if (type == 'program') {
            msg.number = bytes[1];
        }
        if (type == 'pitch' || type == 'position') {
            msg.value = bytes[1] + (bytes[2] * 128);
        }
        if (type == 'select') {
            msg.song = bytes[1];
        }
        if (type == 'mtc') {
            msg.type = (bytes[1] >> 4) & 0x07;
            msg.value = bytes[1] & 0x0F;
        }
        return {
            status: bytes[0],
            type: type,
            msg: msg,
        };
    };
}

module.exports = {MidiInputHandler};
