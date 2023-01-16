function hideButtons() {
  document.getElementById('grant-button').style.display = 'none';
  document.getElementById('deny-button').style.display = 'none';
  document.getElementById('delete-button').style.display = 'none';
}

// eslint-disable-next-line no-unused-vars
function changeCategory() {
  if (document.getElementById('category-selector').value === 'users') {
    document.getElementById('users-panel').style.display = 'block';
    document.getElementById('events-panel').style.display = 'none';
  } else if (document.getElementById('category-selector').value === 'events') {
    document.getElementById('users-panel').style.display = 'none';
    document.getElementById('events-panel').style.display = 'block';
  }
}

// eslint-disable-next-line no-unused-vars
function changeUser() {
  const { value } = document.getElementById('user-selector');
  if (value !== 'none') {
    if (value.split('+')[1] === 'organizer') {
      document.getElementById('grant-button').style.display = 'inline-block';
      document.getElementById('deny-button').style.display = 'none';
    } else if (value.split('+')[1] === 'admin') {
      document.getElementById('grant-button').style.display = 'none';
      document.getElementById('deny-button').style.display = 'inline-block';
    }
    document.getElementById('delete-button').style.display = 'inline-block';
  } else {
    hideButtons();
  }
}

// eslint-disable-next-line no-unused-vars
async function grantPermission() {
  const id = document.getElementById('user-selector').value.split('+')[0];
  try {
    // eslint-disable-next-line no-undef
    const result = await axios.put('/api/user/change-role', {
      userId: id,
      role: 'admin',
    });
    if (result.status === 204) {
      document.getElementById(id).value = id.concat('+admin');
      document.getElementById('grant-button').style.display = 'none';
      document.getElementById('deny-button').style.display = 'inline-block';
    }
  } catch (err) {
    console.log(err);
  }
}

// eslint-disable-next-line no-unused-vars
async function denyPermission() {
  const id = document.getElementById('user-selector').value.split('+')[0];
  try {
    // eslint-disable-next-line no-undef
    const result = await axios.put('/api/user/change-role', {
      userId: id,
      role: 'organizer',
    });
    if (result.status === 204) {
      document.getElementById(id).value = id.concat('+organizer');
      document.getElementById('grant-button').style.display = 'inline-block';
      document.getElementById('deny-button').style.display = 'none';
    }
  } catch (err) {
    console.log(err);
  }
}

// eslint-disable-next-line no-unused-vars
async function deleteUser() {
  const id = document.getElementById('user-selector').value.split('+')[0];
  try {
    // eslint-disable-next-line no-undef
    const result = await axios.delete('/api/user/delete-user', { data: { userId: id } });
    if (result.status === 204) {
      document.getElementById(id).remove();
    }
    document.getElementById('user-selector').value = 'none';
    hideButtons();
  } catch (err) {
    console.log(err);
  }
}

// eslint-disable-next-line no-unused-vars
async function submitTask() {
  try {
    // eslint-disable-next-line no-undef
    const result = await axios.post('/api/event/create-task', {
      eventId: document.getElementById('event-selector-task').value,
      name: document.getElementById('name').value,
    });
    if (result.status === 204) {
      // eslint-disable-next-line no-alert
      alert('Task has been successfully created!');
    }
    document.getElementById('task-form').style.display = 'none';
    document.getElementById('operation-selector').value = 'none';
    document.getElementById('name').value = '';
  } catch (err) {
    console.log(err);
  }
}

// eslint-disable-next-line no-unused-vars
function changeOperation() {
  const { value } = document.getElementById('operation-selector');
  if (value === 'create task') {
    document.getElementById('task-form').style.display = 'block';
  } else {
    document.getElementById('task-form').style.display = 'none';
  }
  if (value === 'stats') {
    document.getElementById('stats-form').style.display = 'block';
  } else {
    document.getElementById('stats-form').style.display = 'none';
  }
}

// eslint-disable-next-line no-unused-vars
async function changeStats() {
  const { value } = document.getElementById('event-selector-stats');
  if (value === 'none') {
    document.getElementById('stats').style.display = 'none';
    document.getElementById('solved-count').textContent = '';
    document.getElementById('unsolved-count').textContent = '';
  } else {
    try {
      // eslint-disable-next-line no-undef
      const result = await axios(`/api/event/task-stats?eventId=${value}`);
      if (result.status === 200) {
        document.getElementById('solved-count').textContent = result.data.solved;
        document.getElementById('unsolved-count').textContent = result.data.unsolved;
        document.getElementById('stats').style.display = 'block';
      }
    } catch (err) {
      console.log(err);
    }
  }
}
