import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ServerRegion } from "../../types.d";

import StorySelector from "../../components/story-selector/StorySelector";
import StoryReaderContent from "./StoryReaderContent";
import TypographyHeader from "../../components/styled/TypographyHeader";

const StoryReaderLive2D: React.FC = () => {
  const { t } = useTranslation();
  const [story, setStory] = useState<{
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }>();
  const handleSetStory = (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => {
    if (!data) setStory(undefined);
    else if (data && !story) setStory(data);
    else if (data && story && data.storyId !== story.storyId) setStory(data);
  };

  return (
    <>
      <div>
        <TypographyHeader>{t("common:storyReader")}</TypographyHeader>
      </div>
      <StorySelector onSetStory={handleSetStory} />
      {story && (
        <StoryReaderContent
          storyType={story.storyType}
          storyId={story.storyId}
          region={story.region}
        />
      )}
    </>
  );
};

export default StoryReaderLive2D;
