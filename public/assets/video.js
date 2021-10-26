$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  var token = params.get("token");

  const btnMute = $("#mute");
  const btnUnMute = $("#unmute");
  const btnMedia = $("#media");
  const btnUnMedia = $("#unmedia");
  const btnHangUp = $("#hangup");

  const remoteAvatar = $("#remote-avatar");
  const localAvatar = $("#local-avatar");

  const screenAudio = $(".container-voice");
  const screenVideo = $(".container-video");

  var localVideo = document.getElementById("local-video");
  var remoteVideo = document.getElementById("remote-video");
  var islocal = false;
  var ringtone = document.getElementById("ringtone");
  const bMusic = new Audio("assets/HotlineBlingRingtone-DJ.mp3");

  function playAudio() {
    bMusic.play();
    //ringtone.play();
  }
  function pauseAudio() {
    bMusic.pause();
  }

  const showDoctorName = (doctorName) => {
    const doctor_name = document.createElement("p");
    doctor_name.classList.add("doctor-name");
    doctor_name.append(document.createTextNode(`BS. ${doctorName}`));
    const container = document.getElementById("remote-video");
    container.append(doctor_name);
  };

  var connectOptions = {
    preferredVideoCodecs: ["VP8"],
    preferredAudioCodecs: ["OPUS"],
    name: "video call",
    // video: { name: "camera" },
    // audio: { name: "microphone" },
    // networkQuality: {
    //   local: 1, // LocalParticipant's Network Quality verbosity [1 - 3]
    //   remote: 2, // RemoteParticipants' Network Quality verbosity [0 - 3]
    // },
  };
  // if (!Twilio.Video.isSupported) {
  //   alert("this browser not supported");
  // }
  Twilio.Video.connect(token, connectOptions).then(
    (room) => {
      console.log(`Room connected:`, room);
      playAudio();
      //#region handle microphone
      btnMute.click(function () {
        btnMute.hide();
        btnUnMute.show();
        room.localParticipant.audioTracks.forEach((publication) => {
          publication.track.disable();
        });
      });

      btnUnMute.click(function () {
        btnMute.show();
        btnUnMute.hide();
        room.localParticipant.audioTracks.forEach((publication) => {
          publication.track.enable();
        });
      });
      //#endregion

      //#region handle media
      btnMedia.click(function () {
        btnMedia.hide();
        btnUnMedia.show();
        room.localParticipant.videoTracks.forEach((publication) => {
          publication.track.disable();
          localVideo.style = "display: none";
          localAvatar.show();
        });
      });

      btnUnMedia.click(function () {
        btnMedia.show();
        btnUnMedia.hide();
        room.localParticipant.videoTracks.forEach((publication) => {
          publication.track.enable();
          localVideo.style = "display: block";
          localAvatar.hide();
        });
      });
      //#endregion

      function handleTrackEnabled(track) {
        track.on("enabled", () => {
          if (track.kind == "video") {
            remoteVideo.style = "display: block";
            remoteAvatar.hide();
          }
        });
      }

      function handleTrackDisabled(track) {
        track.on("disabled", () => {
          if (track.kind == "video") {
            remoteVideo.style = "display: none";
            remoteAvatar.show();
          }
        });
      }
      // Log new Participants as they connect to the Room
      room.on("participantConnected", (participant) => {
        console.log(`A remote Participant connected: ${participant.identity}`);
        pauseAudio();
        showDoctorName(participant.identity);
        screenAudio.hide();
        screenVideo.show();
        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed) {
            const track = publication.track;
            const container = document.getElementById("remote-video");
            container.appendChild(track.attach());
            handleTrackEnabled(publication.track);
          }
          publication.on("subscribed", handleTrackEnabled);
        });
        participant.on("trackSubscribed", (track) => {
          const container = document.getElementById("remote-video");
          container.appendChild(track.attach());
          // remoteVideo.appendChild(track.attach());
        });
        remoteVideo.style = "display: none";
        remoteAvatar.show();
      });

      // Log any Participants already connected to the Room
      room.participants.forEach((participant) => {
        console.log(`Participant "${participant.identity}"`);
        screenAudio.hide();
        screenVideo.show();
        pauseAudio();
        participant.tracks.forEach((publication) => {
          if (publication.track) {
            remoteVideo.appendChild(publication.track.attach());
          }
          if (publication.isSubscribed) {
            handleTrackDisabled(publication.track);
            handleTrackEnabled(publication.track);
          }
          publication.on("subscribed", handleTrackDisabled);
          publication.on("subscribed", handleTrackEnabled);
        });
        participant.on("trackSubscribed", (track) => {
          remoteVideo.appendChild(track.attach());
        });
        remoteVideo.style = "display: none";
        remoteAvatar.show();
      });

      room.on("participantDisconnected", (participant) => {
        console.log(`Participant disconnected: ${participant.identity}`);
      });

      room.on("disconnected", (room) => {
        // Detach the local media elements
        room.localParticipant.tracks.forEach((publication) => {
          const attachedElements = publication.track.detach();
          attachedElements.forEach((element) => element.remove());
        });
        room.disconnect();
        alert("Room closed");
      });

      // To disconnect from a Room
      btnHangUp.click(function () {
        // Detach the local media elements
        room.localParticipant.tracks.forEach((publication) => {
          const attachedElements = publication.track.detach();
          console.log("attachedElements", attachedElements);
          attachedElements.forEach((element) => element.remove());
        });
        pauseAudio();
        room.disconnect();
      });

      if (!islocal) {
        room.localParticipant.tracks.forEach((publication) => {
          if (publication.track.kind === "video") {
            localVideo.appendChild(publication.track.attach());
            publication.track.disable();
            localVideo.style = "display: none";
            localAvatar.show();
          }
        });
        islocal = true;
      }
    },
    (error) => {
      console.error(`Unable to connect to Room: ${error.message}`);
    }
  );
});
