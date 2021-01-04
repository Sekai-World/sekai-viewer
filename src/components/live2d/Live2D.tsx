import React, { Fragment, useEffect, useRef, useState } from "react";
import Live2D from "@sekai-world/find-live2d-v3";
import Axios from "axios";
import { LAppLive2DManager } from "@sekai-world/find-live2d-v3/dist/types/lapplive2dmanager";
import { LAppModel } from "@sekai-world/find-live2d-v3/dist/types/lappmodel";
import { Autocomplete } from "@material-ui/lab";
import { Button, Grid, TextField } from "@material-ui/core";

const Live2DView: React.FC<{}> = () => {
  const [live2dInstance, setLive2dInstance] = useState<Live2D>(new Live2D());
  const [live2dManager, setLive2dManager] = useState<LAppLive2DManager>();
  const [modelNames, setModelNames] = useState([
    "01ichika_jc",
    "01ichika_unit",
  ]);
  const [motionName, setMotionName] = useState("01ichika_motion_base");
  const [models, setModels] = useState<LAppModel[]>([]);
  const [motions, setMotions] = useState<string[]>([]);
  const [selectedMotion, setSelectedMotion] = useState<(string | null)[]>([
    null,
    null,
  ]);
  const [expressions, setExpressions] = useState<string[]>([]);
  const [selectedExpression, setSelectedExpression] = useState<
    (string | null)[]
  >([null, null]);

  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (wrap.current && canvas.current) {
      setLive2dManager(
        live2dInstance.initialize(undefined, {
          wrap: wrap.current,
          canvas: canvas.current,
        })!
      );
    }
  }, [live2dInstance]);

  useEffect(() => {
    const func = async () => {
      if (live2dManager) {
        for (let modelName of modelNames) {
          const { data: modelData } = await Axios.get<{
            Moc3FileName: string;
            TextureNames: string[];
            PhysicsFileName: string;
            UserDataFileName: string;
            AdditionalMotionData: any[];
            CategoryRules: any[];
          }>(
            `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets/live2d/model/${modelName}_rip/buildmodeldata.asset`,
            { responseType: "json" }
          );

          const { data: motionData } = await Axios.get<{
            motions: string[];
            expressions: string[];
          }>(
            `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets/live2d/motion/${motionName}_rip/BuildMotionData.json`,
            { responseType: "json" }
          );

          const filename = modelData.Moc3FileName.replace(".moc3.bytes", "");
          const model = await live2dManager.addModel({
            path: `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets/live2d/model/${modelName}_rip/`,
            fileName: filename,
            modelName,
            modelSize: 1500,
            textures: [],
            motions: [
              ...motionData.motions.map((name) => ({
                name,
                url: `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets/live2d/motion/${motionName}_rip/${name}.motion3.json`,
              })),
              ...motionData.expressions.map((name) => ({
                name,
                url: `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets/live2d/motion/${motionName}_rip/${name}.motion3.json`,
              })),
            ],
            expressions: [],
          });

          setMotions(motionData.motions);
          setExpressions(motionData.expressions);
          if (model) {
            // setCurrentModel(model);
            model.appear({
              pointX: 200 + 300 * modelNames.indexOf(modelName),
              pointY: 300,
            });
            setModels((data) => [...data, model]);
          }
        }
      }
    };

    func();
  }, [live2dManager, modelNames, motionName]);

  return (
    <Fragment>
      {models.map((model, idx) => (
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Autocomplete
              value={selectedMotion[idx]}
              onChange={(e, v) =>
                setSelectedMotion((data) => {
                  data[idx] = v;
                  return [...data];
                })
              }
              options={motions}
              getOptionLabel={(option) => option}
              renderInput={(props) => <TextField {...props} label="Motions" />}
            />
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              value={selectedExpression[idx]}
              onChange={(e, v) =>
                setSelectedExpression((data) => {
                  data[idx] = v;
                  return [...data];
                })
              }
              options={expressions}
              getOptionLabel={(option) => option}
              renderInput={(props) => (
                <TextField {...props} label="Expressions" />
              )}
            />
          </Grid>

          <Button
            onClick={() => {
              if (selectedExpression[idx] && selectedMotion[idx]) {
                // @ts-ignore
                model.startMotionQueue([
                  {
                    groupName: selectedExpression[idx]!,
                    no: 0,
                    priority: 2,
                    autoIdle: true,
                    autoAppear: false,
                    fadeInTime: 0.5,
                    fadeOutTime: 0.5,
                  },
                  {
                    groupName: selectedMotion[idx]!,
                    no: 0,
                    priority: 3,
                    autoIdle: true,
                    autoAppear: false,
                    fadeInTime: 0.5,
                    fadeOutTime: 0.5,
                  },
                ]);
              }
            }}
          >
            Apply
          </Button>
        </Grid>
      ))}
      <div ref={wrap}>
        <canvas width="720" height="540" ref={canvas}></canvas>
      </div>
    </Fragment>
  );
};

export default Live2DView;
