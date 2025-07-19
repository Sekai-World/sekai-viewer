import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
  IMysekaiFixtureInfo,
  IMysekaiFixtureGenre,
  IMysekaiFixtureTag,
} from "../../types";
import { useCachedData } from "../../utils";
import {
  getGenreName,
  getTagNames,
  getThumbnailURL,
} from "../../utils/mysekaiFixtureUtils";
import { observer } from "mobx-react-lite";

const GridView: React.FC<{
  data?: IMysekaiFixtureInfo;
}> = observer(({ data }) => {
  const history = useHistory();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [genres] = useCachedData<IMysekaiFixtureGenre>(
    "mysekaiFixtureMainGenres"
  );
  const [tags] = useCachedData<IMysekaiFixtureTag>("mysekaiFixtureTags");

  useEffect(() => {
    if (data) {
      getThumbnailURL(data, setThumbnailUrl);
    }
  }, [data]);

  if (!data) {
    return (
      <Card>
        <Skeleton
          variant="rectangular"
          sx={{
            paddingTop: "100%",
            position: "relative",
          }}
        />
        <CardContent>
          <Typography variant="subtitle1">
            <Skeleton variant="text" width="90%" />
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="60%" />
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="40%" />
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const genreName = getGenreName(data.mysekaiFixtureMainGenreId, genres);
  const tagNames = getTagNames(data.mysekaiFixtureTagGroup, tags);

  return (
    <Card
      onClick={() => history.push(`/mysekai/fixture/${data.id}`)}
      style={{ cursor: "pointer" }}
    >
      <CardMedia
        image={thumbnailUrl}
        title={data.name}
        sx={{
          paddingTop: "100%",
          position: "relative",
        }}
      />
      <CardContent style={{ paddingBottom: "16px" }}>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <Typography
              variant="subtitle1"
              component="h2"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.2,
              }}
            >
              {data.name}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="textSecondary">
              {genreName}
            </Typography>
          </Grid>
          {tagNames.length > 0 && (
            <Grid item>
              <Grid
                container
                spacing={0.5}
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {tagNames.map((tagName, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={tagName}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: "0.7rem",
                        height: "20px",
                        maxWidth: "160px",
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
});

export default GridView;
