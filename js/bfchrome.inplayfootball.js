var BFChrome = window.BFChrome || {};

/**
 *  The BFChrome.InPlayFootball module creates a
 *  Google Chrome Extension pop-up version of the Betfair
 *  In-Play Football website module.
 *
 *  @namespace Holds the In-play Football Chrome Extension
 *  @author Tim Huegdon
 *  @static
 */

BFChrome.InPlayFootball = {
    MAXIMUM_ROWS: 10,
    AUS_MARKETS: false,
    BUFFER_MULTIPLIER: 5,
    EVENT_PAGE: 'http://beta.betfair.com/football/event?id=',

    inPlayReq: new XMLHttpRequest(),
    comingUpReq: new XMLHttpRequest(),
    inPlayRows: 0,
    comingUpRows: 0,

    /**
     *  Initialises the module and fires the AJAX requests.
     *
     *  @static
     */
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
        BFChrome.InPlayFootball.comingUpReq.send(null);
        BFChrome.InPlayFootball.inPlayReq.onload = BFChrome.InPlayFootball.showInPlay;
        BFChrome.InPlayFootball.comingUpReq.onload = BFChrome.InPlayFootball.showComingUp;
    },

    /**
     *  Returns number as a zero-fill string of width.
     *
     *  @param {Number} number The number to zero-fill
     *  @param {Number} width The length of string to return.
     *  @returns {String} Zero-filled numeric string
     *  @static
     */
    zeroFill: function(number, width) {
        width -= ~~number.toString().length;
        return (width > 0) ?
            new Array(
                width +
                (/\./.test(number) ? 2 : 1)
            ).join('0') + number : number.toString();
    },

    /**
     *  Array.sort() function to sort by event type, relevance,
     *  date and event.
     *
     *  @param {Number} a Value to compare
     *  @param {Number} b Value to compare
     *  @returns {Number}[-1,0,1] Where to reposition value
     *  @static
     */
    sortEvents: function(a, b){
        var x = a.eventTypeId,
            y = b.eventTypeId;

        if (x-y !== 0) {
            return x-y;
        } else {
            x = new Date(a.startTime).getTime();
            y = new Date(b.startTime).getTime();

            if (x-y !== 0) {
                return x-y;
            } else {
                x = a.relevance || Number.POSITIVE_INFINITY;
                y = b.relevance || Number.POSITIVE_INFINITY;

                if (x-y !== 0) {
                    return x-y;
                } else {
                    x = a.eventName.toLowerCase();
                    y = b.eventName.toLowerCase();

                    if (x > y) {
                        return 1;
                    } else if (x < y) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    },

    /**
     *  Returns a string of thead HTML with column-scoped headings
     *  labelled by the array passed in.
     *
     *  @param {Array} headArray An array of headings to use
     *  @returns {String} A string of thead HTML
     *  @static
     */
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

    /**
     *  Returns an array containing a DOM fragment and the number
     *  of rows within the table, based on the configuration passed.
     *
     *  @param {Object} config Configuration object of structure:
     *
     *  {
     *      "title": String,
     *      "headings": Array of strings,
     *      "values": Array of strings (first column is implied),
     *      "rows": Number,
     *      "data": Array,
     *      "map": Function to map to each row of data
     *  }
     *
     *  @returns {Array} Array of structure:
     *
     *  [
     *      DOM fragment,
     *      Number of rows following sort and filter
     *  ]
     *
     *  If number of rows mutates to zero, returns false.
     *  @static
     */
    getTableDOM: function(config) {
        var data = config.data
                        .filter(function filterData(i) {
                            return BFChrome.InPlayFootball.AUS_MARKETS ||
                                i.marketId[0] === '1';
                        })
                        .sort(BFChrome.InPlayFootball.sortEvents)
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
                    '<tr><td><a class="button" href="',
                    BFChrome.InPlayFootball.EVENT_PAGE,
                    val.eventId,
                    '" target="_blank">Bet!</a></td>'
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

    /**
     * Returns prices for each of the markets passed in.
     *
     * @param {Array} markets An array of market IDs
     * @returns {Object} An object of market data referenced by market ID
     * @static
     */
    getPrices: function(markets) {
        /*
        ERO URI:
        http://uk-api.betfair.com/www/sports/exchange/readonly/v1.0/bymarket?
            currencyCode=GBP&
            alt=json&
            locale=en_GB&
            types=MARKET_STATE,MARKET_DESCRIPTION,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST&
            marketIds=[comma separated list]&
            ts=1323638484617
    */
    },

    /**
     *  Callback function used by AJAX requests. Creates tables
     *  based on the data returned.
     *
     *  @static
     */
    showInPlay: function() {
        var inPlayConfig = {
                "title": "In-play",
                "headings": ['Betting', 'Event', 'Period', 'Score'],
                "values": ['eventName', 'state', 'score'],
                "rows": BFChrome.InPlayFootball.MAXIMUM_ROWS,
                "data": JSON.parse(BFChrome.InPlayFootball.inPlayReq.responseText),
                /**
                 *  Map callback. Creates a single score string and
                 *  replaces state with game time or period.
                 *
                 *  @param i Array row
                 *  @returns {Array} Mutated array row
                 */
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
            inPlayDOM = BFChrome.InPlayFootball.getTableDOM(inPlayConfig);

        if (inPlayDOM) {
            BFChrome.InPlayFootball.inPlayRows = inPlayDOM[1];
            document.body.appendChild(inPlayDOM[0]);
        }

        if (document.getElementById("load")) {
            document.body.removeChild(document.getElementById("load"));
        }
    },

    /**
     *  Callback function used by AJAX requests. Creates tables
     *  based on the data returned.
     *
     *  @static
     */
    showComingUp: function() {
        var comingUpConfig = {
                "title": "Coming up",
                "headings": ['Betting', 'Event', 'When'],
                "values": ['eventName', 'displayDate'],
                "rows": BFChrome.InPlayFootball.inPlayRows > 0 ?
                    BFChrome.InPlayFootball.MAXIMUM_ROWS - BFChrome.InPlayFootball.inPlayRows :
                    BFChrome.InPlayFootball.MAXIMUM_ROWS,
                "data": JSON.parse(BFChrome.InPlayFootball.comingUpReq.responseText),
                /**
                 *  Map callback. Creates a displayDate string within
                 *  the array row.
                 *
                 *  @param i Array row
                 *  @returns {Array} Mutated array row
                 */
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

        if (comingUpDOM) {
            BFChrome.InPlayFootball.comingUpRows = comingUpDOM[1];
            document.body.appendChild(comingUpDOM[0]);
        }

        if (document.getElementById("load")) {
            document.body.removeChild(document.getElementById("load"));
        }
    }
};
