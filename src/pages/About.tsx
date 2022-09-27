import { Container, Link, styled, Typography } from "@mui/material";
import { GitHub } from "@mui/icons-material";
import { Alert, AlertTitle } from "@mui/material";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TypographyHeader from "../components/styled/TypographyHeader";

const StyledAlert = styled(Alert)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const About: React.FC<{}> = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("title:about");
  }, [t]);

  return (
    <Fragment>
      <TypographyHeader>{t("common:about")}</TypographyHeader>
      <Container>
        <StyledAlert severity="info">
          <AlertTitle>{t("about:about_me.title")}</AlertTitle>
          <ul style={{ marginBlockEnd: 0 }}>
            <li>
              <Link
                href="https://blog.dnaroma.eu/"
                target="_blanl"
                rel="noopener"
                underline="hover"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="https://www.github.com/dnaroma"
                target="_blanl"
                rel="noopener"
                underline="hover"
              >
                <GitHub fontSize="inherit"></GitHub>
                GitHub
              </Link>
            </li>
          </ul>
        </StyledAlert>
        <StyledAlert severity="info">
          <AlertTitle>{t("home:alert_contributor.title")}</AlertTitle>
          <Typography>{t("about:missing_hint")}</Typography>
          <ul style={{ marginBlockEnd: 0 }}>
            <li>
              <Link
                href="https://github.com/NonSpicyBurrito"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                <GitHub fontSize="inherit"></GitHub>
                Burrito
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/iSwanGit"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                <GitHub fontSize="inherit"></GitHub>
                iSwanGit (EleMas*)
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/Build774"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                <GitHub fontSize="inherit"></GitHub>
                Build774
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/xfl03"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                <GitHub fontSize="inherit"></GitHub>
                xfl03
              </Link>
            </li>
            <li>
              <GitHub fontSize="inherit"></GitHub>
              vvvvv
            </li>
          </ul>
        </StyledAlert>
        <StyledAlert severity="info">
          <AlertTitle>{t("home:alert_translate.title")}</AlertTitle>
          <Typography>{t("about:missing_hint")}</Typography>
          <ul>
            <li>
              简：Stargazing Koishi, Nightwheel, MoeDev, hodubidu3095, sgkoishi,
              Shui
            </li>
            <li>
              繁：Natsuzawa, ch ko, tofutofuo, Fryer, ayjchen, yumisky0226
            </li>
            <li>
              日：Passion, Cee, k0tayan, Natsuzawa, Build774, あいうえお菓子,
              ikareo, Karuta, MoeDev, watatomo, yumisky0236, aceticke, Harlia,
              おにぶるお, 夢見ねこ
            </li>
            <li>
              한：hodubidu3095, omitooshi, EleMas39, PJSEKAI, 아점, 쿠인/いずく,
              ioeyeong842, Sn_Kinos, kemono, switchP, A Kim
            </li>
            <li>Pt-BR: Kuyaterai, LariBee, ayunjapan</li>
            <li>
              русский: Spyrohat, Yukina Minato, massu_u, kanonchan, Sudi_Avsky
            </li>
            <li>
              Es: ruiemu, maravillas, Jackiore, Mochitachi70, Nachuki, NeoKM,
              ReiZenKai, Tlayoli, Vlxx, fivian_clark, kevinthojedat
            </li>
            <li>It: SeaPu, RayFirefist, Kyon86, MattiVocaloidLover, Aki06</li>
            <li>Pl: sousie, Wheatley, Kimochi, Kimoyo</li>
            <li>En: watatomo, Wandering Spirit</li>
            <li>Fr: Yasito, ManyBees, しょうゆ</li>
            <li>Ind: Rizkiawan (Fueeru), CrystL, Muko Mitsune</li>
            <li>
              ไทย: Revelz, Hydden, Opal_, Shibalnwzaa007, XrossfireX,
              fumikatu.yusa
            </li>
            <li>Ms: mnh48, sayako</li>
            <li>Ca: use, AidenM12</li>
          </ul>
        </StyledAlert>
      </Container>
    </Fragment>
  );
};

export default About;
