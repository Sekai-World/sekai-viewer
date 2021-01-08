import React, { Fragment, useMemo } from "react";
import { useParams } from "react-router-dom";
import Announcement from "./editor/Announcement";

interface Props {}

const TranslationEditor = () => {
  const { slug } = useParams<{ slug: string }>();

  const [modelName] = useMemo(() => slug.split(":"), [slug]);

  return (
    <Fragment>
      {modelName === "announcement" && <Announcement slug={slug} />}
    </Fragment>
  );
};

export default TranslationEditor;
