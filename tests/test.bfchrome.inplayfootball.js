(function(){
    module('BFChrome.InPlayFootball');

    test('zeroFill - Success', function(){
        var value;

        expect(4);

        equals(
            BFChrome.InPlayFootball.zeroFill(1, 10),
            (value = '0000000001'),
            'Expecting value to be ' + value
        );

        equals(
            BFChrome.InPlayFootball.zeroFill(123, 10),
            (value = '0000000123'),
            'Expecting value to be ' + value
        );

        equals(
            BFChrome.InPlayFootball.zeroFill(41241, 10),
            (value = '0000041241'),
            'Expecting value to be ' + value
        );

        equals(
            BFChrome.InPlayFootball.zeroFill(1234567890, 10),
            (value = '1234567890'),
            'Expecting value to be ' + value
        );
    });

    test('zeroFill - Returns String', function(){
        expect(2);

        equals(
            typeof(BFChrome.InPlayFootball.zeroFill(123, 10)),
            'string',
            'Expecting return type to be "string"'
        );

        equals(
            typeof(BFChrome.InPlayFootball.zeroFill(123, 3)),
            'string',
            'Expecting return type to be "string"'
        );
    });

    test('zeroFill - Return length', function(){
        var value;

        expect(4);

        equals(
            (value = 10),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );

        equals(
            (value = 6),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );

        equals(
            (value = 86),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );

        equals(
            (value = 321),
            BFChrome.InPlayFootball.zeroFill(123, value).length,
            'Expecting length to be ' + value
        );
    });
})();
