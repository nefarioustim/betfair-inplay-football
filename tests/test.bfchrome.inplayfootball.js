(function(){
    module('BFChrome.InPlayFootball');

    test('zeroFill - Successfully zero fills', function(){
        var value;

        expect(4);

        strictEqual(
            BFChrome.InPlayFootball.zeroFill(1, 10),
            (value = '0000000001'),
            'Expecting value to be ' + value
        );

        strictEqual(
            BFChrome.InPlayFootball.zeroFill(123, 10),
            (value = '0000000123'),
            'Expecting value to be ' + value
        );

        strictEqual(
            BFChrome.InPlayFootball.zeroFill(41241, 10),
            (value = '0000041241'),
            'Expecting value to be ' + value
        );

        strictEqual(
            BFChrome.InPlayFootball.zeroFill(1234567890, 10),
            (value = '1234567890'),
            'Expecting value to be ' + value
        );
    });

    test('zeroFill - Returns a string', function(){
        expect(2);

        strictEqual(
            typeof(BFChrome.InPlayFootball.zeroFill(123, 10)),
            'string',
            'Expecting return type to be "string"'
        );

        strictEqual(
            typeof(BFChrome.InPlayFootball.zeroFill(123, 3)),
            'string',
            'Expecting return type to be "string"'
        );
    });

    test('zeroFill - Returns a string of the correct length', function(){
        var value;

        expect(4);

        strictEqual(
            (value = 3),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );

        strictEqual(
            (value = 9),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );

        strictEqual(
            (value = 86),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );

        strictEqual(
            (value = 321),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );
    });

    test('sortByDateAndEvent - Successfully sorts by date and then event', function(){
        var sort_data = [{
                "eventTypeId": 1,
                "startTime": "2011-12-09T19:30:00.000Z",
                "eventName":"H Berlin v Schalke"
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-09T20:00:00.000Z",
                "eventName":"Bayern Munich v Pinky"
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-11T19:30:00.000Z",
                "eventName":"Man City v The World"
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-09T19:30:00.000Z",
                "eventName":"Coffee v Fridge",
                "relevance": 2
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-09T19:30:00.000Z",
                "eventName":"Arsenal v Spurs",
                "relevance": 1
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-11T19:30:00.000Z",
                "eventName":"Cluj v London"
            }],
            expected = [{
                "eventTypeId": 1,
                "startTime": "2011-12-09T19:30:00.000Z",
                "eventName": "Arsenal v Spurs",
                "relevance": 1
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-09T19:30:00.000Z",
                "eventName": "Coffee v Fridge",
                "relevance": 2
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-09T19:30:00.000Z",
                "eventName": "H Berlin v Schalke"
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-09T20:00:00.000Z",
                "eventName": "Bayern Munich v Pinky"
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-11T19:30:00.000Z",
                "eventName": "Man City v The World"
            },{
                "eventTypeId": 1,
                "startTime": "2011-12-11T19:30:00.000Z",
                "eventName": "Cluj v London"
            }];

        deepEqual(
            sort_data.sort(
                BFChrome.InPlayFootball.sortByDateAndEvent
            ),
            expected,
            'Expecting sorted array of objects.'
        );
    });

    test('getTableHead - Returns expected table head markup', function(){
        expect(2);

        strictEqual(
            BFChrome.InPlayFootball.getTableHead(['Betting', 'Event', 'Period', 'Score']),
            '<thead><tr><th scope="col">Betting</th><th scope="col">Event</th><th scope="col">Period</th><th scope="col">Score</th></tr></thead>',
            'Expecting correct table head markup.'
        );

        strictEqual(
            BFChrome.InPlayFootball.getTableHead(['Foo', 'Bar', 'Baz']),
            '<thead><tr><th scope="col">Foo</th><th scope="col">Bar</th><th scope="col">Baz</th></tr></thead>',
            'Expecting correct table head markup.'
        );
    });

    test('getTableHead - Returns a string', function(){
        expect(2);

        strictEqual(
            typeof(BFChrome.InPlayFootball.getTableHead(['Betting', 'Event', 'Period', 'Score'])),
            'string',
            'Expecting return type to be "string"'
        );

        strictEqual(
            typeof(BFChrome.InPlayFootball.getTableHead(['Betting'])),
            'string',
            'Expecting return type to be "string"'
        );
    });

    test('getTableDOM - Returns expected DOM elements', function(){
        var tableConfig = {
            "title": "In-play",
            "headings": ['Betting', 'Event', 'Period', 'Score'],
            "values": ['eventName', 'state', 'score'],
            "rows": BFChrome.InPlayFootball.MAXIMUM_ROWS,
            "data": STUB.inPlay,
            "map": function prepRow(i) {
                if (i.state) {
                    i.score = [
                        i.state.score.home.score,
                        ' - ',
                        i.state.score.away.score
                    ].join('');

                    switch(i.state.status) {
                        case "FirstHalfEnd":
                            i.state = "HT";
                            break;
                        case "SecondHalfEnd":
                            i.state = "FT";
                            break;
                        default:
                            i.state = i.state.timeElapsed +
                                        '&prime;';
                            break;
                    }
                } else {
                    i.score = '';
                    i.state = 'In-play';
                }

                return i;
            }
        },
        expected = '<h1>In-play</h1><table><thead><tr><th scope="col">Betting</th><th scope="col">Event</th><th scope="col">Period</th><th scope="col">Score</th></tr></thead><tbody><tr><td><a class="button" href="http://beta.betfair.com/event?id=26784925" target="_blank">Bet!</a></td><td>TSW Pegasus v South China</td><td>88′</td><td>2 - 2</td></tr></tbody></table>',
        tableDOM = BFChrome.InPlayFootball.getTableDOM(tableConfig);

        strictEqual(
            tableDOM[0].innerHTML,
            expected,
            'Expecting correct table DOM elements.'
        );
    });
})();
