const { Temporal: PolyfillTemporal } = require('@js-temporal/polyfill');
const Temporal = globalThis.Temporal ?? PolyfillTemporal;

function Parkrun(event, run_date, run_number, pos, time, age_grade, pb) {
    this.event = event; 
    this.run_date = dateFromUKDateString(run_date); 
    this.run_number = parseInt(run_number); 
    this.pos = parseInt(pos); 
    this.time = temporalFromMinsSecs(time); 
    this.age_grade = parseFloat(age_grade); 
    this.pb = (pb.trim() === 'PB' ? true : false);
}

function dateFromUKDateString(dateString) {
    let ints = dateString.split("/");
    let d = parseInt(ints[0]);
    let m = parseInt(ints[1]) - 1;
    let Y = parseInt(ints[2]);
    return new Date(Y,m,d);
}

function temporalFromMinsSecs(time) {
    let minsSecs = time.split(":");
    return new Temporal.Duration(0, 0, 0, 0, 0, ...minsSecs);
}

module.exports = Parkrun;