# The Real Comper
## What is the Real Comper?
_The Real Comper_ is a web app which chooses chord voicing solutions for a given a melody and a chord progression. 

## How does it work? 
The app is composed by an editor, in which you can write your own chord progression, and a visualizer in which the final chord progression is retrieved. 
Connect your midi device and start creating!

## First steps
Click **New** and start creating your song. If you want some hints, you can click on **Open** and watch the presets we made for you.
<img align="right" src="Deliverables/New song.PNG"  width="75%" height="70%" style="margin-left:5px;">
Set the song title and the meter. Every row of meters is a meter group, an experiment of ours in which you can choose a meter and then compare it to very similar ones and test some perceptive capabilities.
Then, set the Tempo and the Tonality of the song. For the moment, you can only choose major scales as tonality.

## Write your progression
After you have set the song parameters, start writing your own progression by clicking on every chord block (which is quarter note long). Add or remove bars by simply clicking + or -. 
The system is capable of understanding a great variety of chords. A full list of the available chords can be found in the file _chordNotation.txt_.
By clicking on every chord block you get the representation of the notes over the piano keyboard.

## Recording and generating a voicing progression
Once you are ready, you can enable the metronome and engage the recording. After that, click on **Generate** and **Play** and watch how the initial chords have changed.
The system performs analysis over your melody in order to look for the best voicing progression that can enrich your melody.

You can even **Generate** a voicing progression even if you didn't record a melody.

## Song transformation:
On the left side of the editor you can some parameters that you can edit while writing the song and playing the song.

## General development structure
_The Real Comper_ is developed under to use of several libraries, here reported:

- **React**: structure of the web page and of the View.
- **Teoria.js**: a powerful music library for Javascript, including some very useful classes such as Note, Interval, Chord and Scale.
- **Magenta.js**: a great library for music projects. We used it for the genaration of the audio/midi file and for the visualization of the notes.

