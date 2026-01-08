let html = String.raw;

let authResult = document.querySelector('#auth-result');
let todosUl = document.querySelector('#todos');

// let sessionId = localStorage.getItem('sessionId');
// let token = localStorage.getItem('token');

// if (sessionId && token) {
//   authResult.textContent = 'Already logged in';
// }

// if (document.cookie) {
//   authResult.textContent = 'Already logged in';
// }

api('get', '/auth/whoami').then(data => {
  if (data.success) {
    authResult.textContent = data.message;
  }
});

document.querySelector('#login-form').addEventListener('submit', handleLogin);
document.querySelector('#todo-form').addEventListener('submit', handleCreateTodo);
document.querySelector('#fetch-all').addEventListener('click', fetchAllTodos);

async function api(method, path, params) {
  let options = {
    method,
  };

  let base = 'http://127.0.0.1:5000';
  let url; // "<base><path-with-slash-at-start>?<query-str>"

  if (method == 'get') {
    let query = new URLSearchParams({
      ...params,
      // sessionId,
      // token,
    });

    url = `${base}${path}?${query}`;
  }

  if (method == 'post') {
    options = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    };

    url = `${base}${path}`;
  }

  let response = await fetch(url, options);
  let data = await response.json();

  if (data.success) {
    console.log(data);
  } else {
    console.error(data);
  }

  return data;
}

function renderTodos(todos) {
  todosUl.innerHTML = '';

  todos.forEach(todo => {
    todosUl.insertAdjacentHTML(
      'beforeend',
      html`
        <li class="${todo.isDone ? 'done' : ''}">
          <span onclick="deleteTodo(${todo.id})">×</span>
          <span class="todo-item-text" onclick="markDone(${todo.id})">${todo.text}</span>
          <span onclick="markStarred(${todo.id})">${todo.isStarred ? '★' : '☆'}</span>
        </li>
      `
    );
  });
}

async function handleLogin(e) {
  e.preventDefault();

  let data = await api('post', '/auth/login', {
    email: document.querySelector('#email').value,
    password: document.querySelector('#password').value,
  });

  if (data.success) {
    // sessionId = data.payload.sessionId;
    // token = data.payload.token;
    // localStorage.setItem('sessionId', sessionId);
    // localStorage.setItem('token', token);
  }

  authResult.textContent = data.message;
}

async function handleCreateTodo(e) {
  e.preventDefault();

  await api('post', '/todo/create', {
    text: document.querySelector('#todo-text').value,
  });
  fetchAllTodos();
}

async function fetchAllTodos() {
  let data = await api('get', '/todo/list');
  renderTodos(data.payload.todos);
}

async function markDone(todoId) {
  await api('get', '/todo/update', {
    todoId,
    action: 'markDone',
  });
  fetchAllTodos();
}

async function markStarred(todoId) {
  await api('get', '/todo/update', {
    todoId,
    action: 'markStarred',
  });
  fetchAllTodos();
}

async function deleteTodo(todoId) {
  await api('get', '/todo/delete', {
    todoId,
  });
  fetchAllTodos();
}
