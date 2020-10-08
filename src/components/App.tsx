import {
  AppBar,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Toolbar,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AspectRatio as AspectRatioIcon,
  Album as AlbumIcon,
  MoveToInbox as MoveToInboxIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Settings as SettingsIcon,
} from "@material-ui/icons";
import { Account, AccountGroup, CalendarText } from "mdi-material-ui";
import React, { forwardRef, useMemo, lazy, Suspense } from "react";
import {
  Link,
  LinkProps,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";

const drawerWidth = 240;
const CardList = lazy(() => import("./CardList"));
const HomeView = lazy(() => import("./Home"));
const MusicList = lazy(() => import("./MusicList"));
const GachaList = lazy(() => import("./GachaList"));
const GachaDetail = lazy(() => import("./GachaDetail"));
const CardDetail = lazy(() => import("./CardDetail"));
const MusicDetail = lazy(() => import("./MusicDetail"));

const useStyles = makeStyles((theme) => ({
  toolbar: {
    ...theme.mixins.toolbar,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // justifyContent: 'flex-end'
  },
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
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
  },
}));

interface IListItemLinkProps {
  icon: React.ReactElement;
  text: string;
  to: string;
  disabled: boolean;
}

function ListItemLink(
  props: IListItemLinkProps
): React.ReactElement<IListItemLinkProps> {
  const { icon, text, to } = props;
  const match = useRouteMatch({
    path: to,
    exact: to === "/",
  });
  const theme = useTheme();

  const renderLink = useMemo(
    () =>
      forwardRef<HTMLAnchorElement, LinkProps>((itemProps, ref) => (
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
              ? theme.palette.secondary.main
              : theme.palette.text.primary,
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          style={{
            color: match
              ? theme.palette.secondary.main
              : theme.palette.text.primary,
          }}
        ></ListItemText>
      </ListItem>
    </li>
  );
}

function App() {
  const leftBtns: IListItemLinkProps[] = [
    {
      text: "Home",
      icon: <HomeIcon></HomeIcon>,
      to: "/",
      disabled: false,
    },
    {
      text: "Card",
      icon: <AspectRatioIcon></AspectRatioIcon>,
      to: "/card",
      disabled: false,
    },
    {
      text: "Music",
      icon: <AlbumIcon></AlbumIcon>,
      to: "/music",
      disabled: false,
    },
    {
      text: "Gacha",
      icon: <MoveToInboxIcon></MoveToInboxIcon>,
      to: "/gacha",
      disabled: false,
    },
    {
      text: "Event",
      icon: <CalendarText></CalendarText>,
      to: "/unit",
      disabled: true,
    },
    {
      text: "Unit",
      icon: <AccountGroup></AccountGroup>,
      to: "/unit",
      disabled: true,
    },
    {
      text: "Member",
      icon: <Account></Account>,
      to: "/unit",
      disabled: true,
    },
  ];
  const theme = useTheme();
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const { goBack } = useHistory();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <Typography variant="h6">Function List</Typography>
      </div>
      <Divider></Divider>
      <List>
        {leftBtns.map((elem) => {
          return (
            <ListItem disabled={elem.disabled} button key={elem.text}>
              <ListItemLink
                to={elem.to}
                text={elem.text}
                icon={elem.icon}
                disabled={elem.disabled}
              ></ListItemLink>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
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
            Sekai Viewer <Typography component="span" variant="body2">Open Beta</Typography>
          </Typography>
          <IconButton color="inherit" onClick={() => goBack()} disableRipple>
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton color="inherit" disabled>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden smUp implementation="css">
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
        <Hidden xsDown implementation="css">
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
      <Container className={classes.content} maxWidth="md">
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
          </Suspense>
        </Switch>
      </Container>
    </div>
  );
}

export default App;
