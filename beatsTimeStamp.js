function beatsTimeStamp(songInfo, chart){

    var quarterNoteDuration = 1 / ( songInfo.bpm / 60 );
    var chartLength = chart.chartModel.length;
    var slot = songInfo.meterType.slot;

    var durationRatio =  songInfo.meterType.durationRatio[ songInfo.meterType.signatures_set.indexOf(songInfo.meter) ]


    var currentTimeStamp = 0;
    var timeStamp = [currentTimeStamp];

    for (let i = 0; i < chartLength; i++ ){
        currentTimeStamp += quarterNoteDuration * durationRatio[ i % slot ]
        timeStamp.push(Number(currentTimeStamp.toFixed(5)));
    }

    return timeStamp;

}

export { beatsTimeStamp }