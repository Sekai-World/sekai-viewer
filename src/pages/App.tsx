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
  Box,
  ListItemButton,
} from "@mui/material";
import {
  StyledEngineProvider,
  ThemeProvider,
  Theme,
  createTheme,
  styled,
} from "@mui/material/styles";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AspectRatio as AspectRatioIcon,
  Album as AlbumIcon,
  MoveToInbox as MoveToInboxIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowBack as ArrowBackIcon,
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
  useMemo,
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
import { fontFaceOverride, fontList } from "../utils/fonts";
import { WebpMachine } from "webp-hero";
import BondsHonorList from "./honor/BondsHonorList";

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

const webpMachine = new WebpMachine();
webpMachine.polyfillDocument();

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
    exact: to === "/",
    path: to,
  });

  const Root = useMemo(
    () =>
      styled(Box)(({ theme }) => ({
        "& .list-item-link-inner": {
          paddingBottom: "2px",
          paddingTop: "2px",
          [theme.breakpoints.down("lg")]: {
            paddingBottom: "8px",
            paddingTop: "8px",
          },
        },
        width: "100%",
      })),
    []
  );

  if (
    props.visibleRoles &&
    (!user.userinfo || !props.visibleRoles.includes(user.userinfo.role))
  )
    return <Fragment />;
  return (
    <Root>
      <li>
        <ListItem
          component={Link}
          classes={{ root: "list-item-link-inner" }}
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
    </Root>
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
    exact: item.to === "/",
    path: item.to,
  });

  const [expansionState, setExpansionState] = useState(Boolean(match));

  const Root = useMemo(
    () =>
      styled(Box)(({ theme }) => ({
        "& .list-item-children": {
          padding: theme.spacing(0, 1),
        },
        "& .list-item-children-inner": {
          paddingBottom: "2px",
          paddingTop: "2px",
          [theme.breakpoints.down("lg")]: {
            paddingBottom: "8px",
            paddingTop: "8px",
          },
        },
      })),
    []
  );

  if (
    item.visibleRoles &&
    (!user.userinfo || !item.visibleRoles.includes(user.userinfo.role))
  )
    return <Fragment />;

  return (
    <Root>
      <ListItem
        disabled={item.disabled}
        button
        key={item.to}
        classes={{
          root: "list-item-children",
        }}
        onClick={() => setExpansionState((state) => !state)}
      >
        <ListItem
          classes={{
            root: "list-item-children-inner",
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
              root: "list-item-children",
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
    </Root>
  );
}

const openedMixin = (theme: Theme): CSSObject => ({
  overflowX: "hidden",
  transition: theme.transitions.create("width", {
    duration: theme.transitions.duration.enteringScreen,
    easing: theme.transitions.easing.sharp,
  }),
  width: drawerWidth,
});

const closedMixin = (theme: Theme): CSSObject => ({
  overflowX: "hidden",
  transition: theme.transitions.create("width", {
    duration: theme.transitions.duration.leavingScreen,
    easing: theme.transitions.easing.sharp,
  }),
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
  transition: theme.transitions.create(["width", "margin"], {
    duration: theme.transitions.duration.leavingScreen,
    easing: theme.transitions.easing.sharp,
  }),
  zIndex: theme.zIndex.drawer + 1,
  ...(open && {
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["width", "margin"], {
      duration: theme.transitions.duration.enteringScreen,
      easing: theme.transitions.easing.sharp,
    }),
    width: `calc(100% - ${drawerWidth}px)`,
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  boxSizing: "border-box",
  flexShrink: 0,
  whiteSpace: "nowrap",
  width: drawerWidth,
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
  const { t } = useTranslation();

  const leftBtns: IListItemLinkProps[][] = React.useMemo(
    () => [
      [
        {
          disabled: false,
          icon: <HomeIcon></HomeIcon>,
          text: t("common:home"),
          to: "/",
        },
        {
          disabled: false,
          icon: <Bullhorn></Bullhorn>,
          text: t("common:announcement"),
          to: "/announcement",
        },
        {
          disabled: false,
          icon: <Favorite></Favorite>,
          isRedirection: true,
          text: t("common:song wishlist"),
          to: "https://wishlist.sekai.best/",
        },
        {
          disabled: false,
          icon: <Translate></Translate>,
          text: t("common:translation"),
          to: "/translation",
          visibleRoles: ["translator", "admin"],
        },
      ],
      [
        {
          disabled: false,
          icon: <AspectRatioIcon></AspectRatioIcon>,
          text: t("common:card"),
          to: "/card",
        },
        {
          disabled: false,
          icon: <AlbumIcon></AlbumIcon>,
          text: t("common:music"),
          to: "/music",
        },
        {
          disabled: false,
          icon: <MoveToInboxIcon></MoveToInboxIcon>,
          text: t("common:gacha"),
          to: "/gacha",
        },
        {
          disabled: false,
          icon: <CalendarText></CalendarText>,
          text: t("common:event"),
          to: "/event",
        },
        {
          disabled: false,
          icon: <StickerEmoji />,
          text: t("common:stamp"),
          to: "/stamp",
        },
        {
          disabled: false,
          icon: <CropOriginal />,
          text: t("common:comic"),
          to: "/comic",
        },
        {
          disabled: false,
          icon: <AccountGroup></AccountGroup>,
          text: t("common:character"),
          to: "/chara",
        },
        {
          children: [
            {
              disabled: false,
              text: t("common:mission.honor"),
              to: "/mission/title",
            },
            {
              disabled: true,
              text: t("common:mission.livepass"),
              to: "/mission/livepass",
            },
            {
              disabled: false,
              text: t("common:character"),
              to: "/mission/character",
            },
            {
              disabled: false,
              text: t("common:mission.normal"),
              to: "/mission/normal",
            },
            {
              disabled: false,
              text: t("common:mission.beginner"),
              to: "/mission/beginner",
            },
          ],
          disabled: false,
          icon: <Assignment></Assignment>,
          text: t("common:mission.main"),
          to: "/mission",
        },
        {
          children: [
            {
              disabled: false,
              text: t("common:honor.bonds"),
              to: "/honor/bonds",
            },
            {
              disabled: false,
              text: t("common:honor.others"),
              to: "/honor/others",
            },
          ],
          disabled: false,
          icon: <Dns></Dns>,
          text: t("honor:page_title"),
          to: "/honor",
        },
        {
          disabled: false,
          icon: <ControlCamera></ControlCamera>,
          text: "Live2D",
          to: "/l2d",
        },
        {
          disabled: false,
          icon: <LiveTv></LiveTv>,
          text: t("common:virtualLive"),
          to: "/virtual_live",
        },
      ],
      [
        {
          disabled: false,
          icon: <FileFindOutline />,
          text: t("common:assetViewer"),
          to: "/asset_viewer",
        },
        {
          disabled: false,
          icon: <QueueMusic />,
          text: t("common:musicMeta"),
          to: "/music_meta",
        },
        {
          disabled: false,
          icon: <Calculator />,
          text: t("common:musicRecommend"),
          to: "/music_recommend",
        },
        {
          disabled: false,
          icon: <Calculator />,
          text: t("common:eventCalc"),
          to: "/event_calc",
        },
        {
          children: [
            {
              disabled: false,
              text: t("common:text"),
              to: "/storyreader",
            },
            {
              disabled: true,
              text: "Live2D",
              to: "/storyreader-live2d",
            },
          ],
          disabled: false,
          icon: <Textsms></Textsms>,
          text: t("common:storyReader"),
          to: "/storyreader",
        },
        {
          disabled: false,
          icon: <Timeline></Timeline>,
          text: t("common:eventTracker"),
          to: "/eventtracker",
        },
        {
          disabled: true,
          icon: <Timeline></Timeline>,
          text: t("common:eventAnalyzer"),
          to: "/eventanalyzer",
        },
      ],
      [
        {
          disabled: false,
          icon: <SettingsIcon />,
          text: t("common:settings.title"),
          to: "/settings",
        },
        {
          disabled: false,
          icon: <MonetizationOn />,
          text: t("common:support"),
          to: "/support",
        },
        {
          disabled: false,
          icon: <Info />,
          text: t("common:about"),
          to: "/about",
        },
      ],
    ],
    [t]
  );

  const [sidebarExpansionStates, setSidebarExpansionStates] = useState<
    boolean[]
  >(leftBtns.map(() => true));

  const Root = useMemo(
    () =>
      styled(Box)(({ theme }) => ({
        "& .drawer-content-list-item": {
          padding: theme.spacing(0, 1),
        },
        "& .drawer-content-toolbar": {
          ...theme.mixins.toolbar,
          alignItems: "center",
          display: "flex",
          padding: theme.spacing(0, 3),
          // justifyContent: 'flex-end'
        },
      })),
    []
  );

  return (
    <Root>
      <div className="drawer-content-toolbar">
        <Typography variant="h6">{t("common:toolbar.title")}</Typography>
        <Box sx={{ marginLeft: "auto" }}>
          <IconButton
            onClick={onFoldButtonClick}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <ArrowBackIosIcon />
          </IconButton>
        </Box>
      </div>
      <Divider></Divider>
      <List>
        <ListItemButton
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
        </ListItemButton>
        <Collapse
          in={sidebarExpansionStates[0]}
          // timeout="auto"
          // unmountOnExit
        >
          {leftBtns[0].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
            ) : (
              <ListItemButton
                disabled={elem.disabled}
                key={elem.to}
                classes={{
                  root: "drawer-content-list-item",
                }}
              >
                <ListItemLink {...elem} />
              </ListItemButton>
            )
          )}
        </Collapse>
        <ListItemButton
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
        </ListItemButton>
        <Collapse
          in={sidebarExpansionStates[1]}
          // timeout="auto"
          // unmountOnExit
        >
          {leftBtns[1].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
            ) : (
              <ListItemButton
                disabled={elem.disabled}
                key={elem.to}
                classes={{
                  root: "drawer-content-list-item",
                }}
              >
                <ListItemLink
                  to={elem.to}
                  text={elem.text}
                  icon={elem.icon}
                  disabled={elem.disabled}
                />
              </ListItemButton>
            )
          )}
        </Collapse>
        <ListItemButton
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
        </ListItemButton>
        <Collapse in={sidebarExpansionStates[2]} timeout="auto" unmountOnExit>
          {leftBtns[2].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
            ) : (
              <ListItemButton
                disabled={elem.disabled}
                key={elem.to}
                classes={{
                  root: "drawer-content-list-item",
                }}
              >
                <ListItemLink
                  to={elem.to}
                  text={elem.text}
                  icon={elem.icon}
                  disabled={elem.disabled}
                />
              </ListItemButton>
            )
          )}
        </Collapse>
        <ListItemButton
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
        </ListItemButton>
        <Collapse in={sidebarExpansionStates[3]} timeout="auto" unmountOnExit>
          {leftBtns[3].map((elem) =>
            elem.children ? (
              <ListItemWithChildren key={elem.to} item={elem} />
            ) : (
              <ListItemButton
                disabled={elem.disabled}
                key={elem.to}
                classes={{
                  root: "drawer-content-list-item",
                }}
              >
                <ListItemLink
                  to={elem.to}
                  text={elem.text}
                  icon={elem.icon}
                  disabled={elem.disabled}
                />
              </ListItemButton>
            )
          )}
        </Collapse>
      </List>
    </Root>
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

  const Root = useMemo(
    () =>
      styled(Box)(({ theme }) => ({
        "& .app-inner-drawer": {
          [theme.breakpoints.up("md")]: {
            flexShrink: 0,
            width: drawerWidth,
          },
        },

        "& .app-inner-drawer-content": {
          flexGrow: 1,
          padding: theme.spacing(2),
          [theme.breakpoints.up("md")]: {
            width: `calc(100% - ${drawerWidth}px)`,
          },
        },

        "& .app-inner-drawer-paper": {
          width: drawerWidth,
        },

        "& .app-inner-drawer-toolbar": {
          ...theme.mixins.toolbar,
          alignItems: "center",
          display: "flex",
          padding: theme.spacing(0, 3),
          // justifyContent: 'flex-end'
        },

        // },
        "& .app-inner-menu-button": {
          marginRight: theme.spacing(2),
        },

        "& .app-inner-title": {
          flexGrow: 1,
        },
        // "& .app-inner-root": {
        display: "flex",
        minHeight: "100vh",
      })),
    []
  );

  return (
    <SnackbarProvider>
      <Root>
        <CssBaseline />
        <DesktopAppBar
          position="fixed"
          open={desktopOpen}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDesktopOpen(true)}
              className="app-inner-menu-button"
              size="large"
              sx={{
                ...(desktopOpen && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              classes={{ root: "app-inner-title" }}
            >
              Sekai Viewer <small>{import.meta.env.PACKAGE_VERSION}</small>
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => goBack()}
              disableRipple
              style={{ padding: ".6rem" }}
              size="medium"
            >
              <ArrowBackIcon fontSize="inherit" />
            </IconButton>
            <Link to="/settings" style={{ color: theme.palette.common.white }}>
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
        <MuiAppBar
          position="fixed"
          sx={{ display: { md: "none", xs: "block" } }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              className="app-inner-menu-button"
              size="large"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              classes={{ root: "app-inner-title" }}
            >
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
        <nav className="app-inner-drawer">
          <SwipeableDrawer
            container={container}
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            onOpen={() => setMobileOpen(true)}
            classes={{
              paper: "app-inner-drawer-paper",
            }}
            ModalProps={{
              keepMounted: true,
            }}
            disableBackdropTransition={!iOS}
            disableDiscovery={iOS}
            sx={{ display: { md: "none", xs: "block" } }}
          >
            <DrawerContent open={mobileOpen} />
          </SwipeableDrawer>
          <Drawer
            variant="permanent"
            open={desktopOpen}
            classes={{
              paper: "app-inner-drawer-paper",
            }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <DrawerContent
              open={desktopOpen}
              onFoldButtonClick={() => setDesktopOpen(false)}
            />
          </Drawer>
        </nav>
        <Container className="app-inner-drawer-content">
          <div
            className="app-inner-drawer-toolbar"
            id="back-to-top-anchor"
          ></div>
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
              <Route path="/honor/others">
                <HonorList />
              </Route>
              <Route path="/honor/bonds">
                <BondsHonorList />
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
      </Root>
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
        components: {
          MuiCssBaseline: {
            styleOverrides: fontFaceOverride,
          },
        },
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
        typography: {
          fontFamily: fontList,
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
