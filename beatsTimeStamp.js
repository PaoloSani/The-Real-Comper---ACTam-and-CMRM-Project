// todo: aggiungere nella meters_option un campo durationRatio

// const meters_options = [
//     {
//         group: 'Group A',
//         signatures_set: ['4/4', '17/16', '5/4'],
//         durationRatio: [
//              [1,1,1,1],
//              [1,1,1,5/4], // == [1,1,1,1.25]
//              [1,1,1,2]],
//         slot: 4,
//     },
//     {
//         group: 'Group B',
//         signatures_set: ['3/4', '7/8'],
//         durationRatio: [
//              [1,1,1],
//              [1,1,3/2]],
//         slot: 3,
//     },
//     {
//         group: 'Group C',
//         signatures_set: ['5/4'],
//          durationRatio: [[1,1,1,1,1]],
//         slot: 5,
//     },
//     {
//         group: 'Group D',
//         signatures_set: ['7/4'],
//          durationRatio: [[1,1,1,1,1,1,1]],
//         slot: 7,
//     },
// ]


function beatsTimeStamp(songInfo, chart){
// function beatsTimeStamp(songInfo, chart.chartModel.length){

    var quarterNoteDuration = 1 / ( songInfo.bpm / 60 );
    var chartLength = chart.chartModel.length;
    var slot = songInfo.meterType.slot;

    // var durationRatio = songInfo.durationRatio; // e.g. [1,1,1,5/4]
    var durationRatio =  songInfo.meterType.durationRatio[ songInfo.meterType.signatures_set.indexOf(songInfo.meter) ]
    // var durationRatio =  songInfo.meterType.durationRatio[ 2 ]
    console.log(songInfo.meterType.signatures_set.indexOf(songInfo.meter))
    console.log('duration ratio', durationRatio)
    console.log(songInfo)

    var currentTimeStamp = 0;
    var timeStamp = [currentTimeStamp];

    // testing
    // var durationRatio = [1,1,1,5/4]
    // var quarterNoteDuration = 1 / ( 90 / 60 );
    // var chartLength = 10
    // var slot = 4
    for (let i = 0; i < chartLength; i++ ){
        currentTimeStamp += quarterNoteDuration * durationRatio[ i % slot ]
        timeStamp.push(Number(currentTimeStamp.toFixed(5)));
    }
    console.log(timeStamp)

    return timeStamp;

}

export { beatsTimeStamp }