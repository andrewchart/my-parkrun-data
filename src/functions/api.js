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
                "05/09/2026", 
                "527", 
                "273", 
                "31:09", 
                "43.50%",
                ""
            ),

            new Parkrun(
                "Woking", 
                "31/10/2026",
                "611",
                "250", 
                "30:01", 
                "24.0%",
                " "
            ),

            new Parkrun(
                "Guildford", 
                "03/04/2027", 
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

