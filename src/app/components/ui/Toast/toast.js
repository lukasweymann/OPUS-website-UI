const listeners = new Set();
const timers = new Map();

let toasts = [];
let nextId = 1;

function notify() {
  listeners.forEach((listener) => listener());
}

function remove(id) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  toasts = toasts.filter((toast) => toast.id !== id);
  notify();
}

function push(type, message, options = {}) {
  const id = nextId;
  nextId += 1;

  const toast = {
    id,
    type,
    message,
  };

  const nextToasts = [toast, ...toasts];
  nextToasts.slice(4).forEach((item) => {
    const timer = timers.get(item.id);
    if (timer) clearTimeout(timer);
    timers.delete(item.id);
  });

  toasts = nextToasts.slice(0, 4);
  notify();

  const duration = options.duration ?? 3600;
  if (duration > 0) {
    timers.set(id, setTimeout(() => remove(id), duration));
  }

  return id;
}

export const toast = {
  success(message, options) {
    return push("success", message, options);
  },
  error(message, options) {
    return push("error", message, options);
  },
  dismiss(id) {
    if (id == null) {
      toasts.forEach((item) => remove(item.id));
      return;
    }
    remove(id);
  },
};

export function getToasts() {
  return toasts;
}

export function subscribeToToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
