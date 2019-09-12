import * as React from "react";
import styled from "styled-components";

const TimeChooserWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const LabelWrapper = styled.div`
  white-space: pre-wrap;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ValuesWrapper = styled.div`
  display: flex;
`;

const ValueButton = styled.button<{ active: boolean } & React.HTMLAttributes<HTMLButtonElement>>`
  display: flex;
  flex-grow: 1;
  border: none;
  font-size: 32px;
  height: 100%;
  width: 100px;
  margin-left: 16px;
  justify-content: center;
  background-color: ${({ active }) => (active ? "lightgreen" : "lightgray")};
` as React.FunctionComponent<{ active: boolean } & React.HTMLAttributes<HTMLButtonElement>>;

interface ITimeChooserProps {
  label: string;
  values: any[];
  onChange: (val: any) => void;
}

const TimeChooser: React.FunctionComponent<ITimeChooserProps> = ({ label, values, onChange }) => {
  const [active, setActive] = React.useState(values[0]);
  return (
    <TimeChooserWrapper>
      <LabelWrapper>{label}</LabelWrapper>
      <ValuesWrapper>
        {values.map(val => (
          <ValueButton
            active={active === val}
            onClick={() => {
              setActive(val);
              onChange(val);
            }}
          >
            {val}
          </ValueButton>
        ))}
      </ValuesWrapper>
    </TimeChooserWrapper>
  );
};

export { TimeChooser };
