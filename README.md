# Basic Shooter Game
## Versionnumber 0.2.0 (2016-08-16) Alpha
(***Documentation last update 2016-08-16 16:00***)  

Basic shooter game. 
![Screenshot shooting black particles](https://raw.githubusercontent.com/akumagamo/html-shooter-game-basis/master/readme/screenshot_01.png "Screenshot Game Situation")  
  
[Small playable demo](https://rawgit.com/akumagamo/html-basic-shooter-game/master/source/index.html)

## Features

### WIP
* ReadMe / Documentation

### Current Features
* Rendering
  * HUD
  * Arrow of Shootangle
  * particles
    * removing particles out of view
      * only if x-axis bigger than with (ignore y-axis)
  * hitZones
    * changing color when Collision is detected
* Create Random hitZones
* TouchEvents
  * Move / Start
* Gravity and Drag effect
* Bounce when hit the Ground

### Roadmap / Future Features
* Code Seperation
* cleanup render order, nicer display
* Add Background
  * parallax scrolling
* Audio
  * add Sound Effects
  * add Background Music / ambient sounds
* improve mobile experience
  * manifest File
  * localstorage
* Loading screen
* Performance Tests / Improvements
* Start Button
* Scoring Counter and Scoreboard
* on Collision Particle "explode" and remove 
* emit speed depences on press / holding show gauge

### Known Bugs
* particles different speeds depence on the angle

## Usage

## SourceControl Link & Information
https://github.com/akumagamo/html-basic-shooter-game.git

## Documentation

### File / Folder Structure

     +-+- html-basic-shooter-game
       +-+- documents
       | +- jsdoc  (output directory for jsdoc script)
       +-+- logs (logfile default folder)
       +-+- source
       | +- css
       | +-+- style.css
       | +- js
       | +-+- engine.js
       | +- index.html
       +- readme.md (this document)
       +- LICENSE
