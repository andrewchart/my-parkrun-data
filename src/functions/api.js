const { app } = require('@azure/functions');

const Parkrun = require('../model/Parkrun.js');

app.http('parkruns', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let parkruns = [

            new Parkrun(
                "Woking", 
                "18/04/2024", 
                "611", 
                "100", 
                "25:21", 
                "44.19%",
                ""
            ),

            new Parkrun(
                "Woking", 
                "13/01/2024",
                "611",
                "250", 
                "30:01", 
                "24.0%",
                " "
            ),

            new Parkrun(
                "Guildford", 
                "08/07/2023", 
                "611", 
                "175", 
                "26:54",
                "60.19%",
                "  "
            ),

            new Parkrun(
                "Brooklands", 
                "18/12/2021", 
                "160", 
                "40", 
                "22:01",
                "55.36%",
                " PB "
            )
        ];

        let response = {
            body: JSON.stringify({ message: 'OK', parkruns }),
            status: 200
        }

        return response;
    }
});

