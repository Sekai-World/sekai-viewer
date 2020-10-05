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
} from "@material-ui/icons";
import React, { forwardRef, useMemo, lazy, Suspense } from "react";
import {
  Link,
  LinkProps,
  Route,
  Switch,
  useRouteMatch,
} from "react-router-dom";

const drawerWidth = 240;
const CardList = lazy(() => import("./CardList"));
const HomeView = lazy(() => import("./Home"));
const MusicList = lazy(() => import("./MusicList"));
const GachaList = lazy(() => import("./GachaList"));
const GachaDetail = lazy(() => import("./GachaDetail"));

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
    },
    {
      text: "Card",
      icon: <AspectRatioIcon></AspectRatioIcon>,
      to: "/card",
    },
    {
      text: "Music",
      icon: <AlbumIcon></AlbumIcon>,
      to: "/music",
    },
    {
      text: "Gacha",
      icon: <MoveToInboxIcon></MoveToInboxIcon>,
      to: "/gacha",
    },
  ];
  const theme = useTheme();
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
            <ListItem button key={elem.text}>
              <ListItemLink
                to={elem.to}
                text={elem.text}
                icon={elem.icon}
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
          <Typography variant="h6" noWrap>
            Sekai Viewer
          </Typography>
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
              <HomeView></HomeView>
            </Route>
            <Route path="/card">
              <CardList></CardList>
            </Route>
            <Route path="/music">
              <MusicList></MusicList>
            </Route>
            <Route path="/gacha" exact>
              <GachaList></GachaList>
            </Route>
            <Route path="/gacha/:gachaId">
              <GachaDetail></GachaDetail>
            </Route>
          </Suspense>
        </Switch>
      </Container>
    </div>
  );
}

export default App;
