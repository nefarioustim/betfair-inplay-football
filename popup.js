(function(){
    var req = new XMLHttpRequest(),
        req2 = new XMLHttpRequest();
    req.open(
        "GET", [
            "http://beta.betfair.com/inplayservice/v1.0/eventsInPlay?",
            "regionCode=UK&",
            "alt=json&",
            "locale=en_GB&",
            "maxResults=100&",
            "eventTypeIds=1&",
            "ts=" + new Date().getTime()
        ].join(''), true
    );
    req2.open(
        "GET", [
            "http://beta.betfair.com/inplayservice/v1.0/eventsComingUp?",
            "regionCode=UK&",
            "alt=json&",
            "locale=en_GB&",
            "maxResults=100&",
            "eventTypeIds=1&",
            "ts=" + new Date().getTime()
        ].join(''), true
    );
    req.send(null);
    req2.onload = showEvents;
    req2.send(null);

    function zeroFill(number, width) {
        width -= number.toString().length;
        return (width > 0) ?
            new Array(
                width +
                (/\./.test(number) ? 2 : 1)
            ).join('0') + number : number;
    }

    function sortByDateAndEvent(a, b){
        x = new Date(a.startTime).getTime();
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
    }

    function getTableHead(headArray) {
        var html = ['<thead><tr>'];

        headArray.forEach(function(val){
            html.push([
                '<th scope="col">',
                val,
                '</th>'
            ].join(''));
        });

        html.push(['</tr></thead>']);

        return html.join('');
    }

    function getTable() {
        return;
    }

    function showEvents() {
        var inPlayArray = JSON.parse(req.responseText)
                            .filter(function filterData(i) {
                                return i.marketId[0] === '1';
                            })
                            .slice(0, 9)
                            .map(function prepRow(i) {
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
                            }),

            comingUpArray = JSON.parse(req2.responseText)
                                .filter(function(i){
                                    return i.marketId[0] === '1';
                                })
                                .sort(sortByDateAndEvent)
                                .slice(0, 9 - (inPlayArray.length - 1))
                                .map(function prepRow(i) {
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
                                            zeroFill(start.getHours(), 2),
                                            zeroFill(start.getMinutes(), 2)
                                        ].join(':');

                                    i.displayDate = isToday ?
                                        displayDate
                                        : [
                                            days[start.getDay()],
                                            displayDate
                                        ].join(' ');

                                    return i;
                                }),
            elTbody1 = document.createElement('tbody'),
            elTbody2 = document.createElement('tbody'),
            elTable1 = document.createElement('table'),
            elTable2 = document.createElement('table'),
            elHeading1,
            elHeading2;

        var tableConfig = {
            "title": "In-play",
            "headings": ['Betting', 'Event', 'Period', 'Score'],
            "values": ['eventName', 'state', 'score'],
            "rows": 10,
            "data": inPlayArray
        };

        if (inPlayArray.length > 0) {
            elHeading1 = document.createElement('h1');
            elHeading1.innerHTML = 'In-play';
            document.body.appendChild(elHeading1);
            elTable1.innerHTML += getTableHead(['Betting', 'Event', 'Period', 'Score']);

            inPlayArray.forEach(function renderRow(val, idx){
                elTbody1.innerHTML += [
                    '<tr>',
                    '<td><a class="button" href="http://beta.betfair.com/event?id=' + val.eventId + '" target="_blank">Bet!</a></td>',
                    '<td>' + val.eventName + '</td>',
                    '<td>' + val.state + '</td>',
                    '<td>' + val.score + '</td>',
                    '</tr>'
                ].join('');
            });

            elTable1.appendChild(elTbody1);
            document.body.appendChild(elTable1);
        }

        if (comingUpArray.length > 0) {
            elHeading2 = document.createElement('h1');
            elHeading2.innerHTML = 'Coming up';
            document.body.appendChild(elHeading2);
            elTable2.innerHTML += getTableHead(['Betting', 'Event', 'When']);

            comingUpArray.forEach(function renderRow(val, idx){
                elTbody2.innerHTML += [
                    '<tr>',
                    '<td><a class="button" href="http://beta.betfair.com/event?id=' + val.eventId + '" target="_blank">Bet!</a></td>',
                    '<td>' + val.eventName + '</td>',
                    '<td>' + val.displayDate + '</td>',
                    '</tr>'
                ].join('');
            });

            elTable2.appendChild(elTbody2);
            document.body.appendChild(elTable2);
        }

        document.body.removeChild(document.getElementById("load"));
    }
})();