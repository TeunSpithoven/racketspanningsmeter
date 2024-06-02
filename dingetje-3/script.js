// BASIC ANIMATION EXAMPLE
container.addEventListener("click", function () {
  // let audio1 = new Audio();
  // audio1.src = "tune.mp3";

  const container = document.getElementById("container");
  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // for safari browser

  console.log("audio is starting up ...");

  if (!navigator.getUserMedia)
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      { audio: true },
      function (stream) {
        start_microphone(stream);
        // gain_node = audioContext.createGain();
        // gain_node.connect(audioContext.destination);

        // microphone_stream = audioContext.createMediaStreamSource(stream);
        // microphone_stream.connect(gain_node);
      },
      function (e) {
        alert("Error capturing audio.");
      }
    );
  } else {
    alert("getUserMedia not supported in this browser.");
  }

  let audioSource = null;
  let analyser = null;

  // audio1.play();
  audioSource = microphone_stream;
  // audioSource = audioCtx.createMediaElementSource(audio1); // creates an audio node from the audio source
  // analyser = audioCtx.createAnalyser(); // creates an audio node for analysing the audio data for time and frequency
  analyser = analyser_node;
  audioSource.connect(analyser); // connects the audio source to the analyser. Now this analyser can explore and analyse the audio data for time and frequency
  // analyser.connect(audioCtx.destination); // connects the analyser to the destination. This is the speakers

  const ctx = canvas.getContext("2d");

  analyser.fftSize = 128; // controls the size of the FFT. The FFT is a fast fourier transform. Basically the number of sound samples. Will be used to draw bars in the canvas
  const bufferLength = analyser.frequencyBinCount; // the number of data values that dictate the number of bars in the canvas. Always exactly one half of the fft size
  const dataArray = new Uint8Array(bufferLength); // coverting to unsigned 8-bit integer array format because that's the format we need

  const barWidth = canvas.width / bufferLength; // the width of each bar in the canvas

  let barHeight;
  let x = 0; // used to draw the bars one after another. This will get increased by the width of one bar

  // function animate() {
  //   x = 0;
  //   ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
  //   analyser.getByteFrequencyData(dataArray); // copies the frequency data into the dataArray in place. Each item contains a number between 0 and 255
  //   for (let i = 0; i < bufferLength; i++) {
  //     barHeight = dataArray[i]; // the height of the bar is the dataArray value. Larger sounds will have a higher value and produce a taller bar
  //     ctx.fillStyle = "white";
  //     ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight); // draws the bar. the reason we're calculating Y weird here is because the canvas starts at the top left corner. So we need to start at the bottom left corner and draw the bars from there
  //     x += barWidth; // increases the x value by the width of the bar
  //   }

  //   requestAnimationFrame(animate); // calls the animate function again. This method is built in
  // }

  // animate();
});

function start_microphone(stream) {
  gain_node = audioContext.createGain();
  gain_node.connect(audioContext.destination);

  microphone_stream = audioContext.createMediaStreamSource(stream);
  microphone_stream.connect(gain_node);

  script_processor_node = audioContext.createScriptProcessor(
    BUFF_SIZE_RENDERER,
    1,
    1
  );
  script_processor_node.onaudioprocess = process_microphone_buffer;

  microphone_stream.connect(script_processor_node);

  // --- enable volume control for output speakers

  // document.getElementById("volume").addEventListener("change", function () {
  //   var curr_volume = this.value;
  //   gain_node.gain.value = curr_volume;

  //   console.log("curr_volume ", curr_volume);
  // });

  // --- setup FFT

  script_processor_analysis_node = audioContext.createScriptProcessor(
    128,
    1,
    1
  );
  script_processor_analysis_node.connect(gain_node);

  analyser_node = audioContext.createAnalyser();
  analyser_node.smoothingTimeConstant = 0;
  analyser_node.fftSize = 128;

  microphone_stream.connect(analyser_node);

  analyser_node.connect(script_processor_analysis_node);

  var buffer_length = analyser_node.frequencyBinCount;

  var array_freq_domain = new Uint8Array(buffer_length);
  var array_time_domain = new Uint8Array(buffer_length);

  console.log("buffer_length " + buffer_length);

  script_processor_analysis_node.onaudioprocess = function () {
    // get the average for the first channel
    analyser_node.getByteFrequencyData(array_freq_domain);
    analyser_node.getByteTimeDomainData(array_time_domain);

    // draw the spectrogram
    if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {
      show_some_data(array_freq_domain, 100, "frequency");
      // show_some_data(array_time_domain, 5, "time"); // store this to record to aggregate buffer/file
    }
  };
}

// var webaudio_tooling_obj = (function () {
var audioContext = new AudioContext();

console.log("audio is starting up ...");

var BUFF_SIZE_RENDERER = 16384 / 2;

var audioInput = null,
  microphone_stream = null,
  gain_node = null,
  script_processor_node = null,
  script_processor_analysis_node = null,
  analyser_node = null;

if (!navigator.getUserMedia)
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

if (navigator.getUserMedia) {
  navigator.getUserMedia(
    { audio: true },
    function (stream) {
      start_microphone(stream);
    },
    function (e) {
      alert("Error capturing audio.");
    }
  );
} else {
  alert("getUserMedia not supported in this browser.");
}

// ---

function show_some_data(given_typed_array, num_row_to_display, label) {
  var size_buffer = given_typed_array.length;
  var index = 0;

  const ctx = canvas.getContext("2d");

  console.log("__________ " + label);

  if (label === "time") {
    for (; index < num_row_to_display && index < size_buffer; index += 1) {
      var curr_value_time = given_typed_array[index] / 128 - 1.0;
      // console.log(curr_value_time);
    }
    // hier logica voor het displayen in een mooi dingetje
  } else if (label === "frequency") {
    for (; index < num_row_to_display && index < size_buffer; index += 1) {
      console.log(given_typed_array[index]);
      // hier naar een canvas printen
      x = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
      // analyser.getByteFrequencyData(dataArray); // copies the frequency data into the dataArray in place. Each item contains a number between 0 and 255
      for (let i = 0; i < size_buffer; i++) {
        barHeight = given_typed_array[i]; // the height of the bar is the dataArray value. Larger sounds will have a higher value and produce a taller bar
        ctx.fillStyle = "white";
        ctx.fillRect(x, canvas.height - barHeight, 2, barHeight); // draws the bar. the reason we're calculating Y weird here is because the canvas starts at the top left corner. So we need to start at the bottom left corner and draw the bars from there
        x += 2; // increases the x value by the width of the bar
      }

      // requestAnimationFrame(animate); // calls the animate function again. This method is built in
    }
  } else {
    throw new Error("ERROR - must pass time or frequency");
  }
}

function process_microphone_buffer(event) {
  var i, N, inp, microphone_output_buffer;

  microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now
}
