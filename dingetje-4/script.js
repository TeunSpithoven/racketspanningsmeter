container.addEventListener("click", function () {
  // Get microphone input and analyze frequency
  function getMicrophoneInputAndAnalyze() {
    const audioContext = new AudioContext();

    const BUFF_SIZE_RENDERER = 16384;

    let microphone_stream = null;

    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        microphone_stream = audioContext.createMediaStreamSource(stream);

        // Create analyser node
        const analyser_node = audioContext.createAnalyser();
        analyser_node.smoothingTimeConstant = 0;
        analyser_node.fftSize = 2048;

        microphone_stream.connect(analyser_node);

        const buffer_length = analyser_node.frequencyBinCount;
        const array_freq_domain = new Uint8Array(buffer_length);

        // Draw the spectrogram
        analyser_node.onaudioprocess = () => {
          if (
            microphone_stream.playbackState === microphone_stream.PLAYING_STATE
          ) {
            analyser_node.getByteFrequencyData(array_freq_domain);
            drawFrequencyBars(array_freq_domain, buffer_length);
          }
        };
      })
      .catch((e) => {
        alert("Error capturing audio.");
      });
  }

  // Draw frequency bars on canvas
  function drawFrequencyBars(array_freq_domain, buffer_length) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const barWidth = canvas.width / buffer_length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < buffer_length; i++) {
      const barHeight = array_freq_domain[i];

      // Customize bar color (optional)
      const red = (i * barHeight) / 10;
      const green = i * 4;
      const blue = barHeight / 4 - 12;
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

      ctx.fillRect(
        i * barWidth,
        canvas.height - barHeight,
        barWidth,
        barHeight
      );
    }
  }

  // Call the function to start microphone input and analysis
  getMicrophoneInputAndAnalyze();
});
