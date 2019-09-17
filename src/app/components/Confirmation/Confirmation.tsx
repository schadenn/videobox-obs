import * as React from "react";
import styled from "styled-components";
import * as ODApi from "onedrive-api";
import * as path from "path";
import * as fs from "fs";
import { config } from "../../videobox.config";

const ConfirmationWrapper = styled.div`
  background-color: white;
  position: absolute;
  z-index: 1337;
  width: 100%;
  height: 100%;
  font-size: 28px;
  text-align: center;
`;

const ImgWrapper = styled.p`
  display: flex;
  justify-content: space-around;
`;
const ThumbImg = styled.img`
  height: 220px;
`;
const CenterP = styled.p`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const BlockImg = styled.img`
  display: block;
  width: 140px;
`;
const OkayButton = styled.button`
  box-shadow: inset 0px 1px 0px 0px #54a3f7;
  background: linear-gradient(to bottom, #1bb41f 5%, #249720 100%);
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

  :last-of-type {
    margin-left: 50px;
  }

  :active {
    top: 1px;
  }
`;

const DeleteButton = styled.button`
  box-shadow: inset 0px 1px 0px 0px #54a3f7;
  background: linear-gradient(to bottom, #d1cc29 5%, #abab00 100%);
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

  :last-of-type {
    margin-left: 50px;
  }

  :active {
    top: 1px;
  }
`;

const Confirmation = ({ accessToken, onDone, filename, onRetry }) => {
  const [okayButtonLabel, setOkayButtonLabel] = React.useState("Okay");
  const filePath = filename && filename.length && path.join(config.recordedFilesPath, filename);

  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  const readableStream = fs.createReadStream(filePath);

  return (
    <ConfirmationWrapper>
      <ImgWrapper>
        <ThumbImg src="assets/pulp_fiction_thumbs.png" />
      </ImgWrapper>
      <h2>It's a wrap!</h2>
      <p>
        Danke für deinen Geburtstagsgruß. Wenn du mit deiner Performance unzufrieden bist kannst du
        es gerne noch einmal probieren. Ansonsten drücke auf "Fertig" und schau dir dein Video und
        die der Anderen an.
      </p>
      <CenterP>
        Scanne dazu einfach den QR Code
        <BlockImg src="assets/qrcode.png" />
        <span>oder unter: bit.do/eWpMU</span>
      </CenterP>
      <OkayButton
        onClick={() => {
          console.log(filename);
          const obj = {
            parentPath: "FilmreifeAufnahmen",
            accessToken,
            filename,
            fileSize,
            readableStream,
          };
          setOkayButtonLabel("Lädt...");
          ODApi.items
            .uploadSession(obj)
            .then(item => console.log(item))
            .catch(item => console.log(item))
            .then(onDone);
        }}
      >
        {okayButtonLabel}
      </OkayButton>
      <DeleteButton onClick={onRetry}>Nochmal</DeleteButton>
    </ConfirmationWrapper>
  );
};

export { Confirmation };
