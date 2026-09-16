const menuList = document.getElementById('menu-list');

const categoryLabels = {
  momo: 'Momos',
  noodles: 'Noodles',
};

function renderMenu() {
  const grouped = {};
  menu.forEach(function (item) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  let html = '';

  Object.keys(grouped).forEach(function (category) {
    html += `<h3 class="menu-group-title">${categoryLabels[category] || category}</h3>`;
    html += '<div class="menu-group">';

    grouped[category].forEach(function (item) {
      const piecesLine = item.category === 'momo'
        ? `<p class="pieces">${item.pieces} pcs</p>`
        : '';

      html += `
        <article class="menu-card">
          <h4><span class="dot ${item.isVeg ? 'veg' : 'nonveg'}"></span>${item.name}</h4>
          ${piecesLine}
          <p class="price">Rs ${item.price}</p>
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-id="${item.id}" data-action="minus">−</button>
            <span class="qty" id="qty-${item.id}">0</span>
            <button type="button" class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
          </div>
        </article>
      `;
    });

    html += '</div>';
  });

  menuList.innerHTML = html;
}

renderMenu();

const cart = {};
menu.forEach(function (item) {
  cart[item.id] = 0;
});

const cartLines = document.getElementById('cart-lines');
const cartTotal = document.getElementById('cart-total');

menuList.addEventListener('click', function (event) {
  const btn = event.target.closest('.qty-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'plus') {
    cart[id] = cart[id] + 1;
  } else if (action === 'minus' && cart[id] > 0) {
    cart[id] = cart[id] - 1;
  }

  render();
});

function render() {
  let total = 0;
  let linesHTML = '';

  menu.forEach(function (item) {
    const qty = cart[item.id];

    document.getElementById('qty-' + item.id).textContent = qty;

    if (qty > 0) {
      const lineTotal = item.price * qty;
      total = total + lineTotal;
      linesHTML += `<p class="cart-line">${item.name} x ${qty} — Rs ${lineTotal}</p>`;
    }
  });

  if (linesHTML === '') {
    linesHTML = '<p class="empty">No items selected yet.</p>';
  }

  cartLines.innerHTML = linesHTML;
  cartTotal.textContent = total;
}

render();


function getCustomerDetails() {
    const name = document.getElementById('customer-name').value;
    const wing = document.getElementById('wing').value;
    const flat = document.getElementById('flat').value;
    const phone = document.getElementById('phone').value;
    const notes = document.getElementById('notes').value;
  
  return { name, wing, flat, phone, notes };
}

function validateOrder() {
  const details = getCustomerDetails();

  let itemCount = 0;
  menu.forEach(function (item) {
    itemCount = itemCount + cart[item.id];
  });

  if (itemCount === 0) {
    showToast('Pick at least one plate to continue.');
    return false;
  }
  if (details.name === '') {
    showToast('Add your name so we know whose order this is.');
    flagField('customer-name');
    return false;
  }
  if (details.wing === '') {
    showToast('Select your wing.');
    flagField('wing');
    return false;
  }
  if (details.flat === '') {
    showToast('Add your flat number for delivery.');
    flagField('flat');
    return false;
  }
  if (details.phone.length !== 10) {
    showToast('Enter a 10-digit mobile number.');
    flagField('phone');
    return false;
  }

  return true;
}

const submitBtn = document.getElementById('submit-order');

submitBtn.addEventListener('click', function () {
  if (!isOrderWindowOpen()) {
    showToast(closedWindowMessage());
    return;
  }

  if (!validateOrder()) {
    return;
  }

  const message = buildMessage();
  const url = 'https://wa.me/918104234623?text=' + encodeURIComponent(message);
  window.open(url, '_blank');
});

function buildMessage() {
  const details = getCustomerDetails();

  let lines = '';
  let total = 0;

  menu.forEach(function (item) {
    const qty = cart[item.id];
    if (qty > 0) {
      const lineTotal = item.price * qty;
      total = total + lineTotal;
      const pieceInfo = item.category === 'momo' ? ` (${item.pieces} pcs)` : '';
      lines += `• ${item.name}${pieceInfo} x${qty} = Rs ${lineTotal}\n`;
    }
  });

  const placed = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = 'NEW ORDER\n\n';
  message += 'ORDER\n';
  message += lines;
  message += `TOTAL: Rs ${total}\n\n`;
  message += 'CUSTOMER\n';
  message += `Name: ${details.name}\n`;
  message += `Wing: ${details.wing}\n`;
  message += `Flat: ${details.flat}\n`;
  message += `Phone: ${details.phone}\n`;

  if (details.notes !== '') {
    message += `Notes: ${details.notes}\n`;
  }

  message += `\nPlaced: ${placed}`;

  return message;
}

function getKolkataDayAndHour() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date());

  const weekday = parts.find(function (p) { return p.type === 'weekday'; }).value;
  let hour = Number(parts.find(function (p) { return p.type === 'hour'; }).value);
  if (hour === 24) hour = 0;

  return { weekday, hour };
}

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const WEEKDAY_NAME = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };

// ponytail: assumes the open mark falls before the close mark in the same Sun-Sat
// week (true for Thu->Fri). A window that wraps past Saturday into Sunday would
// need an extra branch: nowMark >= openMark || nowMark < closeMark.
function isOrderWindowOpen() {
  const { weekday, hour } = getKolkataDayAndHour();
  const nowMark = WEEKDAY_INDEX[weekday] * 24 + hour;
  const openMark = WEEKDAY_INDEX[ORDER_OPEN_DAY] * 24 + ORDER_OPEN_HOUR;
  const closeMark = WEEKDAY_INDEX[ORDER_CLOSE_DAY] * 24 + ORDER_CLOSE_HOUR;
  return nowMark >= openMark && nowMark < closeMark;
}

function formatHourLabel(hour) {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return displayHour + ':00 ' + period;
}

function closedWindowMessage() {
  return 'Orders open ' + WEEKDAY_NAME[ORDER_OPEN_DAY] + ', ' + formatHourLabel(ORDER_OPEN_HOUR) + ' – ' + WEEKDAY_NAME[ORDER_CLOSE_DAY] + ', ' + formatHourLabel(ORDER_CLOSE_HOUR) + '.';
}

function applyOrderWindow() {
  const banner = document.getElementById('order-status');
  const isOpen = isOrderWindowOpen();

  if (isOpen) {
    banner.textContent = 'Orders open until ' + formatHourLabel(ORDER_CLOSE_HOUR) + ' ' + WEEKDAY_NAME[ORDER_CLOSE_DAY] + '.';
    banner.className = 'status-banner open';
  } else {
    banner.textContent = closedWindowMessage();
    banner.className = 'status-banner closed';
    submitBtn.classList.add('closed');
    submitBtn.setAttribute('aria-disabled', 'true');
  }
}

applyOrderWindow();


const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}

function flagField(id) {
  const field = document.getElementById(id);
  field.classList.add('field-error');
  field.focus();
  field.addEventListener('input', function () {
    field.classList.remove('field-error');
  }, { once: true });
}