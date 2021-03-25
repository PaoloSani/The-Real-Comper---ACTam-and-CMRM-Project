# The Real Comper
## What is the Real Comper?
<img align="left" src="readmeImages/MAE logo.PNG"  width="10%" style="margin-left:5px; margin-bottom:10px">
_The Real Comper_ is a web app which chooses chord voicing solutions for a given melody over a chord progression written by the user.
The project has been developed as part of two courses in the <a href="https://suono.polimi.it/">Music and Acoustic Engineeering master</a> degree, of the  <a href="https://www.polimi.it/">Politecnico di Milano</a>.
<img align="right" src="https://upload.wikimedia.org/wikipedia/en/b/be/Logo_Politecnico_Milano.png"  width="30%" style="margin-left:5px; margin-bottom:10px">
The courses are <a href="https://www4.ceda.polimi.it/manifesti/manifesti/controller/ManifestoPublic.do?EVN_DETTAGLIO_RIGA_MANIFESTO=evento&aa=2020&k_cf=225&k_corso_la=263&k_indir=MMI&codDescr=054282&lang=IT&semestre=1&anno_corso=1&idItemOfferta=150885&idRiga=258372">Computer Music Representation and Models</a>, and <a href="https://www4.ceda.polimi.it/manifesti/manifesti/controller/ManifestoPublic.do?EVN_DETTAGLIO_RIGA_MANIFESTO=evento&aa=2018&k_cf=225&k_corso_la=263&k_indir=MCR&codDescr=052828&lang=IT&semestre=1&anno_corso=1&idItemOfferta=139981&idRiga=235525">Advanced Coding Tool and Methodologies</a>.

<a href="https://youtu.be/qwCiZa5k7nc"><img align="left" src="readmeImages/yt demo.PNG"  width="20%" style="margin-left:5px; margin-bottom:10px"></a>
An example of that app is hosted [here](https://comper.surge.sh/)
<br><br><br><br><br>

## How does it work? 
The app is composed by an editor, in which you can write your own chord progression, and a visualizer in which the final chord progression is retrieved. 
Connect your midi device and start creating!

![Screenshot](readmeImages/theRealComperMainScreen.PNG)

## First steps
<img align="right" src="readmeImages/New song.PNG"  width="50%" style="margin-left:5px; margin-bottom:10px"><br>
Click **New** and start creating your song. If you want some hints, you can click on **Open** and watch the presets we made for you.
Set the song title and the meter. Every row of meters is a meter group, an experiment of ours in which you can choose a meter and then compare it to very similar ones and test some perceptive capabilities.
Then, set the Tempo and the Tonality of the song. For the moment, you can only choose major scales as tonality.


## Write your progression
After you have set the song parameters, start writing your own progression by clicking on every chord block (which is quarter note long). Add or remove bars by simply clicking + or -. 
The system is capable of understanding a great variety of chords. A full list of the available chords can be found in the file _chordNotation.txt_.
By clicking on every chord block you get the representation of the notes over the piano keyboard.
<img align="left" src="readmeImages/loadSongFromFirebase.PNG"  width="50%" style="margin-right:5px;"><br>


## Recording and generating a voicing progression
Once you are ready, you can enable the metronome and engage the recording. After that, click on **Generate** and **Play** and watch how the initial chords have changed.
The system performs analysis over your melody in order to look for the best voicing progression that can enrich your melody.

You can even **Generate** a voicing progression even if you didn't record a melody.

## Song customization:
On the left side of the page you can change some parameters about the song such as:
- meter: after you set one meter, you can later change between different meter that share the same number of beats per measure but different duration (e.g.: a 4/4 can be changed into 9/8, intended as 2+2+2+3/8)
- tempo (bpm)
- tonality: transpose automatically all the chords

## Save your composition
You can save the song you wrote, and retrive it later! This is powered by [Firebase](https://firebase.google.com/products/firestore)

![Screenshot](readmeImages/firebase.PNG)
> Firebase databes, organized in two collection, users saved songs are separated from presets


## Files
_The Real Comper_ is composed of:

- **index.html**
- **main.js**
contains the main js file, containing all the React components
- **midiRecorder.js**
handles the MIDI device
- **songModel.js**
contains Firebase Configuration, Song class (the main model of the app), functions to save and retrieve this model from Firebase, and other functions to export some data from the class, to be feed into in the Player
- **voicingCreator.js**
implements the algorithm that generat the voicings
- styles.css, chords_css.css, new_song.css
contains the styling of the application


## Dependencies

- [**React**](https://github.com/facebook/react/): structure of the web page and of the View.
- [**Teoria.js**](https://github.com/saebekassebil/teoria): a powerful music library for Javascript, including some very useful classes such as Note, Interval, Chord and Scale.
- [**html-midi-visualizer**](https://github.com/cifkao/html-midi-player): HTML elements powered by [@magenta/music](https://github.com/magenta/magenta-js/tree/master/music/) (Magenta.js)
- [material icons](https://material.io/resources/icons/?icon=fiber_manual_record&style=round)

## Authors
Paolo Sani<br>
Luca Gobbato<br>
Andrés González Paul Rivera

[Licensed under the Non-Profit Open Software License version 3.0](https://tldrlegal.com/license/non-profit-open-software-license-3.0-(nposl-3.0))
