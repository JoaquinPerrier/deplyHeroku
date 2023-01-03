console.log("CONECTADO");

const socket = io();

// TIENE QUE COINCIDIR EL PRIMER PARAMETRO CON EL PRIMERO DEL BACK
socket.on("connection", () => {
  console.log("YOU ARE CONNECTED");
});

let prod = [];
socket.on("products", (data) => {
  prod = data;

  let htmlToRender = "";
  prod.forEach((el) => {
    htmlToRender =
      htmlToRender +
      `<th scope="row">${el.id}</th>
                <td> ${el.title}</td>
                <td>${el.price}</td>
                <td><img src="${el.thumbnail}" class="product-img"/></td>
        </tr>`;
  });
  // console.log(htmlToRender);
  if (document.querySelector("#products") != null) {
    document.querySelector("#products").innerHTML = htmlToRender;
  }
});

socket.on("chat", (data) => {
  let htmlReduce = data.reduce(
    (previewHtml, CurrentHtml) =>
      previewHtml +
      `
  <tr>
    <td> <h1> ${CurrentHtml.email}</h1> </td>
    <td> <h1> ${CurrentHtml.message}</h1> </td>
    <td> <h1> ${CurrentHtml.date}</h1> </td>
  </tr>`,
    ``
  );
  document.querySelector("#message").innerHTML = htmlReduce;
});

function addMessage(addMessage) {
  let messageToAdd = {
    email: addMessage.email.value,
    message: addMessage.message.value,
    date: new Date().toLocaleDateString(),
  };
  socket.emit("newMessage", messageToAdd);
}

function addProduct(addProduct) {
  let productToAdd = {
    title: addProduct.title.value,
    price: addProduct.price.value,
    thumbnail: addProduct.thumbnail.value,
  };
  socket.emit("addProduct", productToAdd);
}
