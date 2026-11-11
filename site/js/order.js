import { TEAS, BOX, SET, byId } from './data.js';
import { store, vnd } from './util.js';

const KEY = 'suong-order';

/** pre-order only: price updates live, nothing is charged, nothing is sent */
export function initOrder(scrollTo) {
  const form = document.getElementById('order');
  const total = form.querySelector('[data-total]');
  const line = form.querySelector('[data-line]');
  const sizes = form.querySelector('.order__sizes');
  const qty = form.querySelector('[name=qty]');
  const note = document.getElementById('orderNote');

  let saved = {};
  try { saved = JSON.parse(store.get(KEY) || '{}') || {}; } catch { saved = {}; }
  const valid = (id) => id === BOX.id || TEAS.some((t) => t.id === id);
  const state = {
    tea: valid(saved.tea) ? saved.tea : 'luc',
    size: saved.size === 100 ? 100 : 50,
    qty: Math.min(9, Math.max(1, parseInt(saved.qty, 10) || 1)),
    set: saved.set === true,
  };

  const unit = () => (state.tea === BOX.id ? BOX.price : byId(state.tea)[state.size === 100 ? 'price100' : 'price50']);
  const render = () => {
    form.querySelector(`[name=tea][value="${state.tea}"]`).checked = true;
    form.querySelector(`[name=size][value="${state.size}"]`).checked = true;
    qty.value = state.qty;
    form.querySelector('[name=set]').checked = state.set;
    const isBox = state.tea === BOX.id;
    sizes.hidden = isBox;
    const name = isBox ? `${BOX.name} (${BOX.detail})` : `${byId(state.tea).name}, ${state.size} g`;
    line.textContent = `${state.qty} × ${name}${state.set ? ` + ${SET.name}` : ''}`;
    total.textContent = vnd(unit() * state.qty + (state.set ? SET.price : 0));
    store.set(KEY, JSON.stringify(state));
  };

  form.addEventListener('change', (e) => {
    const { name, value, checked } = e.target;
    if (name === 'tea') state.tea = value;
    if (name === 'size') state.size = Number(value);
    if (name === 'set') state.set = checked;
    if (name === 'qty') state.qty = Math.min(9, Math.max(1, parseInt(value, 10) || 1));
    note.hidden = true;
    render();
  });
  form.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    state.qty = Math.min(9, Math.max(1, state.qty + Number(b.dataset.step)));
    note.hidden = true;
    render();
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.hidden = false;
    note.focus();
  });
  window.addEventListener('suong:pick', (e) => {
    state.tea = e.detail;
    render();
    scrollTo(document.getElementById('dat'));
  });
  render();
}
