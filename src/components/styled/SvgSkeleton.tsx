import { Skeleton, SkeletonProps, styled } from "@mui/material";
import React from "react";

type Props = Omit<SkeletonProps, "className">;

const SvgSkeleton = (props: Props) => {
  return <Skeleton {...props} />;
};

export default styled(SvgSkeleton)`
  width: "100%";
  padding-top: "100%";
`;
