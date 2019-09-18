import * as React from "react";
import { VideoStream } from "../VideoStream/VideoStream";
import styled from "styled-components";
import { TimeChooser } from "../TimeChooser/TimeChooser";
import OBSRemote from "../../utils/OBSRemote";
import * as fs from "fs";
import { SceneChooser } from "../SceneChooser/SceneChooser";
import { config } from "../../videobox.config";
import { takePhoto } from "../../utils/takePhoto";

const MainWrapper = styled.div`
  height: 100%;
`;
const TopWrapper = styled.div`
  display: flex;
`;
const BottomWrapper = styled.div`
  display: flex;
  background-color: white;
  align-items: center;
  padding: 0 40px;
  justify-content: center;
  background-color: white;
  font-size: 28px;
`;

const SwitchButton = styled.button<{ mg: boolean } & React.HTMLAttributes<HTMLButtonElement>>`
  box-shadow: inset 0px 1px 0px 0px #54a3f7;
  background: linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);
  border-radius: 3px;
  border: 1px solid #124d77;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: Arial;
  font-size: 28px;
  padding: 25px 50px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #154682;

  margin-left: ${({ mg }) => (mg ? "50px" : "0")};

  :active {
    top: 1px;
  }
` as React.FunctionComponent<{ mg: boolean } & React.HTMLAttributes<HTMLButtonElement>>;

const AppMain: React.FC<{
  playbackFile: string;
  onFileRecorded: (file: string) => void;
  onPlaybackEnd: () => void;
}> = ({ playbackFile, onFileRecorded, onPlaybackEnd }) => {
  const [recording, setRecording] = React.useState(false);
  const [showCountdown, setShowCountdown] = React.useState(false);
  const [recTime, setRecTime] = React.useState(config.videoDurations[0]);
  const [mode, setMode] = React.useState<"foto" | "video" | "">("");
  const obs = React.useRef<OBSRemote>();
  const recFiles = React.useRef([]);
  const recordingTimer = React.useRef(0);
  const countdownTimer = React.useRef(0);

  React.useEffect(() => {
    const obsInstance = new OBSRemote();
    obsInstance
      .connect()
      .then(() => obsInstance.login(config.obsWebsocketPw))
      .then(() =>
        obsInstance.on("RecordingStopped", async () => {
          const newFile = (await fs.promises.readdir(config.recordedFilesPath)).find(
            file => !recFiles.current.includes(file),
          );
          onFileRecorded(newFile);
        }),
      )
      .then(() => (obs.current = obsInstance));
  }, []);

  const obsStartRecording = () => obs.current.send({ "request-type": "StartRecording" });
  const obsStopRecording = () => obs.current.send({ "request-type": "StopRecording" });

  async function startRecording() {
    setShowCountdown(true);
    recFiles.current = await fs.promises.readdir(config.recordedFilesPath);
    countdownTimer.current = setTimeout(async () => {
      setShowCountdown(false);
      if (mode === "video") {
        await obsStartRecording();
        setRecording(true);
        recordingTimer.current = window.setTimeout(async () => {
          await obsStopRecording();
          setRecording(false);
        }, recTime * 1000);
      } else if (mode === "foto") {
        setRecording(true);
        takePhoto()
          .then(fileName => {
            onFileRecorded(fileName);
            setRecording(false);
          })
          .catch(error => console.log(error));
      }
    }, 1000 * config.recordingCountdown);
  }

  async function stopRecording() {
    clearTimeout(recordingTimer.current);
    await obsStopRecording();
    setRecording(false);
  }

  function stopCountdown() {
    setShowCountdown(false);
    clearTimeout(countdownTimer.current);
  }

  async function onRecord() {
    if (!recording && !showCountdown) {
      await startRecording();
    } else if (recording) {
      await stopRecording();
    } else if (showCountdown) {
      stopCountdown();
    }
  }

  return (
    <MainWrapper>
      <TopWrapper>
        <SceneChooser obs={obs} />
        <VideoStream
          showCountdown={showCountdown}
          file={playbackFile}
          onPlaybackEnd={onPlaybackEnd}
        />
      </TopWrapper>
      <BottomWrapper>
        {(mode === "" || mode === "foto") && (
          <>
            <SwitchButton
              mg={false}
              onClick={() => {
                setMode("foto");
                onRecord();
              }}
            >
              {recording || showCountdown ? "Cheeeese :)" : "Foto"}
            </SwitchButton>
            {mode !== "foto" && (
              <SwitchButton mg={true} onClick={() => setMode("video")}>
                Video
              </SwitchButton>
            )}
          </>
        )}
        {mode === "video" && (
          <>
            <TimeChooser
              label={"Aufnahmezeit (in Sekunden):"}
              values={config.videoDurations}
              recTime={recTime}
              onChange={val => setRecTime(val)}
            />
            <SwitchButton mg={true} onClick={onRecord}>
              {recording || showCountdown ? "Stop" : "Aufnahme"}
            </SwitchButton>
            <SwitchButton mg={true} onClick={() => setMode("")}>
              Zurück
            </SwitchButton>
          </>
        )}
      </BottomWrapper>
    </MainWrapper>
  );
};

export { AppMain };
