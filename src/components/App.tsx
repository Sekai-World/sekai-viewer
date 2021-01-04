import {
  AppBar,
  Button,
  Collapse,
  Container,
  unstable_createMuiStrictModeTheme as createMuiTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
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
  Menu,
  MenuItem,
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
  Textsms,
  KeyboardArrowUp,
  Assignment,
  AccountCircle,
  Timeline,
  MoreVert,
} from "@material-ui/icons";
import {
  AccountGroup,
  Bullhorn,
  Calculator,
  CalendarText,
  StickerEmoji,
} from "mdi-material-ui";
import React, {
  // forwardRef,
  useMemo,
  lazy,
  Suspense,
  useContext,
  Fragment,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  // LinkProps,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import { SettingContext, UserProvider } from "../context";
import { ContentTransModeType, DisplayModeType } from "../types";
import ScrollTop from "./subs/ScrollTop";

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
const EventPointCalc = lazy(() => import("./EventPointCalc"));
const StoryReader = lazy(() => import("./storyreader/StoryReader"));
const TitleMissionList = lazy(() => import("./mission/honor/TitleMissionList"));
const NormalMissionList = lazy(
  () => import("./mission/normal/NormalMissionList")
);
const BeginnerMissionList = lazy(
  () => import("./mission/beginner/BeginnerMissionList")
);
const CharacterMissionList = lazy(
  () => import("./mission/character/CharacterMissionList")
);
const User = lazy(() => import("./user/User"));
const Connect = lazy(() => import("./user/Connect"));
const EventTracker = lazy(() => import("./event/EventTracker"));
const AnnouncementList = lazy(() => import("./announcement/AnnouncementList"));
const AnnouncementDetail = lazy(
  () => import("./announcement/AnnouncementDetail")
);
const Live2D = lazy(() => import("./live2d/Live2D"));

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
    "&::-webkit-scrollbar": {
      width: "0.5em",
    },
    "&::-webkit-scrollbar-track": {
      "box-shadow": "inset 0 0 6px rgba(0,0,0,0.5)",
      "border-radius": "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      "background-color": "darkgrey",
      "border-radius": "10px",
      outline: "1px solid slategrey",
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  listItem: {
    "padding-top": "0px",
    "padding-bottom": "0px",
  },
  listItemInner: {
    "padding-top": "4px",
    "padding-bottom": "4px",
    [theme.breakpoints.down("md")]: {
      "padding-top": "12px",
      "padding-bottom": "12px",
    },
  },
}));

interface IListItemLinkProps {
  icon?: React.ReactElement;
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
  const classes = useStyles();

  // const renderLink = useMemo(
  //   () =>
  //     forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>((itemProps, ref) => (
  //       <Link to={to} ref={ref} {...itemProps} />
  //     )),
  //   [to]
  // );

  return (
    <li
      style={{
        width: "100%",
      }}
    >
      <ListItem
        component={Link}
        classes={{ root: classes.listItemInner }}
        to={to}
      >
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

function ListItemWithChildren(props: {
  item: IListItemLinkProps;
  theme: Theme;
}): React.ReactElement<{
  item: IListItemLinkProps;
  theme: Theme;
}> {
  const { item, theme } = props;
  const match = useRouteMatch({
    path: item.to,
    exact: item.to === "/",
  });
  const classes = useStyles();

  const [expansionState, setExpansionState] = useState(Boolean(match));

  return (
    <Fragment>
      <ListItem
        disabled={item.disabled}
        button
        key={item.to}
        classes={{
          root: classes.listItem,
        }}
        onClick={() => setExpansionState((state) => !state)}
      >
        <ListItem
          classes={{
            root: classes.listItemInner,
          }}
        >
          <ListItemIcon
            style={{
              color: match
                ? theme!.palette.secondary.main
                : theme!.palette.text.primary,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            style={{
              color: match
                ? theme!.palette.secondary.main
                : theme!.palette.text.primary,
            }}
          ></ListItemText>
          {/* {expansionState ? <ExpandLess /> : <ExpandMore />} */}
        </ListItem>
      </ListItem>
      <Collapse in={expansionState} timeout="auto" unmountOnExit>
        {item.children!.map((elem) => (
          <ListItem
            disabled={elem.disabled}
            button
            key={elem.to}
            classes={{
              root: classes.listItem,
            }}
          >
            {elem.children ? (
              <ListItemWithChildren item={elem} theme={theme} />
            ) : (
              <ListItemLink
                to={elem.to}
                text={elem.text}
                icon={elem.icon}
                disabled={elem.disabled}
                theme={theme}
              />
            )}
          </ListItem>
        ))}
      </Collapse>
    </Fragment>
  );
}

function App() {
  const { t } = useTranslation();
  const {
    lang,
    displayMode,
    contentTransMode,
    updateLang,
    updateDisplayMode,
    updateContentTransMode,
  } = useContext(SettingContext)!;
  const history = useHistory();

  const { goBack } = useHistory();

  const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const leftBtns: IListItemLinkProps[][] = React.useMemo(
    () => [
      [
        {
          text: t("common:home"),
          icon: <HomeIcon></HomeIcon>,
          to: "/",
          disabled: false,
        },
        {
          text: t("common:announcement"),
          icon: <Bullhorn></Bullhorn>,
          to: "/announcement",
          disabled: false,
        },
      ],
      [
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
          text: t("common:mission.main"),
          icon: <Assignment></Assignment>,
          to: "/mission",
          disabled: false,
          children: [
            {
              text: t("common:mission.honor"),
              to: "/mission/title",
              disabled: false,
            },
            {
              text: t("common:mission.livepass"),
              to: "/mission/livepass",
              disabled: true,
            },
            {
              text: t("common:character"),
              to: "/mission/character",
              disabled: false,
            },
            {
              text: t("common:mission.normal"),
              to: "/mission/normal",
              disabled: false,
            },
            {
              text: t("common:mission.beginner"),
              to: "/mission/beginner",
              disabled: false,
            },
          ],
        },
        {
          text: "Live2D",
          icon: <ControlCamera></ControlCamera>,
          to: "/l2d",
          disabled: false,
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
        {
          text: t("common:eventCalc"),
          icon: <Calculator />,
          to: "/event_calc",
          disabled: false,
        },
        {
          text: t("common:storyReader"),
          icon: <Textsms></Textsms>,
          to: "/storyreader",
          disabled: false,
        },
        {
          text: t("common:eventTracker"),
          icon: <Timeline></Timeline>,
          to: "/eventtracker",
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
    ],
    [t]
  );

  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarExpansionStates, setSidebarExpansionStates] = useState<
    boolean[]
  >(leftBtns.map(() => true));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [
    mobileMenuAnchorEl,
    setMobileMenuAnchorEl,
  ] = useState<HTMLElement | null>(null);

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

  const drawer = useMemo(
    () => (
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
              {t("common:community")}
            </Typography>
            {sidebarExpansionStates[0] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={sidebarExpansionStates[0]} timeout="auto" unmountOnExit>
            {leftBtns[0].map((elem) =>
              elem.children ? (
                <ListItemWithChildren key={elem.to} item={elem} theme={theme} />
              ) : (
                <ListItem
                  disabled={elem.disabled}
                  button
                  key={elem.to}
                  classes={{
                    root: classes.listItem,
                  }}
                >
                  <ListItemLink
                    to={elem.to}
                    text={elem.text}
                    icon={elem.icon}
                    disabled={elem.disabled}
                    theme={theme}
                  />
                </ListItem>
              )
            )}
          </Collapse>
          <ListItem
            button
            onClick={() =>
              setSidebarExpansionStates((s) => [s[0], !s[1], ...s.slice(2)])
            }
          >
            <Typography color="textSecondary">
              {t("common:information")}
            </Typography>
            {sidebarExpansionStates[1] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={sidebarExpansionStates[1]} timeout="auto" unmountOnExit>
            {leftBtns[1].map((elem) =>
              elem.children ? (
                <ListItemWithChildren key={elem.to} item={elem} theme={theme} />
              ) : (
                <ListItem
                  disabled={elem.disabled}
                  button
                  key={elem.to}
                  classes={{
                    root: classes.listItem,
                  }}
                >
                  <ListItemLink
                    to={elem.to}
                    text={elem.text}
                    icon={elem.icon}
                    disabled={elem.disabled}
                    theme={theme}
                  />
                </ListItem>
              )
            )}
          </Collapse>
          <ListItem
            button
            onClick={() =>
              setSidebarExpansionStates((s) => [
                s[0],
                s[1],
                !s[2],
                ...s.slice(3),
              ])
            }
          >
            <Typography color="textSecondary">{t("common:tools")}</Typography>
            {sidebarExpansionStates[2] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={sidebarExpansionStates[2]} timeout="auto" unmountOnExit>
            {leftBtns[2].map((elem) =>
              elem.children ? (
                <ListItemWithChildren key={elem.to} item={elem} theme={theme} />
              ) : (
                <ListItem
                  disabled={elem.disabled}
                  button
                  key={elem.to}
                  classes={{
                    root: classes.listItem,
                  }}
                >
                  <ListItemLink
                    to={elem.to}
                    text={elem.text}
                    icon={elem.icon}
                    disabled={elem.disabled}
                    theme={theme}
                  />
                </ListItem>
              )
            )}
          </Collapse>
          <ListItem
            button
            onClick={() =>
              setSidebarExpansionStates((s) => [
                ...s.slice(0, 3),
                !s[3],
                ...s.slice(4),
              ])
            }
          >
            <Typography color="textSecondary">{t("common:about")}</Typography>
            {sidebarExpansionStates[3] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={sidebarExpansionStates[3]} timeout="auto" unmountOnExit>
            {leftBtns[3].map((elem) =>
              elem.children ? (
                <ListItemWithChildren key={elem.to} item={elem} theme={theme} />
              ) : (
                <ListItem
                  disabled={elem.disabled}
                  button
                  key={elem.to}
                  classes={{
                    root: classes.listItem,
                  }}
                >
                  <ListItemLink
                    to={elem.to}
                    text={elem.text}
                    icon={elem.icon}
                    disabled={elem.disabled}
                    theme={theme}
                  />
                </ListItem>
              )
            )}
          </Collapse>
        </List>
      </div>
    ),
    [
      classes.listItem,
      classes.toolbar,
      leftBtns,
      sidebarExpansionStates,
      t,
      theme,
    ]
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
              Sekai Viewer <small>{process.env.REACT_APP_VERSION}</small>
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => goBack()}
              disableRipple
              style={{ padding: ".6rem" }}
              size="medium"
            >
              <ArrowBackIosIcon fontSize="inherit" />
            </IconButton>
            <Hidden smDown implementation="css">
              <IconButton
                color="inherit"
                onClick={() => setIsSettingsOpen(true)}
                style={{ padding: ".6rem" }}
                size="medium"
              >
                <SettingsIcon fontSize="inherit" />
              </IconButton>
              <Link to="/user" style={{ color: theme.palette.common.white }}>
                <IconButton
                  color="inherit"
                  style={{ padding: ".6rem" }}
                  size="medium"
                >
                  <AccountCircle fontSize="inherit" />
                </IconButton>
              </Link>
            </Hidden>
            <Hidden mdUp implementation="css">
              <IconButton
                onClick={(ev) => {
                  setMobileMenuOpen(true);
                  setMobileMenuAnchorEl(ev.currentTarget);
                }}
                color="inherit"
              >
                <MoreVert />
              </IconButton>
            </Hidden>
          </Toolbar>
        </AppBar>
        <Menu
          anchorEl={mobileMenuAnchorEl}
          keepMounted
          open={mobileMenuOpen}
          onClose={() => {
            setMobileMenuOpen(false);
            setMobileMenuAnchorEl(null);
          }}
        >
          <MenuItem
            onClick={() => {
              setIsSettingsOpen(true);
              setMobileMenuOpen(false);
              setMobileMenuAnchorEl(null);
            }}
          >
            <IconButton color="inherit" size="medium">
              <SettingsIcon fontSize="inherit" />
            </IconButton>
            <Typography>{t("common:settings.title")}</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              history.push("/user");
              setMobileMenuOpen(false);
              setMobileMenuAnchorEl(null);
            }}
          >
            <IconButton color="inherit" size="medium">
              <AccountCircle fontSize="inherit" />
            </IconButton>
            <Typography>{t("common:user")}</Typography>
          </MenuItem>
        </Menu>
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
          <div className={classes.toolbar} id="back-to-top-anchor"></div>
          <UserProvider>
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
                <Route path="/event_calc" exact>
                  <EventPointCalc />
                </Route>
                <Route path="/storyreader">
                  <StoryReader />
                </Route>
                <Route path="/mission/title">
                  <TitleMissionList />
                </Route>
                <Route path="/mission/normal">
                  <NormalMissionList />
                </Route>
                <Route path="/mission/beginner">
                  <BeginnerMissionList />
                </Route>
                <Route path="/mission/character">
                  <CharacterMissionList />
                </Route>
                <Route path="/user">
                  <User />
                </Route>
                <Route path="/connect/:provider/redirect">
                  <Connect />
                </Route>
                <Route path="/eventtracker">
                  <EventTracker />
                </Route>
                <Route path="/announcement" exact>
                  <AnnouncementList />
                </Route>
                <Route path="/announcement/:id">
                  <AnnouncementDetail />
                </Route>
                <Route path="/l2d">
                  <Live2D />
                </Route>
              </Suspense>
            </Switch>
          </UserProvider>
        </Container>
        <ScrollTop>
          <Fab color="secondary" size="small" aria-label="scroll back to top">
            <KeyboardArrowUp />
          </Fab>
        </ScrollTop>
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
                  label="ภาษาไทย"
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
