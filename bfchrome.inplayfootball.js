var BFChrome = window.BFChrome || {};

/**
    The BFChrome.InPlayFootball module creates a
    Google Chrome Extension pop-up version of the Betfair
    In-Play Football website module.

    @namespace Holds the In-play Football Chrome Extension
    @author Tim Huegdon
 */

BFChrome.InPlayFootball = {
    MAXIMUM_ROWS: 10,
    AUS_MARKETS: false,
    BUFFER_MULTIPLIER: 2,

    inPlayReq: new XMLHttpRequest(),
    comingUpReq: new XMLHttpRequest(),

    init: function() {
        BFChrome.InPlayFootball.inPlayReq.open(
            "GET", [
                "http://beta.betfair.com/inplayservice/v1.0/eventsInPlay?",
                "regionCode=UK&",
                "alt=json&",
                "locale=en_GB&",
                "maxResults=" + (
                    BFChrome.InPlayFootball.MAXIMUM_ROWS *
                    BFChrome.InPlayFootball.BUFFER_MULTIPLIER
                ) + "&",
                "eventTypeIds=1&",
                "ts=" + new Date().getTime()
            ].join(''), true
        );
        BFChrome.InPlayFootball.comingUpReq.open(
            "GET", [
                "http://beta.betfair.com/inplayservice/v1.0/eventsComingUp?",
                "regionCode=UK&",
                "alt=json&",
                "locale=en_GB&",
                "maxResults=" + (
                    BFChrome.InPlayFootball.MAXIMUM_ROWS *
                    BFChrome.InPlayFootball.BUFFER_MULTIPLIER
                ) + "&",
                "eventTypeIds=1&",
                "ts=" + new Date().getTime()
            ].join(''), true
        );
        BFChrome.InPlayFootball.inPlayReq.send(null);
        BFChrome.InPlayFootball.comingUpReq.onload = BFChrome.InPlayFootball.showEvents;
        BFChrome.InPlayFootball.comingUpReq.send(null);
    },

    zeroFill: function(number, width) {
        width -= ~~number.toString().length;
        return (width > 0) ?
            new Array(
                width +
                (/\./.test(number) ? 2 : 1)
            ).join('0') + number : number.toString();
    },

    sortByDateAndEvent: function(a, b){
        var x = new Date(a.startTime).getTime(),
            y = new Date(b.startTime).getTime();

        if (x-y !== 0) {
            return x-y;
        } else {
            if (a.eventName > b.eventName) {
                return 1;
            } else if (a.eventName < b.eventName) {
                return -1;
            } else {
                return 0;
            }
        }
    },

    getTableHead: function(headArray) {
        var html = ['<thead><tr>'];

        headArray.forEach(function(val){
            html.push([
                '<th scope="col">',
                val,
                '</th>'
            ].join(''));
        });

        html.push('</tr></thead>');

        return html.join('');
    },

    getTableDOM: function(config) {
        var data = config.data
                        .filter(function filterData(i) {
                            return BFChrome.InPlayFootball.AUS_MARKETS ||
                                i.marketId[0] === '1';
                        })
                        .sort(BFChrome.InPlayFootball.sortByDateAndEvent)
                        .slice(0, config.rows - 1)
                        .map(config.map),
            elTbody, elTable, elHead, elDiv;

        if (data.length > 0) {
            elTBody = document.createElement('tbody');
            elTable = document.createElement('table');
            elHead = document.createElement('h1');
            elDiv = document.createElement('div');

            elHead.innerHTML = config.title;
            elTable.innerHTML += BFChrome.InPlayFootball.getTableHead(
                config.headings
            );

            data.forEach(function renderRow(val) {
                var rowArray = [
                    '<tr><td><a class="button" href="http://beta.betfair.com/event?id=' + val.eventId + '" target="_blank">Bet!</a></td>'
                ];

                config.values.forEach(function renderValue(innerVal) {
                    rowArray.push(
                        '<td>' + val[innerVal] + '</td>'
                    );
                });

                rowArray.push('</tr>');
                elTBody.innerHTML += rowArray.join('');
            });

            elTable.appendChild(elTBody);
            elDiv.appendChild(elHead);
            elDiv.appendChild(elTable);
        }

        return data.length > 0 ? [elDiv, data.length] : false;
    },

    showEvents: function() {
        var inPlayConfig = {
                "title": "In-play",
                "headings": ['Betting', 'Event', 'Period', 'Score'],
                "values": ['eventName', 'state', 'score'],
                "rows": BFChrome.InPlayFootball.MAXIMUM_ROWS,
                "data": JSON.parse(BFChrome.InPlayFootball.inPlayReq.responseText),
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
            inPlayDOM = BFChrome.InPlayFootball.getTableDOM(inPlayConfig),
            comingUpConfig = {
                "title": "Coming up",
                "headings": ['Betting', 'Event', 'When'],
                "values": ['eventName', 'displayDate'],
                "rows": inPlayDOM ?
                    BFChrome.InPlayFootball.MAXIMUM_ROWS - inPlayDOM[1] :
                    BFChrome.InPlayFootball.MAXIMUM_ROWS,
                "data": JSON.parse(BFChrome.InPlayFootball.comingUpReq.responseText),
                "map": function prepRow(i) {
                    var start = new Date(i.startTime),
                        now = new Date(),
                        days = [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday'
                        ],
                        isToday = (start.getDay() === now.getDay()),
                        displayDate = [
                            BFChrome.InPlayFootball.zeroFill(start.getHours(), 2),
                            BFChrome.InPlayFootball.zeroFill(start.getMinutes(), 2)
                        ].join(':');

                    i.displayDate = isToday ?
                        displayDate
                        : [
                            days[start.getDay()],
                            displayDate
                        ].join(' ');

                    return i;
                }
            },
            comingUpDOM = BFChrome.InPlayFootball.getTableDOM(comingUpConfig);

        if (inPlayDOM) {
            document.body.appendChild(inPlayDOM[0]);
        }

        if (comingUpDOM) {
            document.body.appendChild(comingUpDOM[0]);
        }

        document.body.removeChild(document.getElementById("load"));
    }
};
