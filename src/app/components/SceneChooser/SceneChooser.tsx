import * as React from "react";
import styled from "styled-components";

const SceneChooserWrapper = styled.div`
  display: inline-block;
  float: left;
  width: 220px;
  height: 720px;
  background-color: white;
`;

const ScenesWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SceneButton = styled.button<{ active: boolean } & React.HTMLAttributes<HTMLButtonElement>>`
  box-shadow: inset 0px 1px 0px 0px #54a3f7;
  background-color: ${({ active }) => (active ? "#33aa33" : "#007dc1")};
  border-radius: 3px;
  border: 1px solid #124d77;
  margin-bottom: 18px;
  display: inline-block;
  cursor: pointer;
  color: white;
  font-family: Arial;
  font-size: 22px;
  padding: 25px 20px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #154682;

  :active {
    top: 1px;
  }
` as React.FunctionComponent<{ active: boolean } & React.HTMLAttributes<HTMLButtonElement>>;

interface ISceneChooserProps {
  obs: any;
}

const SceneChooser: React.FunctionComponent<ISceneChooserProps> = ({ obs }) => {
  const [active, setActive] = React.useState([]);
  const [scenes, setScenes] = React.useState([]);

  React.useEffect(() => {
    if (obs)
      obs.send({ "request-type": "GetSceneList" }).then(sceneList => {
        setScenes(sceneList.scenes.map(scene => scene.name));
        setActive(sceneList["current-scene"]);
      });
  }, [obs]);

  return (
    <SceneChooserWrapper>
      <ScenesWrapper>
        {scenes &&
          scenes.map(val => (
            <SceneButton
              active={active === val}
              onClick={() => {
                obs.send({ "request-type": "SetCurrentScene", "scene-name": val });
                setActive(val);
              }}
            >
              {val}
            </SceneButton>
          ))}
      </ScenesWrapper>
    </SceneChooserWrapper>
  );
};

export { SceneChooser };
