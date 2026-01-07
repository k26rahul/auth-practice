const html = String.raw;

let sessionId = localStorage.getItem('sessionId');
let token = localStorage.getItem('token');

if (sessionId && token) {
  document.querySelector('#auth-result').textContent = 'Already logged in';
}

document.querySelector('#login-form').addEventListener('submit', handleLogin);
document.querySelector('#todo-form').addEventListener('submit', handleTodoCreate);

function renderTodos(todos) {
  const list = document.querySelector('#todo-list');
  list.innerHTML = '';

  todos.forEach(todo => {
    list.insertAdjacentHTML(
      'beforeend',
      html`
        <li>
          <span class="${todo.isDone ? 'done' : ''}" onclick="markDone(${todo.id})">
            ${todo.text}
          </span>

          <span class="star" onclick="markStarred(${todo.id})">
            ${todo.isStarred ? '★' : '☆'}
          </span>
        </li>
      `
    );
  });
}

async function api(method, endpoint, params = {}) {
  const options = {
    method: method,
  };

  let url;

  if (method == 'get') {
    const query = new URLSearchParams({
      ...params,
      sessionId,
      token,
    }).toString();

    url = `http://127.0.0.1:5000${endpoint}?${query}`;
  }

  if (method == 'post') {
    options.headers = {
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify(params);

    url = `http://127.0.0.1:5000${endpoint}`;
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (data.success) {
    console.log(data);
  } else {
    console.error(data);
  }
  return data;
}

async function handleLogin(e) {
  e.preventDefault();

  const data = await api('post', '/auth/login', {
    email: document.querySelector('#email').value,
    password: document.querySelector('#password').value,
  });

  if (data.success) {
    sessionId = data.payload.sessionId;
    token = data.payload.token;
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('token', token);
  }

  document.querySelector('#auth-result').textContent = data.message;
}

async function handleTodoCreate(e) {
  e.preventDefault();

  await api('get', '/todo/create', {
    text: document.querySelector('#todo-text').value,
  });

  fetchTodos();
}

async function fetchTodos() {
  const data = await api('get', '/todo/list');
  renderTodos(data.payload || []);
}

async function markDone(id) {
  await api('get', '/todo/update', {
    todoId: id,
    action: 'markDone',
  });
  fetchTodos();
}

async function markStarred(id) {
  await api('get', '/todo/update', {
    todoId: id,
    action: 'markStarred',
  });
  fetchTodos();
}
