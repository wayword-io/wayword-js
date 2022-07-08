/*
    Licensed on Apache 2.0 with love. Copyright 2022 Chris Larcombe.
*/

function Wayword(digitsFile, checksumCallback)
{
    // Depends on digitsFile with the following checksum:    
    const digitsChecksum = '3ec021c9ae0680b03ee3bded829c6367c3433b84084ee53404fcdfa2daf6c438';
    
    // Load those digits
    let digits;
    loadDigits();

    // Private methods

    function loadDigits()
    {
        fetch(digitsFile)
        .then(response => response.text())
        .then(text => {

            if (!text)
            {
                checksumCallback();
                throw 'could not load digits file'
                return;
            }

            async function digestMessage(message)
            {
                const msgUint8 = new TextEncoder().encode(message);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                return hashHex;
            }
              
            digestMessage(text)
            .then(digestHex => 
            {
                if (digestHex != digitsChecksum)
                {
                    console.error('Wayword digits file '+digitsFile+' checksum failed.');
                    checksumCallback(false, digestHex)
                }
                else
                {
                    digits = Object.freeze(text.split('\n'));
                    checksumCallback(true, digestHex)
                    this.ready = true;
                }
            });
        });
    }

    function from_base(str, base)
    {
        function v(c)
        {
            if (c >= '0'.charCodeAt() && c <= '9'.charCodeAt())
                return (c - '0'.charCodeAt());
            else
                return (c - 'A'.charCodeAt() + 10);
        }

        let len = str.length;
        let power = 1;
        let num = 0;
        let i;

        for(i = len - 1; i >= 0; i--)
        {
            num += v(str[i].charCodeAt()) * power;
            power *= base;
        }
        return num;
    }

    function to_base(n, base)
    {
        function v(n)
        {
            if (n >= 0 && n <= 9)
                return String.fromCharCode(n + 48);
            else
                return String.fromCharCode(n - 10 + 65);
        }

        let s = "";
        while (n > 0)
        {
            s += v(n % base);
            n = parseInt(n / base, 10);
        }
        return s.split('').reverse().join('');
    }
    
    function to_base_43576(n)
    {
        if (n == 0) return digits[0];
        let s = [];
        while (n > 0)
        {
            s.push(digits[n % 43576]);
            n = parseInt(n / 43576, 10);
        }
        return s.reverse().join('-');
    }

    function from_base_43576(str)
    {
        let n = 0;
        let power = 1;
        let i;
        for(i = str.length - 1; i >= 0; i--)
        {
            n += digits.indexOf(str[i]) * power;
            power *= 43576;
        }
        return n;
    }

    function bin2hex(b)
    {
        return b.match(/.{4}/g).reduce(function(a, i) {
            return a + parseInt(i, 2).toString(16);
        }, '')
    }
    
    function indexToWord(h3Index)
    {
        const bin = '0000' + BigInt('0x' + h3Index).toString(2);
        const baseCell = h3.h3GetBaseCell(h3Index);

        let x = '';
        for (let i = 19; i <= 58; i += 3)
            x += from_base(bin.substring(i,i+3), 2);

        return to_base_43576(baseCell*from_base('6'.repeat(14), 7) + from_base(x, 7) + baseCell);
    }

    function wordToIndex(w)
    {
        const max = from_base('6'.repeat(14), 7);
        const out = from_base_43576(w.split('-'));

        let t = max;
        let b;

        for (let i = 0; i < 122; i++)
        {
            if (out <= t)
            {
                b = i;
                break;
            }
            t += max;
        }

        let ab = to_base(out - b*max - b, 7);
        let abab = '0'.repeat(14-ab.length) + ab;
        let newBin = '10001110';
        let bb = to_base(b, 2);
        let bbb = '0'.repeat(7-bb.length) + bb;

        newBin += bbb;

        for (let i = 0; i < 14; i++)
        {
            let x = to_base(abab[i], 2)
            let xx = '0'.repeat(3-x.length) + x;
            newBin += xx;
        }

        newBin += '111';

        return bin2hex(newBin);
    }

    function checkWayword(w)
    {
        let wds = w.split('-');
        for (let i in wds)
            if (digits.indexOf(wds[i]) == -1)
                throw 'invalid digit ' + wds[i];
    }

    function checkLoadedDigits()
    {
        if (!digits) throw 'digits not loaded yet';
    }

    // Public methods

    this.geoToWord = function(lat, lon)
    {
        checkLoadedDigits();
        return indexToWord(h3.geoToH3(lat, lon, 14));
    }

    this.wordToGeo = function(w)
    {
        checkLoadedDigits();
        checkWayword(w);
        return h3.h3ToGeo(wordToIndex(w))
    }

    this.h3ToWord = function(h3Index)
    {
        checkLoadedDigits();

        if (h3.h3GetResolution(h3Index) != 14)
        {
            let c = h3.h3ToGeo(h3Index);
            console.log(c)
            h3Index = h3.geoToH3(c[0], c[1], 14);
            console.log(h3Index)
        }

        return indexToWord(h3Index);
    }

    this.wordToH3 = function(w)
    {
        checkLoadedDigits();   
        checkWayword(w);
        return wordToIndex(w);
    }

    this.getDigits = function()
    {
        return digits;
    }
}