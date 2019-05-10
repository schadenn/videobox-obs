import React from "react";
import { VideoStream } from "./components/VideoStream/VideoStream";
import styled from "styled-components";
import { TimeChooser } from "./components/TimeChooser/TimeChooser";
import OBSRemote from "./util/OBSRemote";

const fs = (window as any).require("fs");

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const BottomWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 40px;
  justify-content: space-between;
`;

const TimesInputWrapper = styled.div`
  font-size: 36px;
`;

const RecordButton = styled.button`
  text-transform: uppercase;
  border: 0;
  background-color: red;
  color: white;
  border-radius: 100%;
  font-size: 36px;
  min-width: 250px;
  min-height: 250px;

  :focus {
    border: 0;
    outline: none;
  }
`;

const App: React.FC = () => {
  const [record, setRecord] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [delay, setDelay] = React.useState(5);
  const [countdown, setCountdown] = React.useState(0);
  const [recTime, setRecTime] = React.useState(10);
  const [obs, setObs] = React.useState();
  const [delayTimer, setDelayTimer] = React.useState<number[]>([]);

  React.useEffect(() => {
    setObs(new OBSRemote());
  }, []);

  React.useEffect(() => {
    if (obs) {
      obs
        .connect()
        .then(() => obs.login("ichbins"))
        .then(() =>
          obs.on("RecordingStopped", (data: any) => {
            console.log(fs.readdirSync("C:/obsrec"));
          })
        );
    }
  }, [obs]);

  React.useEffect(() => {
    if (record && countdown > 0) {
      setDelayTimer([
        ...delayTimer,
        setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000)
      ]);
    } else if (record) {
      stopCountdown();
      obs.send({ "request-type": "StartRecording" }).then(() => {
        setRecording(true);
        (window as any).stopTimer = window.setTimeout(
          () =>
            obs
              .send({ "request-type": "StopRecording" })
              .then(() => setRecording(false)),
          recTime * 1000
        );
      });
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

  const onRecord = () => {
    stopCountdown();
    if (!recording && !record) {
      setRecord(true);
      setDelayTimer([
        ...delayTimer,
        setTimeout(() => {
          setCountdown(delay);
        }, 1000)
      ]);
    } else if (recording) {
      window.clearTimeout((window as any).stopTimer);
      obs
        .send({ "request-type": "StopRecording" })
        .then(() => setRecording(false));
    }
  };

  return (
    <AppWrapper>
      <VideoStream
        countdown={delayTimer.length && countdown > 0 && countdown}
      />
      <BottomWrapper>
        <TimesInputWrapper>
          <TimeChooser
            label={"Verzögerung (in Sekunden):"}
            values={[5, 10, 15, 20, 25, 30]}
            onChange={val => setDelay(val)}
          />
          <TimeChooser
            label={"Aufnahmezeit (in Sekunden):"}
            values={[10, 20, 30, 40, 50, 60]}
            onChange={val => setRecTime(val)}
          />
        </TimesInputWrapper>
        <RecordButton onClick={onRecord}>
          {recording || record ? "Stop" : "Aufnahme"}
        </RecordButton>
      </BottomWrapper>
    </AppWrapper>
  );
};

export default App;
