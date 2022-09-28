import {
  useMediaQuery,
  CssBaseline,
  AppBar,
  Hidden,
  IconButton,
  Toolbar,
  Typography,
  Divider,
  List,
  Drawer,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import {
  createTheme,
  styled,
  StyledEngineProvider,
  Theme,
  ThemeProvider,
} from "@mui/material/styles";
import {
  AccountCircle,
  ArrowBackIos,
  MoreVert,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Skeleton } from "@mui/material";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const AppSkeletonInner = (props: { theme: Theme }) => {
  const { theme } = props;
  const DrawerContentRoot = useMemo(
    () =>
      styled(Box)(({ theme }) => ({
        "& .drawer-content-toolbar": {
          ...theme.mixins.toolbar,
          display: "flex",
          alignItems: "center",
          padding: theme.spacing(0, 3),
          // justifyContent: 'flex-end'
        },
      })),
    []
  );
  const DrawerContent = () => (
    <DrawerContentRoot>
      <div className="drawer-content-toolbar">
        <Skeleton variant="text" width="100%" />
      </div>
      <Divider></Divider>
      <List>
        {Array.from({ length: 20 }).map((_, id) => (
          <ListItem key={id}>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText>
              <Skeleton variant="rectangular" width="100%" height={24} />
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </DrawerContentRoot>
  );
  const container =
    window !== undefined ? () => window.document.body : undefined;

  const Root = useMemo(
    () =>
      styled(Box)(({ theme }) => ({
        "& .app-skeleton-inner-root": {
          display: "flex",
        },
        "& .app-skeleton-inner-appbar": {
          [theme.breakpoints.up("md")]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
          },
        },
        "& .app-skeleton-inner-menu-button": {
          marginRight: theme.spacing(2),
          [theme.breakpoints.up("md")]: {
            display: "none",
          },
        },
        "& .app-skeleton-inner-title": {
          flexGrow: 1,
        },
        "& .app-skeleton-inner-drawer": {
          [theme.breakpoints.up("md")]: {
            width: drawerWidth,
            flexShrink: 0,
          },
        },
        "& .app-skeleton-inner-drawer-paper": {
          width: drawerWidth,
        },
      })),
    []
  );

  return (
    <Root>
      <div className="app-skeleton-inner-root">
        <CssBaseline />
        <AppBar position="fixed" className="app-skeleton-inner-appbar">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              className="app-skeleton-inner-menu-button"
              size="large"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              classes={{ root: "app-skeleton-inner-title" }}
            >
              Sekai Viewer <small>{import.meta.env.PACKAGE_VERSION}</small>
            </Typography>
            <IconButton
              color="inherit"
              disableRipple
              style={{ padding: ".6rem" }}
              size="medium"
            >
              <ArrowBackIos fontSize="inherit" />
            </IconButton>
            <Hidden mdDown implementation="css">
              <IconButton
                color="inherit"
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
              <IconButton color="inherit" size="large">
                <MoreVert />
              </IconButton>
            </Hidden>
          </Toolbar>
        </AppBar>
        <nav className="app-skeleton-inner-drawer">
          <Hidden mdUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={false}
              classes={{
                paper: "app-skeleton-inner-drawer-paper",
              }}
              ModalProps={{
                keepMounted: true,
              }}
            >
              <DrawerContent />
            </Drawer>
          </Hidden>
          <Hidden mdDown implementation="css">
            <Drawer
              variant="permanent"
              open
              classes={{
                paper: "app-skeleton-inner-drawer-paper",
              }}
            >
              <DrawerContent />
            </Drawer>
          </Hidden>
        </nav>
      </div>
    </Root>
  );
};

const AppSkeleton = () => {
  const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: preferDarkMode ? "dark" : "light",
          // primary: {
          //   main: preferDarkMode ? "#7986cb" : "#3f51b5",
          // },
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
    [preferDarkMode]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <AppSkeletonInner theme={theme} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default AppSkeleton;
