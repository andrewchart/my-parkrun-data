const { app } = require('@azure/functions');

app.http('all', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let parkruns = [

            new Parkrun(
                "Woking", 
                new Date(2024,4,18), 
                611, 
                100, 
                "25:21",//new Temporal.Duration(0,0,0,0,25,21), 
                44.19,
                false
            ),

            new Parkrun(
                "Woking", 
                new Date(2024,0,13), 
                611, 
                250, 
                "30:01",//new Temporal.Duration(0,0,0,0,30,1), 
                24.0,
                false
            ),

            new Parkrun(
                "Guildford", 
                new Date(2023,6,8), 
                611, 
                175, 
                "26:54",//new Temporal.Duration(0,0,0,0,26,54), 
                60.19,
                false
            ),

            new Parkrun(
                "Brooklands", 
                new Date(2021,11,18), 
                160, 
                40, 
                "22:01",//new Temporal.Duration(0,0,0,0,22,1), 
                55.36,
                true
            )
        ];

        let response = {
            body: JSON.stringify({ message: 'OK', parkruns }),
            status: 200
        }

        return response;
    }
});

function Parkrun(event, run_date, run_number, pos, time, age_grade, pb) {
    this.event = event; 
    this.run_date = run_date; 
    this.run_number = run_number; 
    this.pos = pos; 
    this.time = time; 
    this.age_grade = age_grade; 
    this.pb = pb;
}