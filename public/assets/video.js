$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  var token = params.get("token");
  const room = null;
  const JSThis = this;

  const btnMute = $("#mute");
  const btnUnMute = $("#unmute");
  const btnMedia = $("#media");
  const btnUnMedia = $("#unmedia");
  const btnHangUp = $("#hangup");

  const screenAudio = $(".container-voice");
  const screenVideo = $(".container-video");

  var audio = document.getElementById("audio");
  // var token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJpc3MiOiJTS2VhYjY5OGRlOTIyMmU4NDJmYTVlNjA2N2MyYzFjYTdjIiwiZXhwIjoxNjM0ODM2OTc2LCJqdGkiOiJTS2VhYjY5OGRlOTIyMmU4NDJmYTVlNjA2N2MyYzFjYTdjLTE2MzQ4MzMzNzYiLCJzdWIiOiJBQzVhZTJkMDhlNmY1ZTkyMjJjNzNlODE3OWIxNThhNGNhIiwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiUm9vbTEiLCJ2aWRlbyI6eyJyb29tIjoiR2nhuqNuIEjhuqNpIE5hbSJ9fX0.7ae7hBk1U27Wrj1Hjk79VEF2p5IWP0O5SV-X5JrhxVY";
  var localVideo = document.getElementById("local-video");
  var remoteVideo = document.getElementById("remote-video");

  // var connectOptions = {
  //   audio: true,
  //   video: { frameRate: 25, height: 450 },
  // };

  Video.connect(token).then(
    (room) => {
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
        screenAudio.show();
        screenVideo.hide();
        console.log(room);
        room.localParticipant.videoTracks.forEach((publication) => {
          publication.track.disable();
        });
      });

      btnUnMedia.click(function () {
        btnMedia.show();
        btnUnMedia.hide();
        screenAudio.hide();
        screenVideo.show();
        Video.createLocalTracks().then((localTracks) => {
          localTracks.forEach((track) => {
            if (track.kind == "video") {
              localVideo.appendChild(track.attach());
            }
          });
        });
        // room.localParticipant.videoTracks.forEach((publication) => {
        //   publication.track.enable();
        // });
      });
      //#endregion

      function handleTrackDisabled(track) {
        track.on("disabled", () => {
          if (track.kind === "video") {
            remoteVideo.innerHTML = "";
            //remoteVideo.appendChild(img);
          }
        });
      }

      function handleTrackEnabled(track) {
        track.on("enabled", () => {
          if (track.kind === "video") {
            remoteVideo.innerHTML = "";
            remoteVideo.appendChild(track.attach());
          }
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
          if (track.kind == "audio") {
            remoteVideo.appendChild(track.attach());
            console.log("remote audio added");
          }
        });
      });

      // Log new Participants as they connect to the Room
      room.on("participantConnected", (participant) => {
        console.log(`A remote Participant connected: ${participant}`);
        screenAudio.hide();
        screenVideo.show();
        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed) {
            const track = publication.track;
            remoteVideo.appendChild(track.attach());
          }
        });
        participant.on("trackSubscribed", (track) => {
          console.log("pub track:", track);
          if (track.kind == "audio") {
            remoteVideo.appendChild(track.attach());
            console.log("remote audio added");
          }
        });
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
      });

      // To disconnect from a Room
      btnHangUp.click(function () {
        // Detach the local media elements
        room.localParticipant.tracks.forEach((publication) => {
          const attachedElements = publication.track.detach();
          attachedElements.forEach((element) => element.remove());
        });
        room.disconnect();
      });
    },
    (error) => {
      console.error(`Unable to connect to Room: ${error.message}`);
    }
  );

  if (!JSThis.localVideo) {
    Video.createLocalTracks({ video: false }).then(function (localTracks) {
      localTracks.forEach((track) => {
        audio.appendChild(track.attach());
        console.log("local audio added");
      });
    });
    // Video.createLocalTracks().then((localTracks) => {
    //   localTracks.forEach((track) => {
    //       localVideo.appendChild(track.attach());
    //   });
    // });
  }
});
