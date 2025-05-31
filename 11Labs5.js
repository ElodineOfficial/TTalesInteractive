let elevenlabs_token = "dcd4b23561146177be7fdd0e1d3478";  // Insert your actual 11labs token
let voice_id = "21m00Tcm4TlvDq8ikWAM";          // Insert an actual voice_id
let stability = 0;
let similarity_boost = 0;

window.activateElevenlabsTTS = function() {
    console.log("Elevenlabs should work now.")
    oc.window.hide();
}


class ElevenlabsTTS {
    constructor(voice_id) {
        this.voice_id = voice_id;
        this.speaking = false;

        this.total_sentences = 0;
        this.active_line = 0;
        this.stored_lines = {};
    }

    speak(line_id) {
        let line = this.stored_lines[this.active_line];
        if (line == null) {
            this.speaking = false;
            return;
        }

        this.speaking = true;

        line.onended = () => {this.speak(line_id + 1)};
        line.play();
        this.active_line = line_id + 1;
    }

    add_utterance(sentence) {
        let speaker = this;
        let sentence_id = this.total_sentences;

        this.total_sentences += 1;

        sentence = sentence.trim();

        var request = new XMLHttpRequest();
        request.open("POST", `https://api.elevenlabs.io/v1/text-to-speech/${this.voice_id}`);
        request.setRequestHeader("Accept", "audio/mpeg");
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("xi-api-key", elevenlabs_token)

        request.onload = function () {
            if (request.readyState == 4) {
                var blob = new Blob([request.response], {"type": "audio/mpeg"});
                var audioURL = window.URL.createObjectURL(blob);

                var audio = new Audio();
                audio.src = audioURL;

                speaker.stored_lines[sentence_id] = audio;

                if (!speaker.speaking && speaker.active_line == sentence_id) {
                    speaker.speak(sentence_id);
                }

            }
        };

        request.responseType = "arraybuffer";
        request.send(JSON.stringify({
            text: sentence,
            voice_settings: {
                stability: stability,
                similarity_boost: similarity_boost
            }
        }));
    }

    activate() {
        let speaker = this;

        let div = document.createElement("div");
        div.innerHTML = "Click me to enable elevenlabs audio.";
        div.style.color = "white";  // Set the text color to white
        div.style.position = "fixed";  // Fixed position
        div.style.top = "50%";  // Center vertically
        div.style.left = "50%";  // Center horizontally
        div.style.transform = "translate(-50%, -50%)";  // Adjust for exact centering
        div.style.zIndex = "1000";  // Make sure it appears above other elements
        div.onclick = window.activateElevenlabsTTS;
        document.body.appendChild(div);

        oc.window.show();

        oc.thread.on("MessageAdded", async function () {
            let message = oc.thread.messages.at(-1);
            if (message.author != "ai") {
                return;
            }
            
            speaker.add_utterance(message.content);
        });
    }
}


let elevenlabs = new ElevenlabsTTS(voice_id);
elevenlabs.activate();