import * as React from "react";
import { VideoStream } from "../VideoStream/VideoStream";
import styled from "styled-components";
import { TimeChooser } from "../TimeChooser/TimeChooser";
import OBSRemote from "../../utils/OBSRemote";
import Timer = NodeJS.Timer;
import * as fs from "fs";
import { SceneChooser } from "../SceneChooser/SceneChooser";
import * as Electron from "electron";
import BrowserWindow = Electron.remote.BrowserWindow;
import * as path from "path";

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

const recFilesPath = "C:/obsrec";

const AppMain: React.FC<{ token: string; onEnd: (file: string) => void }> = ({ token, onEnd }) => {
  const delay = 6;
  const [record, setRecord] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const [recTime, setRecTime] = React.useState(10);
  const [obs, setObs] = React.useState();
  const [delayTimer, setDelayTimer] = React.useState<Array<number | Timer>>([]);
  const [playbackFile, setPlaybackFile] = React.useState("");
  const [mode, setMode] = React.useState<"foto" | "video" | "">("");

  React.useEffect(() => {
    const obsInstance = new OBSRemote();
    obsInstance
      .connect()
      .then(() => obsInstance.login("ichbins"))
      .then(() => obsInstance.on("RecordingStopped", onRecordFinished))
      .then(() => setObs(obsInstance));
  }, []);

  React.useEffect(() => {
    if (record && countdown > 0) {
      setDelayTimer([
        ...delayTimer,
        setTimeout(() => {
          setCountdown(0);
        }, 1000 * delay),
      ]);
    } else if (record) {
      stopCountdown();
      if (mode === "video") {
        obs.send({ "request-type": "StartRecording" }).then(() => {
          setRecording(true);
          (window as any).stopTimer = window.setTimeout(
            () => obs.send({ "request-type": "StopRecording" }).then(() => setRecording(false)),
            recTime * 1000,
          );
        });
      } else if (mode === "foto") {
        setRecording(true);
        const vsWrapper = document.getElementById("videoStreamWrapper");
        const appWrapper = document.getElementById("appWrapper");
        const vsRect = vsWrapper.getBoundingClientRect();
        const appRect = appWrapper.getBoundingClientRect();
        const x = Math.floor((vsRect.left / appRect.width) * 3000);
        const y = Math.floor((vsRect.top / appRect.height) * 2000);
        const width = Math.floor((vsRect.width / appRect.width) * 3000);
        const height = Math.floor((vsRect.height / appRect.height) * 2000);

        const fileName = `${Date.now()}.jpg`;
        setTimeout(() => {
          Electron.desktopCapturer.getSources(
            { types: ["screen"], thumbnailSize: { width: 3000, height: 2000 } },
            (err, src) =>
              fs.writeFile(
                path.join(recFilesPath, fileName),
                src
                  .find(s => s.name === "Entire screen")
                  .thumbnail.crop({ x, y, width, height })
                  .toJPEG(90),
                function(error) {
                  if (error) return console.log(error);
                  console.log("Done");
                  setPlaybackFile(fileName);
                  setRecording(false);
                },
              ),
          );
        }, 300);
      }
    }
  }, [countdown, record]);

  const stopCountdown = () => {
    if (delayTimer) {
      delayTimer.forEach((timeout: number) => clearTimeout(timeout));
      setDelayTimer([]);
      setRecord(false);
      setCountdown(delay);
    }
  };

  const onRecordFinished = () => {
    fs.readdir(recFilesPath, (err, files) => {
      setPlaybackFile(files.find(file => !(window as any).recFiles.includes(file)));
    });
  };

  const onRecord = () => {
    stopCountdown();
    if (!recording && !record) {
      setRecord(true);
      fs.readdir(recFilesPath, (err, files) => {
        (window as any).recFiles = files;
      });
      setDelayTimer([
        ...delayTimer,
        setTimeout(() => {
          setCountdown(delay);
        }, 1000),
      ]);
    } else if (recording) {
      window.clearTimeout((window as any).stopTimer);
      obs.send({ "request-type": "StopRecording" }).then(() => setRecording(false));
    }
  };

  return (
    <MainWrapper>
      <TopWrapper>
        <SceneChooser obs={obs} />
        <VideoStream
          countdown={delayTimer.length && countdown > 0 && countdown}
          file={playbackFile}
          onPlaybackEnd={() => {
            onEnd(playbackFile);
          }}
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
              {recording || record ? "Cheeeese :)" : "Foto"}
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
              values={[10, 30, 60]}
              onChange={val => setRecTime(val)}
            />
            <SwitchButton mg={true} onClick={onRecord}>
              {recording || record ? "Stop" : "Aufnahme"}
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

export { AppMain, recFilesPath };
