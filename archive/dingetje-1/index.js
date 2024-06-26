// var webaudio_tooling_obj = (function () {
  var audioContext = new AudioContext();

  console.log("audio is starting up ...");

  var BUFF_SIZE_RENDERER = 16384;

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

    console.log("__________ " + label);

    if (label === "time") {
      for (; index < num_row_to_display && index < size_buffer; index += 1) {
        var curr_value_time = given_typed_array[index] / 128 - 1.0;
        console.log(curr_value_time);
      }
      // hier logica voor het displayen in een mooi dingetje
    } else if (label === "frequency") {
      for (; index < num_row_to_display && index < size_buffer; index += 1) {
        console.log(given_typed_array[index]);
        // hier naar een canvas printen
      }
    } else {
      throw new Error("ERROR - must pass time or frequency");
    }
  }

  function process_microphone_buffer(event) {
    var i, N, inp, microphone_output_buffer;

    microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now
  }

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

    document.getElementById("volume").addEventListener("change", function () {
      var curr_volume = this.value;
      gain_node.gain.value = curr_volume;

      console.log("curr_volume ", curr_volume);
    });

    // --- setup FFT

    script_processor_analysis_node = audioContext.createScriptProcessor(
      2048,
      1,
      1
    );
    script_processor_analysis_node.connect(gain_node);

    analyser_node = audioContext.createAnalyser();
    analyser_node.smoothingTimeConstant = 0;
    analyser_node.fftSize = 2048;

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
        show_some_data(array_freq_domain, 1, "frequency");
        // show_some_data(array_time_domain, 5, "time"); // store this to record to aggregate buffer/file
      }
    };
  }
// })(); //webaudio_tooling_obj = function();
