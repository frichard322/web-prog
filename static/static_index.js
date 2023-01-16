const events = {};

// eslint-disable-next-line no-unused-vars
function redirectToDetails(id) {
  window.location = `/view/event/event-details?id=${id}`;
}

// eslint-disable-next-line no-unused-vars
function showDetails(event, id) {
  event.preventDefault();
  if (!events[id]) {
    events[id] = id;
    fetch(`/api/event/event-listOfOrganizers?id=${id}`)
      .then(async (response) => {
        const div = document.getElementById(id);
        const { organizersList } = (await response.json()).event;
        div.appendChild(document.createTextNode(`organizersList: ${organizersList}`));
        div.appendChild(document.createElement('br'));
      });
  } else {
    delete events[id];
    const div = document.getElementById(id);
    div.lastChild.remove();
    div.lastChild.remove();
  }
}

// eslint-disable-next-line no-unused-vars
async function deleteEvent(id) {
  try {
    // eslint-disable-next-line no-undef
    const result = await axios.delete(`/api/event/delete-event?eventId=${id}`);
    if (result.status === 204) {
      document.getElementById(id).parentElement.remove();
    }
    if (!document.getElementById('event-div')) {
      window.location.reload();
    }
  } catch (err) {
    console.log(err);
  }
}
