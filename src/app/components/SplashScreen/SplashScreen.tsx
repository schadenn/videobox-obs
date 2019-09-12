import * as React from "react";
import styled from "styled-components";
import { Transition } from "react-transition-group";

const Inner = styled.div`
  width: 600px;
  height: 270px;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  text-align: center;
  flex-direction: column;
  margin-right: 100px;
`;
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-image: url("./assets/background.jpg");
  background-size: cover;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: white;
  font-size: 60px;
  font-family: "Back to the future 2002";
`;
const StartText = styled.div`
  position: relative;
  display: flex;
`;
const StartYour = styled.span`
  position: absolute;
  width: 100%;
  height: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s;
  font-size: 76px;
  color: ${({ isStart }) => (isStart ? "red" : "white")};
  opacity: ${({ state }) => {
    switch (state) {
      case "entered":
        return 1;
      default:
        return 0;
    }
  }};
`;

const SplashScreen = ({ onStart }) => {
  const [showStart, setShowStart] = React.useState(false);
  const [showYour, setShowYour] = React.useState(true);

  // Animate on click button and revert after 3000ms.
  React.useEffect(() => {
    setShowStart(true);
    setShowYour(false);
  }, []);
  React.useEffect(() => {
    setTimeout(() => {
      setShowStart(!showStart);
    }, 3000);
  }, [showStart]);

  React.useEffect(() => {
    setTimeout(() => {
      setShowYour(!showYour);
    }, 3000);
  }, [showYour]);

  return (
    <Wrapper onClick={onStart}>
      <Inner>
        <div>record</div>
        <div>
          <StartText>
            <Transition in={showStart} timeout={500}>
              {state => (
                // state change: exited -> entering -> entered -> exiting -> exited
                <StartYour state={state} isStart>
                  start
                </StartYour>
              )}
            </Transition>
            <Transition in={showYour} timeout={500}>
              {state => (
                // state change: exited -> entering -> entered -> exiting -> exited
                <StartYour state={state}>your</StartYour>
              )}
            </Transition>
          </StartText>
        </div>
        <div>movie</div>
      </Inner>
    </Wrapper>
  );
};
export { SplashScreen };
