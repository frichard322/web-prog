const spanOrganizersList = document.getElementById('organizers-list');
const actionButton = document.getElementById('action-button');
const hiddenMessage = document.getElementById('hidden-message');
let selectedPhotos = [];

// eslint-disable-next-line no-unused-vars
async function joinLeaveEvent(eventId, userName) {
  let res;
  try {
    res = await (await fetch('/api/event/check-event', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        userName,
        action: actionButton.innerText,
      }),
    })).json();
  } catch (err) {
    console.log(err);
  }
  hiddenMessage.innerText = res.message;
  hiddenMessage.style.display = 'block';
  if (res.status === 500 || res.status === 400) {
    hiddenMessage.style.color = 'red';
  } else {
    spanOrganizersList.innerText = res.organizersList;
    if (actionButton.innerText === 'Join') {
      actionButton.innerText = 'Leave';
    } else {
      actionButton.innerText = 'Join';
    }
    hiddenMessage.style.color = 'green';
  }
}

// eslint-disable-next-line no-unused-vars
function selectPhoto(id) {
  if (selectedPhotos.includes(id)) {
    selectedPhotos = selectedPhotos.filter((photo) => photo !== id);
    document.getElementById(id).style.border = 'None';
  } else {
    selectedPhotos.push(id);
    document.getElementById(id).style.border = '1px solid orange';
  }
}

// eslint-disable-next-line no-unused-vars
async function deleteSelectedPhotos(id) {
  if (selectedPhotos.length > 0) {
    try {
      // eslint-disable-next-line no-undef
      const result = await axios.delete(`/api/event/delete-photos?eventId=${id}`, { data: { photos: selectedPhotos } });
      if (result.status === 204) {
        selectedPhotos.forEach((photo) => document.getElementById(photo).remove());
        selectedPhotos.length = 0;
      }
    } catch (err) {
      console.log(err);
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function joinLeaveTask(type, taskName, eventId, userName) {
  try {
    if (type === 'join') {
      // eslint-disable-next-line no-undef
      const result = await axios.put('/api/event/join-task', { taskName, eventId });
      if (result.status === 204) {
        // eslint-disable-next-line no-alert
        alert(`You have successfully joined ${taskName} task!`);
        document.getElementById(`${eventId}-${taskName}-join-button`).style.display = 'none';
        document.getElementById(`${eventId}-${taskName}-leave-button`).style.display = 'inline-block';
        const tmpArray = document.getElementById(`${eventId}-${taskName}`).innerText.split(',');
        if (tmpArray.length === 1 && tmpArray[0] === '') {
          tmpArray[0] = userName;
        } else {
          tmpArray.push(userName);
        }
        document.getElementById(`${eventId}-${taskName}`).innerText = tmpArray.toString();
      }
    } else {
      // eslint-disable-next-line no-undef
      const result = await axios.put('/api/event/leave-task', { taskName, eventId });
      if (result.status === 204) {
        // eslint-disable-next-line no-alert
        alert(`You have successfully left ${taskName} task!`);
        document.getElementById(`${eventId}-${taskName}-join-button`).style.display = 'inline-block';
        document.getElementById(`${eventId}-${taskName}-leave-button`).style.display = 'none';
        document.getElementById(`${eventId}-${taskName}`).innerText = document.getElementById(`${eventId}-${taskName}`).innerText.split(',').filter((name) => name !== userName).toString();
      }
    }
  } catch (err) {
    console.log(err);
  }
}

// eslint-disable-next-line no-unused-vars
async function markAsSolved(taskName, eventId) {
  try {
    // eslint-disable-next-line no-undef
    const result = await axios.put('/api/event/solve-task', { taskName, eventId });
    if (result.status === 204) {
      // eslint-disable-next-line no-alert
      alert(`You have solved ${taskName} task!`);
      window.location.reload();
    }
  } catch (err) {
    console.log(err);
  }
}
