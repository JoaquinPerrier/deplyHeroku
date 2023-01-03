const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const routes = require("./routes");

// Yargs para ingresar al puerto
const yargs = require("yargs")(process.argv.slice(2));
const args = yargs.default({ puerto: 8080 }).argv;

// Dotenv para obtener claves y secrets como variables de entorno
require("dotenv").config();

const Contenedor = require("./Contenedor");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Usuarios = require("./models/usuarios");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const redis = require("redis");
const client = redis.createClient({
  legacyMode: true,
});
client.connect();
const RedisStore = require("connect-redis")(session);

function isValidPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

mongoose
  .connect(process.env.PUERTO_MONGOOSE)
  .then(() => console.log("Connected to DB"))
  .catch((e) => {
    console.error(e);
    throw "can not connect to the db";
  });

passport.use(
  "login",
  new LocalStrategy((username, password, done) => {
    Usuarios.findOne({ username }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        console.log("User Not Found with username " + username);
        return done(null, false);
      }

      if (!isValidPassword(user, password)) {
        console.log("Invalid Password");
        return done(null, false);
      }

      return done(null, user);
    });
  })
);

passport.use(
  "signup",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      Usuarios.findOne({ username: username }, function (err, user) {
        if (err) {
          console.log("Error in SignUp: " + err);
          return done(err);
        }

        if (user) {
          console.log("User already exists");
          return done(null, false);
        }

        const newUser = {
          username: username,
          password: createHash(password),
        };
        Usuarios.create(newUser, (err, userWithId) => {
          if (err) {
            console.log("Error in Saving user: " + err);
            return done(err);
          }
          console.log(user);
          console.log("User Registration succesful");
          return done(null, userWithId);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  Usuarios.findById(id, done);
});

app.use(
  session({
    store: new RedisStore({ host: "localhost", port: 6379, client, ttl: 300 }),
    secret: process.env.SECRET,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 86400000, // 1 dia
    },
    rolling: true,
    resave: true,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// SOCKET.IO
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: { origin: "*" },
});

// CLASE CONTENEDOR
let contenedor = new Contenedor("productos.txt");
let arrayCompleto;
let obtenerProductos = async () => {
  // DEVUELVE TODO EL CONTENIDO DEL ARCHIVO:
  arrayCompleto = await contenedor.getAll();
};
obtenerProductos();

app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// CHAT SOCKET IO
let chat = [
  {
    email: "admin@admin.com",
    message: "welcome",
    date: new Date().toLocaleDateString(),
  },
];

io.on("connection", (socket) => {
  // TO VERIFY NEW CONNECTION (FROM THE FRONT)
  // console.log("new connection");

  // ENVIAMOS A EL USUARIO LA LISTA DE PRODUCTOS QUE TENEMOS
  io.sockets.emit("products", arrayCompleto);

  // ENVIAMOS EL CHAT PARA AGREGARLO A LA VISTA
  io.sockets.emit("chat", chat);

  // AL RECIBIR UN MENSAJE, SE LE AGREGA AL CHAT YA GUARDADO EN EL SV
  socket.on("newMessage", (msg) => {
    chat.push(msg);
    // LE PASAMOS EL CHAT, CON EL MSJ NUEVO
    io.sockets.emit("chat", chat);
  });

  // AL RECIBIR UN NUEVO PRODUCTO, LO ENVIAMOS DE NUEVO AL FRONT
  socket.on("addProduct", (data) => {
    data.id = arrayCompleto[arrayCompleto.length - 1].id + 1;
    arrayCompleto.push(data);
    // LE PASAMOS AL FRONT EL NUEVO LISTADO DE PRODUCTOS
    io.sockets.emit("products", arrayCompleto);
  });
});

app.set("view engine", "hbs");
app.set("views", "./views");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

// Routes
app.get("/", routes.getRoot);
app.get("/login", routes.getLogin);
app.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/faillogin" }),
  routes.postLogin
);
app.get("/faillogin", routes.getFaillogin);
app.get("/signup", routes.getSignup);
app.post(
  "/signup",
  passport.authenticate("signup", { failureRedirect: "/failsignup" }),
  routes.postSignup
);
app.get("/failsignup", routes.getFailsignup);
app.get("/logout", routes.mostrarDataServer);

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.post(
  "/productos",
  async (req, res, next) => {
    await obtenerProductos();
    next();
  },
  (req, res) => routes.ingresarProd(req, res, arrayCompleto)
);

app.get(
  "/productos",
  checkAuthentication,
  async (req, res, next) => {
    await obtenerProductos();
    next();
  },
  routes.mostrarProductos
);

app.get("/info", routes.mostrarDataServer);

//CONEXION AL SERVIDOR
httpServer.listen(args.puerto, () => {
  console.log(`Servidor http iniciado en el puerto ${args.puerto}`);
});
