import React from "reactn";
import styled from "styled-components";
import { ModalContainer } from "../../components/common/ModalContainer";
import { darkTheme } from "../../theme";
import { ButtonBingo } from "../../components/form";
import { useTranslation } from "../../hooks";

export const ModalVerification = (props) => {
  const { t } = useTranslation("login");

  return (
    <ModalContainer
      footer={null}
      closable={false}
      visible={props.isVisibleModalVerification}
      padding={"1rem"}
      topDesktop="20%"
      background={darkTheme.basic.whiteLight}
      onCancel={() => props.setIsVisibleModalVerification(props.email)}
    >
      <ContentModal>
        <div className="title">{t("saved-player-id")}</div>
        <div className="description">{t("modal-verification")}</div>
        <ButtonBingo variant="secondary" width="200px" onClick={() => props.setIsVisibleModalVerification(props.email)}>
          Ok
        </ButtonBingo>
      </ContentModal>
    </ModalContainer>
  );
};

const ContentModal = styled.div`
  .title {
    font-family: Lato;
    font-style: normal;
    font-weight: bold;
    font-size: 22px;
    line-height: 26px;
    color: ${(props) => props.theme.basic.blackDarken};
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .description {
    text-align: center;
    font-family: Lato;
    font-style: normal;
    font-weight: normal;
    font-size: 15px;
    line-height: 18px;
    color: ${(props) => props.theme.basic.blackDarken};
  }

  button {
    display: block;
    margin-top: 10px;
  }
`;
