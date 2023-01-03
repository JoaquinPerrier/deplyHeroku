const Contenedor = require("./Contenedor");
let contenedor = new Contenedor("productos.txt");

let ingresarNuevoObj = async (newObj) => {
  console.log("hola");
  await contenedor.save(newObj);
};

function getRoot(req, res) {
  res.render("index", {});
}

function getLogin(req, res) {
  if (req.isAuthenticated()) {
    const { username, password } = req.user;
    const user = { username, password };
    res.render("listadoProductos", { root: __dirname + "/public" });
  } else {
    res.render("login");
  }
}

function getSignup(req, res) {
  if (req.isAuthenticated()) {
    const { username, password } = req.user;
    const user = { username, password };
    res.render("listadoProductos", { root: __dirname + "/public" });
  } else {
    res.render("signup");
  }
}

function postLogin(req, res) {
  const { username, password } = req.user;
  const user = { username, password };
  res.render("listadoProductos", { root: __dirname + "/public" });
}

function postSignup(req, res) {
  const { username, password } = req.user;
  const user = { username, password };
  res.render("listadoProductos", { root: __dirname + "/public" });
}

function getFaillogin(req, res) {
  res.render("login-error", {});
}

function getFailsignup(req, res) {
  res.render("signup-error", {});
}

function getLogout(req, res) {
  req.logout();
  res.render("index");
}

function failRoute(req, res) {
  res.status(404).render("routing-error", {});
}

function formulario(req, res) {
  res.render("formulario");
}

function ingresarProd(req, res, arrayCompleto) {
  const { body } = req;
  // ASIGNARLE UN ID AL OBJETO
  body.id = arrayCompleto.length + 1;

  console.log(body);
  ingresarNuevoObj(body);
  res.redirect("/productos");
  console.log(arrayCompleto.length);
}

function mostrarProductos(req, res, arrayCompleto) {
  if (arrayCompleto.length !== 0) {
    res.render("listadoProductos", { root: __dirname + "/public" });
  } else {
    res.render("sinProductos");
  }
}

function mostrarDataServer(req, res) {
  const info = {
    argsEntrada: process.argv.slice(2),
    sistemaOperativo: process.platform,
    versionNode: process.version,
    memoriaReservada: process.memoryUsage(),
    processID: process.pid,
    carpetaDelProyecto: process.cwd(),
    // INFO DESAFIO DE BALANCE DE CARGA
    cantidadProcesadores: require("os").cpus().length,
  };
  res.send(info);
}

module.exports = {
  mostrarDataServer,
  formulario,
  ingresarProd,
  mostrarProductos,
  getRoot,
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  getFaillogin,
  getFailsignup,
  getLogout,
  failRoute,
};
