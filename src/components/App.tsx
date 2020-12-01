import {
  AppBar,
  Button,
  Collapse,
  Container,
  createMuiTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Radio,
  RadioGroup,
  Theme,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AspectRatio as AspectRatioIcon,
  Album as AlbumIcon,
  MoveToInbox as MoveToInboxIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Settings as SettingsIcon,
  Brightness4,
  Brightness7,
  BrightnessAuto,
  ControlCamera,
  QueueMusic,
  CropOriginal,
  ExpandMore,
  ExpandLess,
  Info,
  MonetizationOn,
} from "@material-ui/icons";
import {
  AccountGroup,
  Calculator,
  CalendarText,
  StickerEmoji,
} from "mdi-material-ui";
import React, { forwardRef, useMemo, lazy, Suspense, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  LinkProps,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import { SettingContext } from "../context";
import { ContentTransModeType, DisplayModeType } from "../types";

const drawerWidth = 240;
const CardList = lazy(() => import("./card/CardList"));
const HomeView = lazy(() => import("./Home"));
const MusicList = lazy(() => import("./music/MusicList"));
const GachaList = lazy(() => import("./gacha/GachaList"));
const EventList = lazy(() => import("./event/EventList"));
const GachaDetail = lazy(() => import("./gacha/GachaDetail"));
const CardDetail = lazy(() => import("./card/CardDetail"));
const MusicDetail = lazy(() => import("./music/MusicDetail"));
const EventDetail = lazy(() => import("./event/EventDetail"));
const ComicList = lazy(() => import("./comic/ComicList"));
const MemberDetail = lazy(() => import("./MemberDetail"));
const MemberList = lazy(() => import("./MemberList"));
const StampList = lazy(() => import("./stamp/StampList"));
const UnitDetail = lazy(() => import("./UnitDetail"));
const About = lazy(() => import("./About"));
const Support = lazy(() => import("./Support"));
const MusicRecommend = lazy(() => import("./MusicRecommend"));
const StoryReader = lazy(() => import("./storyreader/StoryReader"));

const useStyles = makeStyles((theme) => ({
  toolbar: {
    ...theme.mixins.toolbar,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 3),
    // justifyContent: 'flex-end'
  },
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
}));

interface IListItemLinkProps {
  icon: React.ReactElement;
  text: string;
  to: string;
  disabled: boolean;
  children?: IListItemLinkProps[];
}

function ListItemLink(
  props: IListItemLinkProps & { theme: Theme }
): React.ReactElement<IListItemLinkProps> {
  const { icon, text, to, theme } = props;
  const match = useRouteMatch({
    path: to,
    exact: to === "/",
  });

  const renderLink = useMemo(
    () =>
      forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>((itemProps, ref) => (
        <Link to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li
      style={{
        width: "100%",
      }}
    >
      {/*
      // @ts-ignore */}
      <ListItem component={renderLink}>
        <ListItemIcon
          style={{
            color: match
              ? theme!.palette.secondary.main
              : theme!.palette.text.primary,
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          style={{
            color: match
              ? theme!.palette.secondary.main
              : theme!.palette.text.primary,
          }}
        ></ListItemText>
      </ListItem>
    </li>
  );
}

function App() {
  const { t } = useTranslation();

  const leftBtns: IListItemLinkProps[][] = [
    [
      {
        text: t("common:home"),
        icon: <HomeIcon></HomeIcon>,
        to: "/",
        disabled: false,
      },
      {
        text: t("common:card"),
        icon: <AspectRatioIcon></AspectRatioIcon>,
        to: "/card",
        disabled: false,
      },
      {
        text: t("common:music"),
        icon: <AlbumIcon></AlbumIcon>,
        to: "/music",
        disabled: false,
      },
      {
        text: t("common:gacha"),
        icon: <MoveToInboxIcon></MoveToInboxIcon>,
        to: "/gacha",
        disabled: false,
      },
      {
        text: t("common:event"),
        icon: <CalendarText></CalendarText>,
        to: "/event",
        disabled: false,
      },
      {
        text: t("common:stamp"),
        icon: <StickerEmoji />,
        to: "/stamp",
        disabled: false,
      },
      {
        text: t("common:comic"),
        icon: <CropOriginal />,
        to: "/comic",
        disabled: false,
      },
      {
        text: t("common:character"),
        icon: <AccountGroup></AccountGroup>,
        to: "/chara",
        disabled: false,
      },
      {
        text: "Live2D",
        icon: <ControlCamera></ControlCamera>,
        to: "/live2d",
        disabled: true,
      },
    ],
    [
      {
        text: t("common:musicMeta"),
        icon: <QueueMusic />,
        to: "/music_meta",
        disabled: true,
      },
      {
        text: t("common:musicRecommend"),
        icon: <Calculator />,
        to: "/music_recommend",
        disabled: false,
      },
    ],
    [
      {
        text: t("common:support"),
        icon: <MonetizationOn />,
        to: "/support",
        disabled: false,
      },
      {
        text: t("common:about"),
        icon: <Info />,
        to: "/about",
        disabled: false,
      },
    ],
  ];

  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [sidebarExpansionStates, setSidebarExpansionStates] = React.useState([
    true,
    true,
    true,
  ]);
  const {
    lang,
    displayMode,
    contentTransMode,
    updateLang,
    updateDisplayMode,
    updateContentTransMode,
  } = useContext(SettingContext)!;

  const { goBack } = useHistory();

  const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type:
            displayMode === "auto"
              ? preferDarkMode
                ? "dark"
                : "light"
              : displayMode,
          primary: {
            main:
              displayMode === "auto"
                ? preferDarkMode
                  ? "#7986cb"
                  : "#3f51b5"
                : displayMode === "dark"
                ? "#7986cb"
                : "#3f51b5",
          },
        },
      }),
    [displayMode, preferDarkMode]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <Typography variant="h6">{t("common:toolbar.title")}</Typography>
      </div>
      <Divider></Divider>
      <List>
        <ListItem
          button
          onClick={() =>
            setSidebarExpansionStates((s) => [!s[0], ...s.slice(1)])
          }
        >
          <Typography color="textSecondary">
            {t("common:information")}
          </Typography>
          {sidebarExpansionStates[0] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={sidebarExpansionStates[0]} timeout="auto" unmountOnExit>
          {leftBtns[0].map((elem) => {
            return (
              <ListItem disabled={elem.disabled} button key={elem.to}>
                <ListItemLink
                  to={elem.to}
                  text={elem.text}
                  icon={elem.icon}
                  disabled={elem.disabled}
                  theme={theme}
                ></ListItemLink>
              </ListItem>
            );
          })}
        </Collapse>
        <ListItem
          button
          onClick={() =>
            setSidebarExpansionStates((s) => [s[0], !s[1], ...s.slice(2)])
          }
        >
          <Typography color="textSecondary">{t("common:tools")}</Typography>
          {sidebarExpansionStates[1] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={sidebarExpansionStates[1]} timeout="auto" unmountOnExit>
          {leftBtns[1].map((elem) => {
            return (
              <ListItem disabled={elem.disabled} button key={elem.to}>
                <ListItemLink
                  to={elem.to}
                  text={elem.text}
                  icon={elem.icon}
                  disabled={elem.disabled}
                  theme={theme}
                ></ListItemLink>
              </ListItem>
            );
          })}
        </Collapse>
        <ListItem
          button
          onClick={() =>
            setSidebarExpansionStates((s) => [s[0], s[1], !s[2], ...s.slice(3)])
          }
        >
          <Typography color="textSecondary">{t("common:about")}</Typography>
          {sidebarExpansionStates[1] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={sidebarExpansionStates[2]} timeout="auto" unmountOnExit>
          {leftBtns[2].map((elem) => {
            return (
              <ListItem disabled={elem.disabled} button key={elem.to}>
                <ListItemLink
                  to={elem.to}
                  text={elem.text}
                  icon={elem.icon}
                  disabled={elem.disabled}
                  theme={theme}
                ></ListItemLink>
              </ListItem>
            );
          })}
        </Collapse>
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap classes={{ root: classes.title }}>
              Sekai Viewer{" "}
              <Typography component="span" variant="body2">
                Open Beta
              </Typography>
            </Typography>
            <IconButton color="inherit" onClick={() => goBack()} disableRipple>
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => setIsSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer}>
          <Hidden mdUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              variant="permanent"
              open
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <Container className={classes.content}>
          <div className={classes.toolbar}></div>
          <Switch>
            <Suspense fallback={<div>Loading...</div>}>
              <Route path="/" exact>
                <HomeView />
              </Route>
              <Route path="/card" exact>
                <CardList />
              </Route>
              <Route path="/card/:cardId(\d+)">
                <CardDetail />
              </Route>
              <Route path="/music" exact>
                <MusicList />
              </Route>
              <Route path="/music/:musicId(\d+)">
                <MusicDetail />
              </Route>
              <Route path="/gacha" exact>
                <GachaList />
              </Route>
              <Route path="/gacha/:gachaId">
                <GachaDetail />
              </Route>
              <Route path="/event" exact>
                <EventList />
              </Route>
              <Route path="/event/:eventId">
                <EventDetail />
              </Route>
              <Route path="/stamp">
                <StampList />
              </Route>
              <Route path="/comic">
                <ComicList />
              </Route>
              <Route path="/chara" exact>
                <MemberList />
              </Route>
              <Route path="/chara/:charaId">
                <MemberDetail />
              </Route>
              <Route path="/unit/:unitId">
                <UnitDetail />
              </Route>
              <Route path="/about" exact>
                <About />
              </Route>
              <Route path="/support" exact>
                <Support />
              </Route>
              <Route path="/music_recommend" exact>
                <MusicRecommend />
              </Route>
              <Route path="/storyreader" exact>
                <StoryReader />
              </Route>
            </Suspense>
          </Switch>
        </Container>
        <Dialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
          <DialogTitle>{t("common:settings.title")}</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset" style={{ margin: "1% 0" }}>
              <FormLabel component="legend">{t("common:language")}</FormLabel>
              <RadioGroup
                row
                aria-label="language"
                value={lang}
                onChange={(e, v) => updateLang(v)}
              >
                <FormControlLabel
                  value="en"
                  control={<Radio />}
                  label="EN"
                ></FormControlLabel>
                <FormControlLabel
                  value="zh-CN"
                  control={<Radio />}
                  label="简"
                ></FormControlLabel>
                <FormControlLabel
                  value="zh-TW"
                  control={<Radio />}
                  label="繁"
                ></FormControlLabel>
                <FormControlLabel
                  value="ja"
                  control={<Radio />}
                  label="日"
                ></FormControlLabel>
                <FormControlLabel
                  value="ko"
                  control={<Radio />}
                  label="한"
                ></FormControlLabel>
                <FormControlLabel
                  value="es"
                  control={<Radio />}
                  label="Es"
                ></FormControlLabel>
                <FormControlLabel
                  value="it"
                  control={<Radio />}
                  label="It"
                ></FormControlLabel>
                <FormControlLabel
                  value="pl"
                  control={<Radio />}
                  label="Pl"
                ></FormControlLabel>
                <FormControlLabel
                  value="pt-BR"
                  control={<Radio />}
                  label="Pt-BR"
                ></FormControlLabel>
                <FormControlLabel
                  value="fr"
                  control={<Radio />}
                  label="Fr"
                ></FormControlLabel>
                <FormControlLabel
                  value="id"
                  control={<Radio />}
                  label="Ind"
                ></FormControlLabel>
                <FormControlLabel
                  value="th"
                  control={<Radio />}
                  label="ไทย"
                ></FormControlLabel>
                <FormControlLabel
                  value="ru"
                  control={<Radio />}
                  label="русский"
                ></FormControlLabel>
                <FormControlLabel
                  value="de"
                  control={<Radio />}
                  label="De"
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" style={{ margin: "1% 0" }}>
              <FormLabel component="legend">{t("common:darkmode")}</FormLabel>
              <RadioGroup
                row
                aria-label="dark mode"
                value={displayMode}
                onChange={(e, v) => updateDisplayMode(v as DisplayModeType)}
              >
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label={<Brightness4 />}
                ></FormControlLabel>
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label={<Brightness7 />}
                ></FormControlLabel>
                <FormControlLabel
                  value="auto"
                  control={<Radio />}
                  label={<BrightnessAuto />}
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset" style={{ margin: "1% 0" }}>
              <FormLabel component="legend">
                {t("common:contentTranslationMode.title")}
              </FormLabel>
              <RadioGroup
                row
                aria-label="show translated"
                value={contentTransMode}
                onChange={(e, v) =>
                  updateContentTransMode(v as ContentTransModeType)
                }
              >
                <FormControlLabel
                  value="original"
                  control={<Radio />}
                  label={t("common:contentTranslationMode.original")}
                ></FormControlLabel>
                <FormControlLabel
                  value="translated"
                  control={<Radio />}
                  label={t("common:contentTranslationMode.translated")}
                ></FormControlLabel>
                <FormControlLabel
                  value="both"
                  control={<Radio />}
                  label={t("common:contentTranslationMode.both")}
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSettingsOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}

export default App;
