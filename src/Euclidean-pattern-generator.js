const toussaint = require('./toussaint');

class EuclideanPatternGenerator {
    
    constructor(settings) {
        const {interval, steps, note} = settings;

        this.interval = interval;
        this.steps = steps;
        this.note = note;
        this.sequence = toussaint(interval, steps);
         
    }

    nextStep() {
        const next = this.sequence.shift();
        const previous = this.sequence.pop();
        this.sequence.push(previous);
        this.sequence.push(next);

        if(previous === 0 && next === 0) {
            return {
                action: 'SKIP',
                note: this.note,
            };
        }

        return {
            action: (next === 1) ? 'ON' : 'OFF',
            note: this.note,              
        };
    }

    reset() {
        this.sequence = toussaint(this.interval, this.steps);
    }

}

module.exports = {EuclideanPatternGenerator}