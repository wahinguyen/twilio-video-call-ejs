$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  var token = params.get("token");

  const btnMute = $("#mute");
  const btnUnMute = $("#unmute");
  const btnMedia = $("#media");
  const btnUnMedia = $("#unmedia");
  const btnHangUp = $("#hangup");

  // const remoteAvatar = $("#remote-avatar");
  // const localAvatar = $("#local-avatar");

  const screenAudio = $(".container-voice");
  const screenVideo = $(".container-video");

  // var localVideo1 = $("#local-video");
  // var remoteVideo1 = $("#remote-video");

  var localVideo = document.getElementById("local-video");
  var remoteVideo = document.getElementById("remote-video");

  var localVideoTracks;

  Video.createLocalTracks().then((localTracks) => {
    localVideoTracks = localTracks;

    // localVideo.style = "display: none";
    // localVideo1.hide();
    // localAvatar.show();
  });

  var connectOptions = {
    name: "video call",
    // preferredVideoCodecs: ["H.264"],
    // preferredAudioCodecs: ["OPUS"],
    tracks: localVideoTracks,
    // networkQuality: {
    //   local: 1, // LocalParticipant's Network Quality verbosity [1 - 3]
    //   remote: 2, // RemoteParticipants' Network Quality verbosity [0 - 3]
    // },
  };

  async function createLocalVideo(lvt) {
    var localVideoTrack = lvt.find((track) => track.kind === "video");
    await localVideo.appendChild(localVideoTrack.attach());
  }

  Video.connect(token, connectOptions).then(
    (room) => {
      console.log(`Room connected: "${room}"`);
      createLocalVideo(localVideoTracks);
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
          // localVideo1.hide();
          // localAvatar.show();
        });
      });

      btnUnMedia.click(function () {
        btnMedia.show();
        btnUnMedia.hide();
        room.localParticipant.videoTracks.forEach((publication) => {
          publication.track.enable();
          // localVideo1.show();
          // localAvatar.hide();
        });
      });
      //#endregion

      function handleTrackEnabled(track) {
        track.on("enabled", () => {
          //  if (track.kind == "video") {
          // remoteVideo1.show();
          // remoteAvatar.hide();
          //  }
        });
      }

      function handleTrackDisabled(track) {
        track.on("disabled", () => {
          //  if (track.kind == "video") {
          // remoteVideo1.hide();
          // remoteAvatar.show();
          //  }
        });
      }

      // Log any Participants already connected to the Room
      room.participants.forEach((participant) => {
        console.log(`Participant "${participant.identity}"`);
        screenAudio.hide();
        screenVideo.show();
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
        // remoteAvatar.show();
        // remoteVideo1.hide();
      });

      // Log new Participants as they connect to the Room
      room.on("participantConnected", (participant) => {
        console.log(`A remote Participant connected: ${participant.identity}`);
        screenAudio.hide();
        screenVideo.show();
        participant.tracks.forEach((publication) => {
          console.log("pub: ", publication);
          if (publication.isSubscribed) {
            console.log("pub: ", publication.track);
            //  handleTrackEnabled(publication.track);
            // console.log("publication.track", publication.track);
          }
          //  publication.on("subscribed", handleTrackEnabled);
        });
        participant.on("trackSubscribed", (track) => {
          console.log(track);
          remoteVideo.appendChild(track.attach());
        });
        // remoteVideo1.hide();
        // remoteAvatar.show();
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
        room.disconnect();
      });
    },
    (error) => {
      console.error(`Unable to connect to Room: ${error.message}`);
    }
  );
});
