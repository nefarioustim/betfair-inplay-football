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
})();
