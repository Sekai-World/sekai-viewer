import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { Fragment, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch } from "react-router-dom";
import { SettingContext } from "../../context";
import { useLayoutStyles } from "../../styles/layout";
import { IUnitProfile, IUnitStory } from "../../types";
import { useCachedData, useCharaName } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../subs/ContentTrans";
import StoryReaderContent from "./StoryReaderContent";

type storyType = "eventStory" | "unitStory" | "charaStory" | "cardStory";

const StoryReader: React.FC<{}> = () => {
  // const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [unitStories] = useCachedData<IUnitStory>("unitStories");

  const [storyType, setStoryType] = useState<storyType>("unitStory");
  const [unitId, setUnitId] = useState<string>("idol");
  const [unitStoryChapterId, setUnitStoryChapterId] = useState<number>(1);
  const [unitStoryEpisodeId, setUnitStoryEpisodeId] = useState<number>(30000);

  return unitProfiles.length && unitStories.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:storyReader")}
      </Typography>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("common:betaIndicator")}
      </Alert>
      <Container maxWidth="lg">
        <Grid container spacing={1}>
          <Grid item xs={12} md={3}>
            <FormControl style={{ width: "100%" }}>
              <InputLabel id="select-story-type">
                {t("story_reader:selectLabel.storyType")}
              </InputLabel>
              <Select
                labelId="select-story-type"
                value={storyType}
                onChange={(e) => setStoryType(e.target.value as storyType)}
              >
                <MenuItem value="eventStory">
                  <Typography>
                    {t("story_reader:selectValue.eventStory")}
                  </Typography>
                </MenuItem>
                <MenuItem value="unitStory">
                  <Typography>
                    {t("story_reader:selectValue.unitStory")}
                  </Typography>
                </MenuItem>
                <MenuItem value="charaStory">
                  <Typography>
                    {t("story_reader:selectValue.charaStory")}
                  </Typography>
                </MenuItem>
                <MenuItem value="cardStory">
                  <Typography>
                    {t("story_reader:selectValue.cardStory")}
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {storyType === "unitStory" ? (
            <Fragment>
              <Grid item xs={12} md={3}>
                <FormControl style={{ width: "100%" }}>
                  <InputLabel id="select-unit-name">
                    {t("story_reader:selectLabel.unitName")}
                  </InputLabel>
                  <Select
                    labelId="select-unit-name"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value as string)}
                  >
                    {unitProfiles.map((unit) => (
                      <MenuItem value={unit.unit}>
                        <ContentTrans
                          mode={contentTransMode}
                          contentKey={`unit_profile:${unit.unit}.name`}
                          original={unit.unitName}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl style={{ width: "100%" }}>
                  <InputLabel id="select-unit-story-chapter">
                    {t("story_reader:selectLabel.unitStoryChapter")}
                  </InputLabel>
                  <Select
                    labelId="select-unit-story-chapter"
                    value={unitStoryChapterId}
                    onChange={(e) =>
                      setUnitStoryChapterId(e.target.value as number)
                    }
                  >
                    {unitStories
                      .find((us) => us.unit === unitId)!
                      .chapters.map((chapter) => (
                        <MenuItem value={chapter.chapterNo}>
                          <ContentTrans
                            mode={contentTransMode}
                            contentKey={`unit_story_chapter_title:${chapter.unit}-${chapter.chapterNo}`}
                            original={chapter.title}
                          />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl style={{ width: "100%" }}>
                  <InputLabel id="select-unit-story-episode">
                    {t("story_reader:selectLabel.unitStoryEpisode")}
                  </InputLabel>
                  <Select
                    labelId="select-unit-story-episode"
                    value={unitStoryEpisodeId}
                    onChange={(e) =>
                      setUnitStoryEpisodeId(e.target.value as number)
                    }
                  >
                    {unitStories
                      .find((us) => us.unit === unitId)!
                      .chapters.find(
                        (chapter) => chapter.chapterNo === unitStoryChapterId
                      )!
                      .episodes.map((episode) => (
                        <MenuItem value={episode.id}>
                          <ContentTrans
                            mode={contentTransMode}
                            contentKey={`unit_story_episode_title:${episode.id}`}
                            original={`${episode.episodeNoLabel} - ${episode.title}`}
                          />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Fragment>
          ) : null}
        </Grid>
        <Grid container spacing={1}>
          <Grid item>
            <Button variant="contained" color="primary">
              {t("story_reader:buttonLabel.showEpisode")}
            </Button>
          </Grid>
        </Grid>
        <Switch>
          <Route path="/:storyType/:storyId">
            <StoryReaderContent />
          </Route>
        </Switch>
      </Container>
    </Fragment>
  ) : (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:storyReader")}
      </Typography>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("common:betaIndicator")}
      </Alert>
      <Typography>Loading...</Typography>
    </Fragment>
  );
};

export default StoryReader;
