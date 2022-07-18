# Wayword

[Wayword](https://wayword.io) is an open-source project to make precise planetary locations identifiable using *waywords* (words that "show the way"), composed of human-readable words called digits. Waywords are made of digits because technically a wayword is a number (in base 43576).

A hyphenated word is a single word composed of smaller words joined using hyphens. A *wayword* is a single word composed of up to 3 words (digits) from the [Wayword Digit List](./dist/wayword-digits.txt), for example: **love**, **love-wins** and **love-wins-again** are three different waywords.

Using up to 3 words combined into one to identify a precise location is the feasible minimum, since the number of possible combinations using 2 words only requires an impossibly large dictionary to cover the number of potential locations (in this case 81 trillion). 

The Wayword project uses [H3](https://h3geo.org/) to represent planetary locations as hexagons, which are approximately 6.3 m² in area and 3.1 m in diameter (at [resolution 14](https://h3geo.org/docs/core-library/restable) used by Wayword). There are about 81 trillion hexagons of this size on Earth. H3 is used to convert geographic coordinates into these hexagons and back again. Wayword gives each of these hexagons a unique name, which is its corresponding wayword.

The Wayword digit list has been compiled from multiple freely available public dictionaries and optimised for general public use. The code includes an integrity check when initialised, which performs a SHA-256 checksum of the digit list file. The hash of the file contents should be as follows:

[Wayword Digit List](https://raw.githubusercontent.com/wayword-io/wayword-js/main/dist/wayword-digits.txt) SHA-256 hash: `3ec021c9ae0680b03ee3bded829c6367c3433b84084ee53404fcdfa2daf6c438` ([checksum file](https://raw.githubusercontent.com/wayword-io/wayword-js/main/dist/wayword-digits.sha256))

Wayword is open-source and fully non-propriatory, including the digit list. The project is made available under the Apache 2.0 license.

![Wayword icon](icon.png "Wayword")

# API

## Wayword(digitsFile, checksumCallback)

- Constructor with two parameters: digitsFile (path to `wayword-digits.txt`) and checksumCallback (function called when digit list is loaded, returning 1) checksum and 2) true/false indicating if checksum succeeded)
- Returns Wayword library

## geoToWord(lat, lon)

- Converts a latitude and longitude coordinate into a wayword
- Returns a string containing a wayword

## wordToGeo(wayword)

- Converts a string containing a wayword into latitude and longitude
- Returns an array containing latitude and longitude coordinate

## h3ToWord(h3Index)

- Converts an H3 index (hexadecimal string) into a wayword
- Returns a string containing a wayword

## wordToH3(wayword)

- Converts a string containing a wayword into an H3 index
- Returns an H3 index (hexidecimal string)

## getDigits()

- Returns the list of 43576 digits used to generate waywords

# Develop

Have fun!

## Example Converter

1. Clone this repository or download the zip of the repository and extract it, to create project directory (wayword-js).

2. Run an HTTP server from the downloaded project directory.

e.g.,

```bash
cd wayword-js
npm i http-server
http-server
```

3. Open http://localhost:8080/example/ in your browser.

4. Experiment with the provided interface, which uses unminified `wayword.js` source file.

5. For an even simpler example to play with, check out http://localhost:8080/example/simple.html


## Regular Expressions

1. Detecting if a string is a wayword (correct format):

```javascript
let input_string = "one-two-three";

if (input_string.match(/^[a-z]+(\-[a-z]+){0,2}$/))
    console.log("input string could be a wayword!");
```

2. Extracting a (potential) wayword from a sentence:

```javascript
let input_string = "See you at one-two-three!";
let m = input_string.match(/([A-Za-z]+-)([A-Za-z]+-)([A-Za-z]+)/);

if (m)
{
    let wayword = m[1]+m[2]+m[3];
    console.log("detected potential wayword:", wayword);
}
```

# Browser

Include H3 and Wayword libraries (you may wish to download [h3-js](https://github.com/uber/h3-js) to your computer or web-server and change the script URL so everything can run locally):

```html
<script src="https://unpkg.com/h3-js"></script>
<script src="wayword.min.js"></script>
```
Then instantiate the library, providing a URL to `wayword-digits.txt`, ensuring it is accessible and the correct filepath is given (example):

```javascript
const wayword = "love-wins-again"
const coords = [74.17273453354373, -23.998183321918876]
const h3Index = "8e07ab8743020cf"

const ww = new Wayword('wayword-digits.txt', function(pass, checksum)
{
    console.log('correct:', pass)
    console.log('digit list checksum:', checksum)

    if (pass)
    {
        console.log( ww.geoToWord(coords[0], coords[1]) )
        console.log( ww.wordToGeo(wayword) )
        console.log( ww.h3ToWord(h3Index) )
        console.log( ww.wordToH3(wayword) ) 
    }
});
```
If the callback returns true (first parameter `pass`) then Wayword is ready to be used. The variable `checksum` is the hash of the digits file.

# About

The Wayword algorithm uses H3 to convert geographical coordinates to an H3 index. The H3 index is then translated into a non-unique base 7 number, which is then shuffled and combined with 1 of 122 different numbers corresponding to H3 hexagon bases (resolution 0) to produce a unique base 10 number for the hexagon (or pentagon, technically, though there are not many). The base 10 number can be thought of a non-hierarchical index for cells on resolution 14.

The unique base 10 number is then converted into a unique base 43576 number associated with a list of 43576 'words' acting as digits, using the following algorithm:

```javascript
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
```
When converting in the opposite direction, the same method is used only in reverse.

This means that technically a wayword is in fact a number (in base 43576), even though it appears to a human to be a (hyphenated) word. The number 43576 relates specifically to the H3 grid system, approximating the cube root of the number of possible cells at resolution 14 on the grid.

# Acknowledgements

Thank you to the authors of [What3Words](https://what3words.com/) for inspiring this project, and to the authors of [H3](https://h3geo.org/) for their awesome hexagon-based grid system, which is used in Wayword to convert between geographic coordinates and geospatial hexagon cells.

Wayword algorithm and digit-list by [Chris Larcombe](https://larcombe.io).

## Relationship to What3Words

The development of [Wayword](https://wayword.io/) was inspired by [What3Words](https://what3words.com/) and [H3](https://h3geo.org/), specifically the idea of using words to reference hexagon in the H3 grid system. The intention of the project is to provide an open-source library which can work both online and offline in any project, without depending on a 3rd party or API calls to a remote server.

Wayword builds on [H3](https://h3geo.org/), an open-source hexagonal hierarchical geospatial indexing system, whereby hexagons on an appropriate resolution (level 14) are given a unique sequence of words.

Unlike [WhatFreeWords](https://justpaste.it/39hat), which was an implementation of the What3Words geocoding algorithm derived through reverse-engineering, Wayword was developed fully independently without any knowledge of the methods/algorithms used by What3Words. Wayword uses a novel method and corresponding algorithm designed by Chris Larcombe (converting H3 indexes on resolution 14 to 'waywords').

Following authorship of the method and algorithm, Chris was made aware of [WhatFreeWords](https://justpaste.it/39hat) (the attempt to open-source a reverse-engineered version of What3Words) and [a patent](https://patents.google.com/patent/CA2909524A1/en) assigned to What3Words Ltd. 

The claims in the patent identify and protect a specific method for producing a "location identifier" ("plurality of words") from geographic coordinates. The method used by Wayword is significantly different to what is contained in the patent.

The main differences are as follows:

1. "receiving at a processor geographical coordinates of a location;
at said processor performing the steps of:
converting the geographical coordinates into a single unique value n;
converting the single unique value n into a unique group of a plurality of values; and converting the plurality of values into an equal plurality of respective words;" ([Claim 1](https://patents.google.com/patent/CA2909524A1/en))

Wayword algorithm does not convert a unique value n representing a location into "a unique group of a plurality of values" and subsequently a "plurality of respective words".

Rather, it uses a novel method to convert an H3 index (representing a location) into a unique base 10 number, and then converts this number very directly and simply into a unique base 43576 number, whereby each digit in the base number system is a human-readable word.

The Wayword method does not require or involve two successive methodological steps where a location or number representing a location is converted into a group of a plurality of values and then converted into a plurality of respective words equal in quantity (which would be 3 values and 3 words, in the case of What3Words).

Furthermore, the details of the method used (Claim 1) by What3Words covered in dependent claims (Claim 2 - 14) and the equivalent reverse (Claim 15, and dependent Claims 16 to 28) make it clear that the method used by What3Words is an entirely different approach/method to that used by Wayword.

2. "converting the geographical coordinates into a cell identity value identifying the cell containing the location, and a cell position value identifying the position of the location within the cell" (Claim 2), "cell identity value is a pair of integers X, Y and the cell position value is a pair of integers x, y." ([Claim 5](https://patents.google.com/patent/CA2909524A1/en))

In Wayword H3 is used to convert geographic coordinates to a hexagon cell on resolution 14. The position of a provided location in the cell is not considered relevant, and the cell is not identified by a pair of integers.

3. Equations in [Claim 7](https://patents.google.com/patent/CA2909524A1/en), [Claim 8](https://patents.google.com/patent/CA2909524A1/en), [Claim 11](https://patents.google.com/patent/CA2909524A1/en).

The method used in Wayword is different and therefore no such equations are used. Wayword does not directly convert geographic coordinates of latitude and longitude into words or use square cells.

See **About** section above for more details.

Another noteworthy difference is that Waywords also contain between 1 and 3 digits ('words'), so unlike What3Words the output is not always '3 words'.

While the idea of representing locations as arbitrary words itself is not novel, we give credit and acknowledgement to What3Words for inspiring this project and popularising the meme.

Whereas What3Words is used in commercial environments, Wayword is likely to be used in open-source environments and projects where users are unable to use What3Words, and/or those that make use of H3 and require a unique name for H3 grid locations.

The two systems can comfortably exist in parallel as they have different use-cases, different priorities and will appeal to different groups. Tools can also be developed to convert between what3words addresses and waywords for cross-compatibility.

# License

Wayword is licensed under the Apache 2.0 License. Copyright 2022 Chris Larcombe.

The Wayword Digit List is also provided open-source on an Apache 2.0 license.