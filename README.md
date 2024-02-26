# Universal Paperclips

A clone of [Universal Paperclips](https://www.decisionproblem.com/paperclips/) by Frank Lantz.

I wanted to test how to run a game loop at 60FPS within React, and learn some of the game mechanics for myself. The original is far better.

## Screenshot

![Screenshot](screenshot.png)

## Updates

- Added game loop, clips, and free autoclippers
- Added extremely large number formatting (printing numbers up to 999 novenonagintillion)
- Added time formatting: Yy Dd Hh Mm S.MMMs (eg 123y 45d 01h 23m 45.678s)
- Added funds, selling clips, and buying autoclippers.
- Added wire, buying wire, running out of wire
- Fixed bugs with printing large numbers, and improved the game loop
- Some styling, and more controls for selling and buying

# Dev

## Building the code

You can use yarn or npm: For example, `npm run dev:watch` or `yarn run prod:build`

- `dev:watch`: watches the source folder, compiles source maps, no minification
- `dev:build`: clears the output folder, compiles source maps, no minification, copies index.html
- `prod:build`: clears the output folder, no source maps, yes minification, copies index.html