import "./App.css";
import {
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
  Collapse,
  Container,
  CssBaseline,
  Divider,
  Drawer as MuiDrawer,
  Fab,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  Grid,
  Skeleton,
  SwipeableDrawer,
  CSSObject,
  styled,
  Box,
} from "@mui/material";
import {
  StyledEngineProvider,
  ThemeProvider,
  Theme,
  createTheme,
} from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AspectRatio as AspectRatioIcon,
  Album as AlbumIcon,
  MoveToInbox as MoveToInboxIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Settings as SettingsIcon,
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
  LiveTv,
  Translate,
  Dns,
  Favorite,
} from "@mui/icons-material";
import AccountGroup from "~icons/mdi/account-group";
import Bullhorn from "~icons/mdi/bullhorn";
import Calculator from "~icons/mdi/calculator";
import CalendarText from "~icons/mdi/calendar-text";
import StickerEmoji from "~icons/mdi/sticker-emoji";
import FileFindOutline from "~icons/mdi/file-find-outline";
import React, {
  // forwardRef,
  // useMemo,
  lazy,
  Suspense,
  Fragment,
  useState,
  useEffect,
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
import ScrollTop from "../components/widgets/ScrollTop";
// import Settings from "../components/Settings";
import { SnackbarProvider } from "notistack";
import ReloadPrompt from "../components/helpers/ReloadPrompt";
import { apiUserInfoToStoreUserInfo, useLocalStorage } from "../utils";
import { useRemoteLanguages, useStrapi } from "../utils/apiClient";
import { useRootStore } from "../stores/root";
// import AlertSnackbar from "../components/AlertSnackbar";
import { observer } from "mobx-react-lite";
import { IUserMetadata } from "../stores/user";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}
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
const Settings = lazy(() => import("./Settings"));
const MusicRecommend = lazy(() => import("./MusicRecommend"));
const EventPointCalc = lazy(() => import("./EventPointCalc"));
const StoryReader = lazy(() => import("./storyreader/StoryReader"));
const StoryReaderLive2d = lazy(() => import("./storyreader/StoryReaderLive2d"));
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
const VirtualLiveList = lazy(() => import("./virtual_live/VirtualLiveList"));
const VirtualLiveDetail = lazy(
  () => import("./virtual_live/VirtualLiveDetail")
);
const TranslationPage = lazy(() => import("./translation/TranslationPage"));
const TranslationEditor = lazy(() => import("./translation/TranslationEditor"));
const HonorList = lazy(() => import("./honor/HonorList"));
const EventAnalyzer = lazy(() => import("./event/EventAnalyzer"));
const MusicMeta = lazy(() => import("./music/MusicMeta"));
const AssetViewer = lazy(() => import("./AssetViewer"));

const drawerWidth = 240;

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
    minHeight: "100vh",
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
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  listItem: {
    padding: theme.spacing(0, 1),
  },
  listItemInner: {
    paddingTop: "2px",
    paddingBottom: "2px",
    [theme.breakpoints.down("lg")]: {
      paddingTop: "8px",
      paddingBottom: "8px",
    },
  },
}));

interface IListItemLinkProps {
  icon?: React.ReactElement;
  text: string;
  to: string;
  disabled: boolean;
  visibleRoles?: string[];
  children?: IListItemLinkProps[];
  isRedirection?: boolean; // to be used for redirecting to another page
}

function ListItemLink(
  props: IListItemLinkProps
): React.ReactElement<IListItemLinkProps> {
  const { icon, text, to, isRedirection } = props;
  const { user } = useRootStore();
  const match = useRouteMatch({
    path: to,
    exact: to === "/",
  });
  const classes = useStyles();

  if (
    props.visibleRoles &&
    (!user.userinfo || !props.visibleRoles.includes(user.userinfo.role))
  )
    return <Fragment></Fragment>;
  return (
    <li
      style={{
        width: "100%",
      }}
    >
      <ListItem
        component={Link}
        classes={{ root: classes.listItemInner }}
        to={{
          pathname: to,
        }}
        /**
         * if true redirect to another page, otherwise used the spa routing
         */
        target={isRedirection ? "_blank" : undefined}
      >
        <ListItemIcon
          sx={{
            color: match ? "secondary.main" : "text.primary",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          sx={{
            color: match ? "secondary.main" : "text.primary",
          }}
        ></ListItemText>
      </ListItem>
    </li>
  );
}

function ListItemWithChildren(props: {
  item: IListItemLinkProps;
  // theme: Theme;
}): React.ReactElement<{
  item: IListItemLinkProps;
  // theme: Theme;
}> {
  const { item } = props;
  const { user } = useRootStore();

  const match = useRouteMatch({
    path: item.to,
    exact: item.to === "/",
  });
  const classes = useStyles();

  const [expansionState, setExpansionState] = useState(Boolean(match));

  if (
    item.visibleRoles &&
    (!user.userinfo || !item.visibleRoles.includes(user.userinfo.role))
  )
    return <Fragment></Fragment>;

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
            sx={{
              color: match ? "secondary.main" : "text.primary",
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            sx={{
              color: match ? "secondary.main" : "text.primary",
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
              <ListItemWithChildren item={elem} />
            ) : (
              <ListItemLink
                to={elem.to}
                text={elem.text}
                icon={elem.icon}
                disabled={elem.disabled}
              />
            )}
          </ListItem>
        ))}
      </Collapse>
    </Fragment>
  );
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const DesktopAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerContent: React.FC<{
  open: boolean;
  onFoldButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ open, onFoldButtonClick }) => {
  const classes = useStyles();
  const { t } = useTranslation();

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
        {
          text: t("common:song wishlist"),
          icon: <Favorite></Favorite>,
          to: "https://wishlist.sekai.best/",
          disabled: false,
          isRedirection: true,
        },
        {
          text: t("common:translation"),
          icon: <Translate></Translate>,
          to: "/translation",
          disabled: false,
          visibleRoles: ["translator", "admin"],
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
          text: t("honor:page_title"),
          icon: <Dns></Dns>,
          to: "/honor",
          disabled: false,
        },
        {
          text: "Live2D",
          icon: <ControlCamera></ControlCamera>,
          to: "/l2d",
          disabled: false,
        },
        {
          text: t("common:virtualLive"),
          icon: <LiveTv></LiveTv>,
          to: "/virtual_live",
          disabled: false,
        },
      ],
      [
        {
          text: t("common:assetViewer"),
          icon: <FileFindOutline />,
          to: "/asset_viewer",
          disabled: false,
        },
        {
          text: t("common:musicMeta"),
          icon: <QueueMusic />,
          to: "/music_meta",
          disabled: false,
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
          children: [
            {
              text: t("common:text"),
              to: "/storyreader",
              disabled: false,
            },
            {
              text: "Live2D",
              to: "/storyreaderlive2d",
              disabled: false,
            },
          ],
        },
        {
          text: t("common:eventTracker"),
          icon: <Timeline></Timeline>,
          to: "/eventtracker",
          disabled: false,
        },
        {
          text: t("common:eventAnalyzer"),
          icon: <Timeline></Timeline>,
          to: "/eventanalyzer",
          disabled: true,
        },
      ],
      [
        {
          text: t("common:settings.title"),
          icon: <SettingsIcon />,
          to: "/settings",
          disabled: false,
        },
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

  const [sidebarExpansionStates, setSidebarExpansionStates] = useState<
    boolean[]
  >(leftBtns.map(() => true));

  return (
    <div>
      <div className={classes.toolbar}>
        <Typography variant="h6">{t("common:toolbar.title")}</Typography>
        <Box sx={{ marginLeft: "auto" }}>
          <Hidden mdDown implementation="css">
            <IconButton onClick={onFoldButtonClick}>
              <ArrowBackIosIcon />
            </IconButton>
          </Hidden>
        </Box>
      </div>
      <Divider></Divider>
      <List>
        <ListItem
          button
          onClick={() =>
            setSidebarExpansionStates((s) => [!s[0], ...s.slice(1)])
          }
        >
          <Typography
            color="textSecondary"
            sx={{ ...(!open && { display: "none" }) }}
          >
            {t("common:community")}
          </Typography>
          {sidebarExpansionStates[0] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse
          in={sidebarExpansionStates[0]}
          // timeout="auto"
          // unmountOnExit
        >
          {leftBtns[0].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
            ) : (
              <ListItem
                disabled={elem.disabled}
                button
                key={elem.to}
                classes={{
                  root: classes.listItem,
                }}
              >
                <ListItemLink {...elem} />
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
          <Typography
            color="textSecondary"
            sx={{ ...(!open && { display: "none" }) }}
          >
            {t("common:information")}
          </Typography>
          {sidebarExpansionStates[1] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse
          in={sidebarExpansionStates[1]}
          // timeout="auto"
          // unmountOnExit
        >
          {leftBtns[1].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
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
                />
              </ListItem>
            )
          )}
        </Collapse>
        <ListItem
          button
          onClick={() =>
            setSidebarExpansionStates((s) => [s[0], s[1], !s[2], ...s.slice(3)])
          }
        >
          <Typography
            color="textSecondary"
            sx={{ ...(!open && { display: "none" }) }}
          >
            {t("common:tools")}
          </Typography>
          {sidebarExpansionStates[2] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={sidebarExpansionStates[2]} timeout="auto" unmountOnExit>
          {leftBtns[2].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
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
          <Typography
            color="textSecondary"
            sx={{ ...(!open && { display: "none" }) }}
          >
            {t("common:about")}
          </Typography>
          {sidebarExpansionStates[3] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={sidebarExpansionStates[3]} timeout="auto" unmountOnExit>
          {leftBtns[3].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
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
                />
              </ListItem>
            )
          )}
        </Collapse>
      </List>
    </div>
  );
};

const AppInner = observer((props: { theme: Theme }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { goBack } = useHistory();
  const {
    user: { userinfo, setUserInfo, setMetadata },
    jwtToken,
    sekai: {
      sekaiProfileMap,
      sekaiCardTeamMap,
      fetchSekaiProfile,
      fetchSekaiCardTeam,
    },
    settings: { region },
  } = useRootStore();
  const { getUserMe, getUserMetadataMe, getRefreshToken } = useStrapi(
    jwtToken,
    region
  );

  const classes = useStyles();
  const { theme } = props;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useLocalStorage<boolean>(
    "desktop-drawer-open",
    true
  );
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] =
    useState<HTMLElement | null>(null);

  const container =
    window !== undefined ? () => window.document.body : undefined;
  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    if (jwtToken) {
      const lastCheck = Number(localStorage.getItem("lastUserCheck") || "0");

      if (
        import.meta.env.DEV ||
        !userinfo || // has token but no userinfo, should fetch
        new Date().getTime() - lastCheck > 3600 * 24 * 1000
      ) {
        const func = async () => {
          const userInfo = await getUserMe();
          const userMetaDatum = await getUserMetadataMe();
          const refreshToken = await getRefreshToken();

          setUserInfo(apiUserInfoToStoreUserInfo(userInfo));
          setMetadata(userMetaDatum as IUserMetadata);
          localStorage.setItem("refreshToken", refreshToken.refresh);

          localStorage.setItem(
            "lastUserCheck",
            new Date().getTime().toString()
          );
        };

        func();
      }

      if (!sekaiProfileMap.has(region)) {
        fetchSekaiProfile(region);
      }
      if (!sekaiCardTeamMap.has(region)) {
        fetchSekaiCardTeam(region);
      }
    }
  }, [
    fetchSekaiCardTeam,
    fetchSekaiProfile,
    getRefreshToken,
    getUserMe,
    getUserMetadataMe,
    jwtToken,
    region,
    sekaiCardTeamMap,
    sekaiProfileMap,
    setMetadata,
    setUserInfo,
    userinfo,
  ]);

  return (
    <SnackbarProvider>
      <div className={classes.root}>
        <CssBaseline />
        <Hidden mdDown implementation="css">
          <DesktopAppBar position="fixed" open={desktopOpen}>
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDesktopOpen(true)}
                className={classes.menuButton}
                size="large"
                sx={{
                  ...(desktopOpen && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap classes={{ root: classes.title }}>
                Sekai Viewer <small>{import.meta.env.PACKAGE_VERSION}</small>
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
              <Link
                to="/settings"
                style={{ color: theme.palette.common.white }}
              >
                <IconButton
                  color="inherit"
                  style={{ padding: ".6rem" }}
                  size="medium"
                >
                  <SettingsIcon fontSize="inherit" />
                </IconButton>
              </Link>
              <Link to="/user" style={{ color: theme.palette.common.white }}>
                <IconButton
                  color="inherit"
                  style={{ padding: ".6rem" }}
                  size="medium"
                >
                  <AccountCircle fontSize="inherit" />
                </IconButton>
              </Link>
            </Toolbar>
          </DesktopAppBar>
        </Hidden>
        <Hidden mdUp implementation="css">
          <MuiAppBar position="fixed">
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(true)}
                className={classes.menuButton}
                size="large"
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap classes={{ root: classes.title }}>
                Sekai Viewer <small>{import.meta.env.PACKAGE_VERSION}</small>
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
              <IconButton
                onClick={(ev) => {
                  setMobileMenuOpen(true);
                  setMobileMenuAnchorEl(ev.currentTarget);
                }}
                color="inherit"
                size="large"
              >
                <MoreVert />
              </IconButton>
            </Toolbar>
          </MuiAppBar>
        </Hidden>
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
              // setIsSettingsOpen(true);
              history.push("/settings");
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
            <SwipeableDrawer
              container={container}
              variant="temporary"
              anchor="left"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              onOpen={() => setMobileOpen(true)}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true,
              }}
              disableBackdropTransition={!iOS}
              disableDiscovery={iOS}
            >
              <DrawerContent open={mobileOpen} />
            </SwipeableDrawer>
          </Hidden>
          <Hidden mdDown implementation="css">
            <Drawer
              variant="permanent"
              open={desktopOpen}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <DrawerContent
                open={desktopOpen}
                onFoldButtonClick={() => setDesktopOpen(false)}
              />
            </Drawer>
          </Hidden>
        </nav>
        <Container className={classes.content}>
          <div className={classes.toolbar} id="back-to-top-anchor"></div>
          <Switch>
            <Suspense
              fallback={
                <Grid container direction="column" spacing={3}>
                  <Grid item>
                    <Skeleton variant="rectangular" width="30%" height={30} />
                  </Grid>
                  <Grid item>
                    <Skeleton variant="rectangular" width="90%" height={200} />
                  </Grid>
                  <Grid item>
                    <Skeleton variant="rectangular" width="90%" height={200} />
                  </Grid>
                </Grid>
              }
            >
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
              <Route path="/storyreaderlive2d">
                <StoryReaderLive2d />
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
              <Route path="/virtual_live" exact>
                <VirtualLiveList />
              </Route>
              <Route path="/virtual_live/:id">
                <VirtualLiveDetail />
              </Route>
              <Route path="/translation" exact>
                <TranslationPage />
              </Route>
              <Route path="/translation/:slug">
                <TranslationEditor />
              </Route>
              <Route path="/honor">
                <HonorList />
              </Route>
              <Route path="/eventanalyzer">
                <EventAnalyzer />
              </Route>
              <Route path="/music_meta">
                <MusicMeta />
              </Route>
              <Route path="/settings">
                <Settings />
              </Route>
              <Route path="/asset_viewer">
                <AssetViewer />
              </Route>
            </Suspense>
          </Switch>
        </Container>
        <ScrollTop>
          <Fab color="secondary" size="small" aria-label="scroll back to top">
            <KeyboardArrowUp />
          </Fab>
        </ScrollTop>
        {/* <Settings
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      /> */}
      </div>
      <ReloadPrompt />
    </SnackbarProvider>
  );
});

const App = observer(() => {
  const {
    settings: { displayMode, setLanguages, lang, setLang },
  } = useRootStore();
  const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const {
    languages: remoteLanguages,
    isLoading: isLanguageLoading,
    error: languageError,
  } = useRemoteLanguages();
  const { i18n } = useTranslation();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode:
            displayMode === "auto"
              ? preferDarkMode
                ? "dark"
                : "light"
              : displayMode,
          primary: {
            main: "#298a7b",
          },
          secondary: {
            main: "#f50057",
          },
          success: {
            main: "#1a8e1f",
          },
        },
      }),
    [displayMode, preferDarkMode]
  );

  useEffect(() => {
    if (!lang) {
      setLang(i18n.language);
    }
  }, [i18n.language, lang, setLang]);

  useEffect(() => {
    if (!isLanguageLoading && !languageError) {
      setLanguages(remoteLanguages);
      if (!remoteLanguages.find((rl) => rl.code === lang)) {
        // try setting correct language code
        if (remoteLanguages.find((rl) => rl.code === lang.split("-")[0])) {
          setLang(lang.split("-")[0]);
        }
      }
    }
  }, [
    isLanguageLoading,
    lang,
    languageError,
    remoteLanguages,
    setLang,
    setLanguages,
  ]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <AppInner theme={theme} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
});

export default App;
