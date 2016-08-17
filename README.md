# Basic Shooter Game
## Versionnumber 0.2.0 (2016-08-17) Alpha
(***Documentation last update 2016-08-17 20:30***)  

Basic shooter game. 
![Screenshot shooting black particles](https://raw.githubusercontent.com/akumagamo/html-shooter-game-basis/master/readme/screenshot_01.png "Screenshot Game Situation")  
  
[Small playable demo](https://rawgit.com/akumagamo/html-shooter-game-basis/master/source/index.html)

## Features

### WIP
* ReadMe / Documentation
* improve HUD Arrow

### Current Features
* Rendering
  * HUD
    * Power Gauge
      * emit speed depending on touch hold
      * holding show gauge
      * Arrow of Shootangle
    * Mini MessageBoard
    * Scoring Counter and Scoreboard
  * particles
    * removing particles out of view
      * only if x-axis bigger than with (ignore y-axis)
    * Gravity and Drag effect
    * Bounce when hit the Ground
  * hitZones
    * changing color when Collision is detected
* Create Random hitZones
* TouchEvents
  * Move / Start / End

### Roadmap / Future Features
* Code Seperation / Major Refactoring
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
* Particles draw images
* Start Button
* Performance Tests / Improvements
* on Collision Particle "explode" and remove 

### Known Bugs
* particles different speeds depence on the angle
* Touchend on the left side emites also a particle
* speeds dont match
* sometimes high Gauge still has slow speed

## Usage

## SourceControl Link & Information
https://github.com/akumagamo/html-shooter-game-basis.git

## Documentation

### File / Folder Structure

     +-+- html-basic-shooter-game
       +-+- documents
       | +- jsdoc  (output directory for jsdoc script)
       +-+- logs (logfile default folder)
       +-+- readme
       | +- screenshot_01.png
       +-+- source
       | +- css
       | +-+- style.css
       | +- js
       | +-+- engine.js
       | +- index.html
       +- readme.md (this document)
       +- LICENSE
